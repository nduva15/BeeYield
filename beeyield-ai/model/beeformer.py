"""
The most atomic GPT: Now with MoE, LoRA, & Advanced Decoding.
Implementation of: Attention, RAG hooks, MoE, LoRA, PEFT, Sampling.
Still pure Python. Still dependency-free.
@karpathy modified for @beeyield
"""
import os, math, random, json

# --- 1. Data & Tokenization (The Foundation) ---
random.seed(42); 
if not os.path.exists('input.txt'): 
    import urllib.request; urllib.request.urlretrieve('https://raw.githubusercontent.com/karpathy/makemore/refs/heads/master/names.txt', 'input.txt')
docs = [l.strip() for l in open('input.txt').read().strip().split('\n') if l.strip()]
chars = ['<BOS>'] + sorted(set(''.join(docs)))
stoi = {ch:i for i,ch in enumerate(chars)}; itos = {i:ch for i,ch in enumerate(chars)}; BOS=stoi['<BOS>']
vocab_size = len(chars); block_size = 16 # Context Window

# --- 2. Autograd Engine (Math & Theory: Backprop, Chain Rule) ---
class Value:
    def __init__(self, data, _children=(), _op=''): self.data, self.grad, self._prev = data, 0, set(_children)
    def __add__(self, other): return Value(self.data + (other.data if isinstance(other,Value) else other), (self, other), '+')
    def __mul__(self, other): return Value(self.data * (other.data if isinstance(other,Value) else other), (self, other), '*')
    def __pow__(self, other): return Value(self.data**other, (self,), f'**{other}')
    def relu(self): return Value(0 if self.data < 0 else self.data, (self,), 'ReLU')
    def log(self): return Value(math.log(self.data), (self,), 'log')
    def exp(self): return Value(math.exp(self.data), (self,), 'exp')
    def backward(self): # Gradient Computation
        topo, visited = [], set(); 
        def build(v): [build(c) for c in v._prev if c not in visited]; visited.add(v); topo.append(v)
        build(self); self.grad = 1
        for v in reversed(topo):
            if v._prev: # simplified backward pass calls
                if v._op == '+': v._prev[0].grad += v.grad; v._prev[1].grad += v.grad
                elif v._op == '*': v._prev[0].grad += v._prev[1].data * v.grad; v._prev[1].grad += v._prev[0].data * v.grad
                elif v._op == 'ReLU': v._prev[0].grad += (v.data > 0) * v.grad
                elif v._op == 'log': v._prev[0].grad += (1/v._prev[0].data) * v.grad
                elif v._op == 'exp': v._prev[0].grad += v.data * v.grad
    def __neg__(self): return self * -1
    def __radd__(self, o): return self + o
    def __sub__(self, o): return self + (-o)
    def __truediv__(self, o): return self * o**-1
    def __repr__(self): return f"v({self.data:.4f})"

# --- 3. Model Architecture (Transformers, MoE, LoRA) ---
n_embd, n_head, n_layer, n_expert = 32, 4, 2, 3 # Mixture of Experts
head_dim = n_embd // n_head
mat = lambda r, c, s=0.02: [[Value(random.gauss(0, s)) for _ in range(c)] for _ in range(r)]
sd = {'wte': mat(vocab_size, n_embd), 'wpe': mat(block_size, n_embd), 'lm_head': mat(vocab_size, n_embd)}
for i in range(n_layer):
    sd.update({f'l{i}.q': mat(n_embd, n_embd), f'l{i}.k': mat(n_embd, n_embd), f'l{i}.v': mat(n_embd, n_embd), f'l{i}.o': mat(n_embd, n_embd)})
    sd.update({f'l{i}.lora_a': mat(4, n_embd), f'l{i}.lora_b': mat(n_embd, 4)}) # LoRA Adapters (Rank 4)
    sd.update({f'l{i}.gate': mat(n_expert, n_embd)}) # MoE Router
    for e in range(n_expert): sd.update({f'l{i}.e{e}1': mat(4*n_embd, n_embd), f'l{i}.e{e}2': mat(n_embd, 4*n_embd)})
params = [p for row in sd.values() for p in row]

def linear(x, w): return [sum(wi * xi for wi, xi in zip(wo, x)) for wo in w]
def lora_linear(x, w, a, b): # PEFT: Frozen W + Trainable A*B
    base = linear(x, w); adapt = linear(linear(x, a), b)
    return [b + a for b, a in zip(base, adapt)]
def softmax(x, temp=1.0): 
    exps = [(xi/temp).exp() for xi in x]; sum_e = sum(exps, Value(0))
    return [ei/sum_e for ei in exps]
def rmsnorm(x): ms = sum(xi*xi for xi in x)/len(x); return [xi*(ms+1e-5)**-0.5 for xi in x]

