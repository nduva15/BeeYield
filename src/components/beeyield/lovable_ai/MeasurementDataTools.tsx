import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  X, Cpu, Usb, Bluetooth, Wifi, Plus, Trash2, ScanLine, ArrowLeft, ArrowRight, Check,
  Loader2, Thermometer, Droplets, Scale, BatteryCharging, MapPin, Boxes, Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Apiary = { id: string; name: string; add_mode: string; latitude: number | null; longitude: number | null };
type Hive = {
  id: string; apiary_id: string; name: string; max_brood_frames: number; hygienic_bottom_board: boolean;
  queen_breeding_year: number | null; queen_origin: string | null; queen_insemination: string | null;
};
type Device = {
  id: string; apiary_id: string | null; hive_id: string | null; device_kind: string; link_type: string;
  serial: string; label: string | null; status: string; battery_pct: number | null; last_seen_at: string | null;
};
type Measurement = {
  id: string; device_id: string | null; hive_id: string | null; recorded_at: string; source: string;
  temperature_c: number | null; humidity_pct: number | null; weight_kg: number | null; battery_pct: number | null;
};

const QUEEN_YEAR_COLORS: Record<number, string> = { 0: "#f5f5f5", 1: "#f6c945", 2: "#e05a4a", 3: "#4aa564", 4: "#4a7fe0" };
const queenYears = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i);
const yearColor = (y: number) => QUEEN_YEAR_COLORS[y % 5] ?? "#d8d3c8";

/* ------------------------------------------------------------------ QR scanner */

function QrScanner({ onResult, onCancel }: { onResult: (text: string) => void; onCancel: () => void }) {
  const elId = useId();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode(elId);
    scannerRef.current = scanner;
    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          void scanner.stop().catch(() => undefined);
          onResult(decoded);
        },
        () => undefined,
      )
      .catch((e) => setErr(e instanceof Error ? e.message : "Camera unavailable"));
    return () => {
      if (scanner.isScanning) void scanner.stop().catch(() => undefined);
    };
  }, [elId, onResult]);

  return (
    <div className="space-y-3">
      <div className="rounded-xl overflow-hidden border-2 border-honey/60 bg-black/80" id={elId} />
      {err && (
        <p className="text-xs text-destructive">
          {err} — enter the serial manually below instead.
        </p>
      )}
      <Button variant="outline" size="sm" onClick={onCancel} className="w-full">Cancel scan</Button>
    </div>
  );
}

/* ------------------------------------------------------------------ shared bits */

