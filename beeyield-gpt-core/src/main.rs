use tokenizers::models::bpe::{BpeTrainerBuilder, BPE};
use tokenizers::pre_tokenizers::byte_level::ByteLevel;
use tokenizers::tokenizer::{Result, TokenizerImpl};
use tokenizers::AddedToken;

fn main() -> Result<()> {
    println!("🐝 Starting BeeYield BPE Tokenizer Training...");

    // 1. Initialize a BPE model used by GPT-2/3/4
    let model = BPE::default();
    let mut tokenizer = TokenizerImpl::new(model);

    // 2. Customize Pre-tokenizer (ByteLevel handles raw bytes/unicode gracefully)
    tokenizer.with_pre_tokenizer(ByteLevel::default());

    // 3. Configure the Trainer
    // tailored for beekeeping domains - specific terms become single tokens.
    let mut trainer = BpeTrainerBuilder::new()
        .show_progress(true)
        .vocab_size(30000) 
        .min_frequency(2)
        .special_tokens(vec![
            AddedToken::from(String::from("<s>"), true),
            AddedToken::from(String::from("<pad>"), true),
            AddedToken::from(String::from("</s>"), true),
            AddedToken::from(String::from("<unk>"), true),
            AddedToken::from(String::from("<mask>"), true),
        ])
        .build();

    // 4. Load Data
    // We train on the provided input.txt as a starter dataset.
    // In production, this list would include the 25,000 dataset paths.
    let files = vec!["../input.txt".to_string()];
    
    println!("📚 Training on files: {:?}", files);
    
    // 5. Train
    tokenizer.train_from_files(&mut trainer, files)?;

    // 6. Save
    tokenizer.save("beeyield_tokenizer.json", false)?;
    println!("✅ Tokenizer saved to 'beeyield_tokenizer.json'");

    // 7. Test Inference
    // Prove it learned domain terms
    let test_sentence = "The treatment for Varroa destructor in Nairobi is effective.";
    let encoding = tokenizer.encode(test_sentence, false)?;
    
    println!("\n🔍 Test Inference:");
    println!("Input: '{}'", test_sentence);
    println!("Tokens: {:?}", encoding.get_tokens());
    println!("IDs: {:?}", encoding.get_ids());

    Ok(())
}