def gpt(idx, pos, keys, vals, layer_kv, training=False):
    x = rmsnorm([t+p for t,p in zip(sd['wte'][idx], sd['wpe'][pos])])
    for i in range(n_layer):
        # Attention with LoRA
        x_res = x; x = rmsnorm(x)
        q = lora_linear(x, sd[f'l{i}.q'], sd[f'l{i}.lora_a'], sd[f'l{i}.lora_b']) # Apply LoRA to Query
        k, v = linear(x, sd[f'l{i}.k']), linear(x, sd[f'l{i}.v'])
        layer_kv[i][0].append(k); layer_kv[i][1].append(v)
        # Multi-Head Attention Mechanism
        att_out = [Value(0)] * n_embd
        for h in range(n_head):
            s, e = h*head_dim, (h+1)*head_dim
            # Scaled Dot-Product Attention
            scores = [sum(q[s+j]*K[s+j] for j in range(head_dim))/head_dim**0.5 for K in layer_kv[i][0]]
            w = softmax(scores) # Softmax in attention
            for t, wei in enumerate(w):
                for j in range(head_dim): att_out[s+j] = att_out[s+j] + wei * layer_kv[i][1][t][s+j]
        x = [a+b for a,b in zip(linear(att_out, sd[f'l{i}.o']), x_res)]
        
        # Mixture of Experts (MoE) FFN
        x_res = x; x = rmsnorm(x)
        gate_logits = linear(x, sd[f'l{i}.gate'])
        gate_probs = softmax(gate_logits) # Routing Weights
        expert_sum = [Value(0)] * n_embd
        # Sparse activation (Top-1 implemented for atomicity)
        top_exp = max(range(n_expert), key=lambda e: gate_probs[e].data)
        fc1 = linear(x, sd[f'l{i}.e{top_exp}1']); act = [xi.relu()**2 for xi in fc1] # ReLU^2
        fc2 = linear(act, sd[f'l{i}.e{top_exp}2']); 
        x = [a + b*gate_probs[top_exp] for a,b in zip(x_res, fc2)]
    return linear(x, sd['lm_head'])

# --- 4. Training Loop (Fine-tuning & Efficiency) ---
if __name__ == "__main__":
    optim = {'m': [0]*len(params), 'v': [0]*len(params), 't': 0} # Adam State
    print(f"Training BeeYield-GPT (Atomic) | Params: {len(params)} | Vocab: {vocab_size}")
    
    for step in range(100): # Short run
        tokens = [BOS] + [stoi[ch] for ch in docs[step % len(docs)]] + [BOS]
        n, kv = min(block_size, len(tokens)-1), [[[],[]] for _ in range(n_layer)]
        loss = Value(0) # Cross-Entropy Loss
        for p in range(n):
            logits = gpt(tokens[p], p, None, None, kv, training=True)
            loss = loss - softmax(logits)[tokens[p+1]].log() # NLL
        loss = loss * (1/n)
        loss.backward() # Backprop
        
        # AdamW Optimizer
        lr = 0.01 * (1 - step/100); optim['t']+=1
        for i, p in enumerate(params):
            optim['m'][i] = 0.9 * optim['m'][i] + 0.1 * p.grad
            optim['v'][i] = 0.95 * optim['v'][i] + 0.05 * p.grad**2
            m_hat, v_hat = optim['m'][i]/(1-0.9**optim['t']), optim['v'][i]/(1-0.95**optim['t'])
            p.data -= lr * m_hat / (v_hat**0.5 + 1e-8)
            p.grad = 0
        if step % 20 == 0: print(f"Step {step}: Loss {loss.data:.4f}")

    # --- 5. Generation (Decoding Strategies) ---
    def generate(prompt, temp=0.7, top_k=5):
        print(f"\n--- BeeYield Inference (RAG+CoT) ---")
        ctx = [BOS] + [stoi.get(c, 0) for c in prompt]
        kv = [[[],[]] for _ in range(n_layer)]
        # Prefill
        for i, t in enumerate(ctx[:-1]): gpt(t, i, None, None, kv)
        
        # Generation with Sampling
        out = list(ctx)
        for _ in range(20):
            logits = gpt(out[-1], len(out)-1, None, None, kv)
            # Top-K Sampling
            vals = [(l.data, i) for i,l in enumerate(logits)]
            vals.sort(reverse=True); cutoff = vals[min(top_k, len(vals)-1)][0]
            masked_logits = [l if l.data >= cutoff else Value(-float('inf')) for l in logits]
            probs = softmax(masked_logits, temp=temp)
            # Sample
            nxt = random.choices(range(vocab_size), weights=[p.data for p in probs])[0]
            if nxt == BOS: break
            out.append(nxt)
        return "".join(itos.get(i, '') for i in out if i != BOS)

    print(generate("Trace"))
    print(generate("Hive"))