function WizardNav({ onCancel, onBack, onNext, nextLabel, nextDisabled, done }: {
  onCancel: () => void; onBack?: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean; done?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4">
      <button onClick={onCancel} className="w-14 h-11 rounded-full border border-border flex items-center justify-center hover:bg-muted" title="Cancel">
        <X className="w-4 h-4" />
      </button>
      <button
        onClick={onBack}
        disabled={!onBack}
        className="w-14 h-11 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30"
        title="Back"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="px-7 h-11 rounded-full bg-gradient-amber text-primary-foreground flex items-center gap-2 font-medium disabled:opacity-40"
        title={nextLabel ?? "Next"}
      >
        {done ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        {nextLabel && <span className="text-sm">{nextLabel}</span>}
      </button>
    </div>
  );
}

function ScanField({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  const [scanning, setScanning] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label>{label}</Label>
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Scan or type serial" />
        </div>
        <button
          onClick={() => setScanning((s) => !s)}
          className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-honey hover:bg-muted"
          title="Scan QR code from device"
        >
          <ScanLine className="w-5 h-5" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
      {scanning && (
        <QrScanner
          onResult={(t) => { onChange(t.trim()); setScanning(false); toast.success("QR captured"); }}
          onCancel={() => setScanning(false)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Add apiary */

function AddApiaryWizard({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"with_devices" | "without_devices">("with_devices");
  const [hubSerial, setHubSerial] = useState("");
  const [code, setCode] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("apiaries")
      .insert({
        user_id: user.id,
        name: name.trim(),
        add_mode: mode,
        latitude: lat ? Number(lat) : null,
        longitude: lng ? Number(lng) : null,
      })
      .select("id")
      .single();
    if (error || !data) { setSaving(false); toast.error(error?.message ?? "Could not save apiary"); return; }

    if (mode === "with_devices" && hubSerial.trim()) {
      const { error: dErr } = await supabase.from("devices").insert({
        user_id: user.id,
        apiary_id: data.id,
        device_kind: "hub",
        link_type: "online",
        serial: hubSerial.trim(),
        confirmation_code: code.trim() || null,
        label: `${name.trim()} Hub`,
        status: code.trim() ? "active" : "pending",
      });
      if (dErr) toast.error(`Apiary saved, hub failed: ${dErr.message}`);
    }
    setSaving(false);
    toast.success("Apiary added");
    onDone();
  };

  return (
    <div className="max-w-lg mx-auto">
      <h3 className="text-center font-display text-2xl font-bold mb-8">Add apiary</h3>

      {step === 0 && (
        <div className="space-y-6">
          <div>
            <Label className="text-base">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="border-0 border-b rounded-none px-0 text-lg focus-visible:ring-0" placeholder="Kibwezi Yard" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-3">How do you want to add the apiary?</p>
            {(["with_devices", "without_devices"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`w-full rounded-xl py-4 mb-3 border text-base font-medium flex items-center justify-center gap-2 transition-all ${
                  mode === m ? "bg-honey/30 border-honey text-foreground" : "border-border text-foreground hover:bg-muted"
                }`}
              >
                {mode === m && <Check className="w-4 h-4" />}
                {m === "with_devices" ? "With devices" : "Without devices"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Latitude</Label><Input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="-2.4078" /></div>
            <div><Label>Longitude</Label><Input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="37.9658" /></div>
          </div>
          <WizardNav
            onCancel={onCancel}
            onNext={() => (mode === "with_devices" ? setStep(1) : save())}
            nextDisabled={!name.trim() || saving}
            done={mode === "without_devices"}
          />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <p className="text-lg font-semibold">Scan the QR code from the Hub device</p>
          <div className="rounded-xl border border-dashed border-honey/50 bg-muted/40 p-6 text-sm text-muted-foreground">
            The Hub QR label sits on the back of the enclosure, next to the CE mark. Mount the Hub within 30 m
            line-of-sight of the hives, antenna upright, and power it before scanning.
          </div>
          <ScanField label="Hub" hint="Tap the icon to scan the QR code from the device." value={hubSerial} onChange={setHubSerial} />
          <div>
            <Label>Confirmation code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code shown on the Hub" />
          </div>
          <WizardNav onCancel={onCancel} onBack={() => setStep(0)} onNext={save} nextDisabled={!hubSerial.trim() || saving} done />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Add hive */

function AddHiveWizard({ apiaries, onDone, onCancel }: { apiaries: Apiary[]; onDone: () => void; onCancel: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [apiaryId, setApiaryId] = useState(apiaries[0]?.id ?? "");
  const [name, setName] = useState("");
  const [frames, setFrames] = useState("10");
  const [hygienic, setHygienic] = useState(false);
  const [queenYear, setQueenYear] = useState<string>("");
  const [origin, setOrigin] = useState("");
  const [insemination, setInsemination] = useState<"Natural" | "Artificial" | "Unknown">("Unknown");
  const [sensorSerial, setSensorSerial] = useState("");
  const [sensorKind, setSensorKind] = useState<"vitalsensor" | "tag">("vitalsensor");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user || !apiaryId) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("hives")
      .insert({
        user_id: user.id,
        apiary_id: apiaryId,
        name: name.trim(),
        max_brood_frames: Number(frames) || 10,
        hygienic_bottom_board: hygienic,
        queen_breeding_year: queenYear ? Number(queenYear) : null,
        queen_origin: origin.trim() || null,
        queen_insemination: insemination,
      })
      .select("id")
      .single();
    if (error || !data) { setSaving(false); toast.error(error?.message ?? "Could not save hive"); return; }

    if (sensorSerial.trim()) {
      const { error: dErr } = await supabase.from("devices").insert({
        user_id: user.id,
        apiary_id: apiaryId,
        hive_id: data.id,
        device_kind: sensorKind,
        link_type: "bluetooth",
        serial: sensorSerial.trim(),
        confirmation_code: code.trim() || null,
        label: `${name.trim()} ${sensorKind === "tag" ? "Tag" : "VitalSensor"}`,
        status: code.trim() ? "active" : "pending",
      });
      if (dErr) toast.error(`Hive saved, device failed: ${dErr.message}`);
    }
    setSaving(false);
    toast.success("Hive added");
    onDone();
  };

  return (
    <div className="max-w-lg mx-auto">
      <h3 className="text-center font-display text-2xl font-bold mb-8">Add Hive</h3>

      {step === 0 && (
        <div className="space-y-5">
          <p className="font-semibold">Hive details</p>
          <div>
            <Label>Apiary</Label>
            <select value={apiaryId} onChange={(e) => setApiaryId(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              {apiaries.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Hive Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="border-0 border-b rounded-none px-0 text-lg focus-visible:ring-0" placeholder="BY-H006" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Maximum number of brood chamber frames</Label>
            <Input type="number" min={1} max={30} value={frames} onChange={(e) => setFrames(e.target.value)} className="border-0 border-b rounded-none px-0 text-lg focus-visible:ring-0" />
          </div>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-base">Hive has hygienic bottom board</span>
            <input type="checkbox" checked={hygienic} onChange={(e) => setHygienic(e.target.checked)} className="w-5 h-5 accent-honey" />
          </label>
          <WizardNav onCancel={onCancel} onNext={() => setStep(1)} nextDisabled={!name.trim() || !apiaryId} />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <p className="font-semibold">Queen bee information</p>
          <div>
            <Label className="text-xs text-muted-foreground">Queen breeding year</Label>
            <div className="flex items-center gap-2">
              <select value={queenYear} onChange={(e) => setQueenYear(e.target.value)} className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select year</option>
                {queenYears.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              {queenYear && <span className="w-6 h-6 rounded-full border border-border" style={{ background: yearColor(Number(queenYear)) }} />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Year colour will be visible in the "hive shortcut" icon.</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Queen origin</Label>
            <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Own graft / Breeder name" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Queen insemination method</p>
            {(["Natural", "Artificial", "Unknown"] as const).map((m) => (
              <label key={m} className="flex items-center justify-between py-3 border-b border-border/60 cursor-pointer">
                <span className="text-base">{m}</span>
                <input type="radio" checked={insemination === m} onChange={() => setInsemination(m)} className="w-5 h-5 accent-honey" />
              </label>
            ))}
          </div>
          <WizardNav onCancel={onCancel} onBack={() => setStep(0)} onNext={() => setStep(2)} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <p className="font-semibold">Equipment — scan the QR code from the VitalSensor or Tag device</p>
          <div className="grid grid-cols-2 gap-3">
            {(["vitalsensor", "tag"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setSensorKind(k)}
                className={`rounded-xl border p-4 text-sm font-medium transition-all ${sensorKind === k ? "border-honey bg-honey/20" : "border-border hover:bg-muted"}`}
              >
                {k === "vitalsensor" ? "Apisense VitalSensor" : "Apisense Tag"}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-dashed border-honey/50 bg-muted/40 p-4 text-xs text-muted-foreground">
            {sensorKind === "vitalsensor"
              ? "Slide the VitalSensor between the last two brood frames, probe facing the cluster. The QR label is on the flat side of the housing."
              : "The Tag QR is printed on the red strap label. Clip it to the hive handle so the code stays readable from outside."}
          </div>
          <ScanField label="VitalSensor / Tag" hint="Tap the icon to scan the QR code from the device." value={sensorSerial} onChange={setSensorSerial} />
          <div>
            <Label>Confirmation code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code shown after pairing" />
          </div>
          <WizardNav onCancel={onCancel} onBack={() => setStep(1)} onNext={save} nextDisabled={saving} done nextLabel={sensorSerial.trim() ? undefined : "Skip & save"} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ USB / Bluetooth panels */

type SerialLike = {
  requestPort: () => Promise<{
    open: (o: { baudRate: number }) => Promise<void>;
    readable: ReadableStream<Uint8Array> | null;
    close: () => Promise<void>;
  }>;
};

function UsbPanel({ onIngest }: { onIngest: (line: string) => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const supported = typeof navigator !== "undefined" && "serial" in navigator;

  const connect = async () => {
    if (!supported) { toast.error("Web Serial is not supported in this browser"); return; }
    try {
      const port = await (navigator as unknown as { serial: SerialLike }).serial.requestPort();
      await port.open({ baudRate: 115200 });
      setConnected(true);
      toast.success("Physical link established");
      const decoder = new TextDecoder();
      const reader = port.readable?.getReader();
      let buf = "";
      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (line) { setLines((p) => [...p.slice(-200), line]); onIngest(line); }
        }
      }
      setConnected(false);
    } catch (e) {
      setConnected(false);
      toast.error(e instanceof Error ? e.message : "Serial connection failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-honey"><Terminal className="w-5 h-5" /></div>
          <div>
            <p className="font-semibold text-sm">Hardware Terminal</p>
            <p className="text-xs text-muted-foreground">Physical link stream for industrial hub diagnostics.</p>
          </div>
        </div>
        <Button onClick={connect} className="gap-2"><Usb className="w-4 h-4" /> {connected ? "Connected" : "Connect Device"}</Button>
      </div>
      <div className="rounded-xl bg-[#141414] text-[#8ee36a] font-mono text-xs p-4 h-64 overflow-y-auto">
        {lines.length === 0 ? <p className="opacity-60">Awaiting Connection…</p> : lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <div className="rounded-xl border border-border p-4">
        <p className="font-semibold text-sm mb-3">Safety checklist</p>
        {[
          ["Close serial sessions", "Make sure only one tool is connected."],
          ["Stabilize 5V voltage", "Prevent mid-flash brownout."],
          ["Device match", "Verify the chip ID before writing."],
          ["Persistent link", "Do not sever the USB bridge while streaming."],
        ].map(([t, d], i) => (
          <div key={t} className="flex gap-3 py-2 border-b border-border/50 last:border-0">
            <span className="w-6 h-6 rounded-md border border-border flex items-center justify-center text-xs">{i + 1}</span>
            <div><p className="text-sm font-medium">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

type BtLike = {
  requestDevice: (o: { acceptAllDevices: boolean; optionalServices: string[] }) => Promise<{ name?: string; id: string }>;
};

function BluetoothPanel({ onPaired }: { onPaired: (name: string, id: string) => void }) {
  const [busy, setBusy] = useState(false);
  const supported = typeof navigator !== "undefined" && "bluetooth" in navigator;

  const scan = async () => {
    if (!supported) { toast.error("Web Bluetooth is not supported in this browser"); return; }
    setBusy(true);
    try {
      const dev = await (navigator as unknown as { bluetooth: BtLike }).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["battery_service", "environmental_sensing"],
      });
      onPaired(dev.name ?? "Unnamed sensor", dev.id);
      toast.success(`Paired ${dev.name ?? "device"}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Pairing cancelled");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border p-4">
        <div>
          <p className="font-semibold text-sm">Short-range pairing</p>
          <p className="text-xs text-muted-foreground">Pair a VitalSensor or Tag over BLE while standing at the hive.</p>
        </div>
        <Button onClick={scan} disabled={busy} className="gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bluetooth className="w-4 h-4" />} Scan
        </Button>
      </div>
      <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">Pairing checklist</p>
        <p>1. Wake the sensor with a single magnet swipe — the LED blinks amber.</p>
        <p>2. Stay within 5 m; BLE advertising drops off sharply beyond the hive stand.</p>
        <p>3. Confirm the serial in the pairing dialog matches the QR label you scanned.</p>
        <p>4. After pairing, the device appears under My devices with a Bluetooth link type.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ main tool */

type Tab = "devices" | "usb" | "bluetooth" | "online";

interface MeasurementDataToolsProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

export default function MeasurementDataTools({ isOpen, onClose, embedded = false }: MeasurementDataToolsProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("devices");
  const [apiaries, setApiaries] = useState<Apiary[]>([]);
  const [hives, setHives] = useState<Hive[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [wizard, setWizard] = useState<null | "apiary" | "hive">(null);
  const [selApiary, setSelApiary] = useState<string>("all");
  const [selHive, setSelHive] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [a, h, d, m] = await Promise.all([
      supabase.from("apiaries").select("id,name,add_mode,latitude,longitude").order("created_at"),
      supabase.from("hives").select("id,apiary_id,name,max_brood_frames,hygienic_bottom_board,queen_breeding_year,queen_origin,queen_insemination").order("created_at"),
      supabase.from("devices").select("id,apiary_id,hive_id,device_kind,link_type,serial,label,status,battery_pct,last_seen_at").order("created_at"),
      supabase.from("device_measurements").select("id,device_id,hive_id,recorded_at,source,temperature_c,humidity_pct,weight_kg,battery_pct").order("recorded_at", { ascending: false }).limit(100),
    ]);
    setApiaries((a.data as Apiary[]) ?? []);
    setHives((h.data as Hive[]) ?? []);
    setDevices((d.data as Device[]) ?? []);
    setMeasurements((m.data as Measurement[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { if (isOpen) void load(); }, [isOpen, load]);

  const ingestSerialLine = async (line: string) => {
    // Accept "T=24.5;H=61;W=38.2;B=88" or JSON payloads from the hub.
    if (!user) return;
    let temp: number | null;
    let hum: number | null;
    let wt: number | null;
    let bat: number | null;
    try {
      const j = JSON.parse(line);
      temp = j.t ?? j.temperature ?? null; hum = j.h ?? j.humidity ?? null;
      wt = j.w ?? j.weight ?? null; bat = j.b ?? j.battery ?? null;
    } catch {
      const grab = (k: string) => { const m = line.match(new RegExp(`${k}=(-?\\d+(\\.\\d+)?)`, "i")); return m ? Number(m[1]) : null; };
      temp = grab("T"); hum = grab("H"); wt = grab("W"); bat = grab("B");
    }
    if (temp === null && hum === null && wt === null) return;
    await supabase.from("device_measurements").insert({
      user_id: user.id,
      hive_id: selHive || null,
      source: "usb",
      temperature_c: temp, humidity_pct: hum, weight_kg: wt, battery_pct: bat,
      raw: { line },
    });
    void load();
  };

  const pairBluetooth = async (name: string, id: string) => {
    if (!user) return;
    const { error } = await supabase.from("devices").insert({
      user_id: user.id,
      apiary_id: selApiary !== "all" ? selApiary : null,
      hive_id: selHive || null,
      device_kind: "vitalsensor",
      link_type: "bluetooth",
      serial: id.slice(0, 40),
      label: name,
      status: "active",
      last_seen_at: new Date().toISOString(),
    });
    if (error) toast.error(error.message); else void load();
  };

  const removeDevice = async (id: string) => {
    const { error } = await supabase.from("devices").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Device removed"); void load(); }
  };

  if (!isOpen) return null;

  const visibleDevices = selApiary === "all" ? devices : devices.filter((d) => d.apiary_id === selApiary);
  const hiveMeasurements = selHive ? measurements.filter((m) => m.hive_id === selHive) : measurements;
  const latest = hiveMeasurements[0];

  const TABS: Array<{ id: Tab; label: string; icon: typeof Cpu }> = [
    { id: "devices", label: "My devices", icon: Cpu },
    { id: "usb", label: "USB", icon: Usb },
    { id: "bluetooth", label: "Bluetooth", icon: Bluetooth },
    { id: "online", label: "Online", icon: Wifi },
  ];

  const containerClass = embedded
    ? "relative z-0 bg-background overflow-visible p-6 rounded-xl border border-border"
    : "fixed inset-0 z-50 bg-background overflow-y-auto p-6";

  return (
    <div className={containerClass}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-honey bg-honey/15 rounded-full px-3 py-1 mb-2">
              <Wifi className="w-3 h-3" /> Measurement Data Tools
            </span>
            <h2 className="font-display text-3xl font-bold">Hive <span className="text-honey">Monitoring</span></h2>
            <p className="text-sm text-muted-foreground">Remote telemetry and real-time environmental metrics for your colonies.</p>
          </div>
          {!embedded && (
            <button onClick={onClose} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted" title="Close">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {!user ? (
          <div className="rounded-xl border border-border p-10 text-center text-sm text-muted-foreground">
            Sign in to register apiaries, hives and measurement devices.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all ${
                    tab === t.id ? "bg-honey/20 border-honey text-foreground" : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <t.icon className="w-4 h-4" /> {t.label}
                </button>
              ))}
              <div className="flex-1" />
              <Button variant="outline" onClick={() => setWizard("apiary")} className="gap-2"><Plus className="w-4 h-4" /> Add apiary</Button>
              <Button onClick={() => setWizard("hive")} disabled={!apiaries.length} className="gap-2"><Plus className="w-4 h-4" /> Add hive</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border bg-muted/30 p-4 mb-5">
              <div>
                <Label className="text-xs text-muted-foreground">Apiary</Label>
                <select value={selApiary} onChange={(e) => setSelApiary(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="all">All apiaries</option>
                  {apiaries.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Asset handshake</Label>
                <select value={selHive} onChange={(e) => setSelHive(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Deselect</option>
                  {hives.filter((h) => selApiary === "all" || h.apiary_id === selApiary).map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {wizard ? (
              <div className="rounded-xl border border-border p-6">
                {wizard === "apiary" ? (
                  <AddApiaryWizard onCancel={() => setWizard(null)} onDone={() => { setWizard(null); void load(); }} />
                ) : (
                  <AddHiveWizard apiaries={apiaries} onCancel={() => setWizard(null)} onDone={() => { setWizard(null); void load(); }} />
                )}
              </div>
            ) : (
              <>
                {tab === "devices" && (
                  <div className="space-y-3">
                    {loading && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading registry…</p>}
                    {!loading && visibleDevices.length === 0 && (
                      <div className="rounded-xl border border-dashed border-border p-10 text-center">
                        <Boxes className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                        <p className="font-semibold">No devices registered</p>
                        <p className="text-sm text-muted-foreground">Add an apiary with devices, or scan a VitalSensor while adding a hive.</p>
                      </div>
                    )}
                    {visibleDevices.map((d) => {
                      const hive = hives.find((h) => h.id === d.hive_id);
                      const ap = apiaries.find((a) => a.id === d.apiary_id);
                      return (
                        <div key={d.id} className="rounded-xl border border-border p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-honey/15 flex items-center justify-center text-honey">
                              {d.link_type === "usb" ? <Usb className="w-5 h-5" /> : d.link_type === "bluetooth" ? <Bluetooth className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{d.label || d.serial}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {d.device_kind} · {d.link_type} · {d.serial}
                                {ap && ` · ${ap.name}`}{hive && ` / ${hive.name}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {d.battery_pct != null && <span className="text-xs text-muted-foreground flex items-center gap-1"><BatteryCharging className="w-3.5 h-3.5" />{d.battery_pct}%</span>}
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${d.status === "active" ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                              {d.status}
                            </span>
                            <button onClick={() => removeDevice(d.id)} className="text-muted-foreground hover:text-destructive" title="Remove device">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {hives.length > 0 && (
                      <div className="rounded-xl border border-border p-4 mt-6">
                        <p className="font-semibold text-sm mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-honey" /> Registered hives</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {hives.filter((h) => selApiary === "all" || h.apiary_id === selApiary).map((h) => (
                            <div key={h.id} className="rounded-lg border border-border p-3">
                              <div className="flex items-center gap-2">
                                {h.queen_breeding_year && <span className="w-3 h-3 rounded-full" style={{ background: yearColor(h.queen_breeding_year) }} />}
                                <p className="font-medium text-sm">{h.name}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {h.max_brood_frames} brood frames · {h.hygienic_bottom_board ? "hygienic board" : "solid board"}
                                {h.queen_breeding_year ? ` · queen ${h.queen_breeding_year}` : ""}
                                {h.queen_insemination ? ` · ${h.queen_insemination.toLowerCase()}` : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tab === "usb" && <UsbPanel onIngest={ingestSerialLine} />}
                {tab === "bluetooth" && <BluetoothPanel onPaired={pairBluetooth} />}

                {tab === "online" && (
                  <div className="space-y-4">
                    {!selHive ? (
                      <div className="rounded-xl border border-dashed border-border p-12 text-center">
                        <Wifi className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                        <p className="font-semibold text-lg">Select a hive</p>
                        <p className="text-sm text-muted-foreground">Establish a telemetry link by selecting a hive from the registry above.</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            { label: "Thermal profile", icon: Thermometer, value: latest?.temperature_c, unit: "°C" },
                            { label: "Ambient saturation", icon: Droplets, value: latest?.humidity_pct, unit: "%" },
                            { label: "Composite mass", icon: Scale, value: latest?.weight_kg, unit: "kg" },
                          ].map((c) => (
                            <div key={c.label} className="rounded-xl border border-border p-4">
                              <div className="flex items-start justify-between">
                                <div className="w-9 h-9 rounded-lg bg-honey/15 flex items-center justify-center text-honey"><c.icon className="w-4 h-4" /></div>
                                <span className="text-xs text-muted-foreground">{c.label}</span>
                              </div>
                              <p className="text-2xl font-bold mt-3">{c.value != null ? `${c.value}${c.unit}` : "– –"}</p>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-xl border border-border p-4">
                          <p className="font-semibold text-sm mb-3">Recent readings</p>
                          {hiveMeasurements.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No readings yet. Stream via USB or pair a sensor to start logging.</p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead className="text-muted-foreground">
                                  <tr className="text-left">
                                    <th className="py-2">Time</th><th>Source</th><th>Temp</th><th>Humidity</th><th>Weight</th><th>Battery</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {hiveMeasurements.slice(0, 25).map((m) => (
                                    <tr key={m.id} className="border-t border-border/60">
                                      <td className="py-2">{new Date(m.recorded_at).toLocaleString()}</td>
                                      <td>{m.source}</td>
                                      <td>{m.temperature_c ?? "–"}</td>
                                      <td>{m.humidity_pct ?? "–"}</td>
                                      <td>{m.weight_kg ?? "–"}</td>
                                      <td>{m.battery_pct ?? "–"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
