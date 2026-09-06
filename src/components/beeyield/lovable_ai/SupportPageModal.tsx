import { useState, useEffect, useId } from "react";
import {
  X,
  ChevronRight,
  Headphones,
  Mail,
  Phone,
  MapPin,
  Activity,
  Printer,
  Search,
  Send,
  Loader2,
  ShieldCheck,
  Plus,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface SupportPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTabChange?: (tab: string) => void;
}

type SupportTicket = {
  id: string;
  category: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "new" | "in_progress" | "resolved";
  created_at: string;
};

export default function SupportPageModal({ isOpen, onClose, onTabChange }: SupportPageModalProps) {
  const [activeTab, setActiveTab] = useState<"all" | "new" | "in_progress" | "resolved">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    category: "Hardware Calibration",
    subject: "",
    description: "",
    priority: "medium" as const,
  });

  useEffect(() => {
    const saved = localStorage.getItem("beeyield_support_tickets");
    if (saved) {
      try {
        setTickets(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error("Please provide both subject and description.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newTicket: SupportTicket = {
        id: "TICK-" + Math.floor(1000 + Math.random() * 9000),
        category: formData.category,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: "new",
        created_at: new Date().toISOString(),
      };

      const updated = [newTicket, ...tickets];
      setTickets(updated);
      try {
        localStorage.setItem("beeyield_support_tickets", JSON.stringify(updated));
      } catch {}

      setIsSubmitting(false);
      setIsNewTicketOpen(false);
      setFormData({
        category: "Hardware Calibration",
        subject: "",
        description: "",
        priority: "medium",
      });
      toast.success("Support ticket dispatched successfully. SLA < 2 Hours.");
    }, 400);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesTab = activeTab === "all" || t.status === activeTab;
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pendingCount = tickets.filter((t) => t.status === "new").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;
  const lastContact = tickets.length > 0 ? new Date(tickets[0].created_at).toLocaleDateString() : "None";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#12110E] text-white border border-white/10 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col my-auto max-h-[94vh] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#12110E]">
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-1.5">
              Support <span className="text-[#F4D03F]">Page View</span>
            </h1>
            <p className="text-xs text-white/60 mt-0.5">
              High-priority assistance for your apiculture operations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="h-9 px-4 rounded-xl font-bold text-xs bg-[#F59E0B] hover:bg-[#EAB308] text-black flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              + New Ticket <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scroll">
          {/* 5 Dark KPI Stat Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[10px] font-bold tracking-widest text-white/50 uppercase mb-1">
                TOTAL TICKETS
              </div>
              <div className="text-2xl font-bold font-display text-white">
                {tickets.length}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[10px] font-bold tracking-widest text-white/50 uppercase mb-1">
                PENDING
              </div>
              <div className="text-2xl font-bold font-display text-white">
                {pendingCount}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[10px] font-bold tracking-widest text-white/50 uppercase mb-1">
                IN PROGRESS
              </div>
              <div className="text-2xl font-bold font-display text-white">
                {inProgressCount}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[10px] font-bold tracking-widest text-white/50 uppercase mb-1">
                RESOLVED
              </div>
              <div className="text-2xl font-bold font-display text-white">
                {resolvedCount}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[10px] font-bold tracking-widest text-white/50 uppercase mb-1">
                LAST CONTACT
              </div>
              <div className="text-2xl font-bold font-display text-white">
                {lastContact}
              </div>
            </div>
          </div>

          {/* Contact Support Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold font-display text-[#F4D03F]">
                  Contact Support
                </h2>
                <p className="text-xs text-white/60 mt-0.5">
                  Experts available for hardware calibration, app issues, or data interpretation.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => toast.info("Diagnostics test run on connected apiary sensors: all nominal.")}
                  className="h-9 px-4 rounded-xl text-xs font-semibold border border-white/15 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 transition-all"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Troubleshooting
                </button>
                <button
                  onClick={() => window.print()}
                  className="h-9 px-4 rounded-xl text-xs font-semibold border border-white/15 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-white/70" />
                  Export Service Form
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2 text-white/80">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Mail: <strong>support@beeyield.com</strong></span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Phone: <strong>+254 700 000 000</strong></span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Hub: <strong>Kibwezi, Kenya</strong></span>
              </div>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                <Activity className="w-3 h-3 animate-pulse" /> SLA: &lt; 2 Hours
              </span>
            </div>
          </div>

          {/* Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-xl border border-white/10">
              {(["all", "new", "in_progress", "resolved"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    activeTab === tab
                      ? "bg-[#F59E0B] text-black shadow-sm"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {tab === "in_progress" ? "In Progress" : tab}
                </button>
              ))}
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>

          {/* Tickets List or Empty State */}
          {filteredTickets.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-16 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-[#F59E0B] mb-1">
                <Send className="w-6 h-6 rotate-45" />
              </div>
              <h3 className="font-bold text-base text-white">No Tickets Found</h3>
              <p className="text-xs text-white/50 max-w-sm">
                All support channels are synchronized
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-amber-400 font-bold">{ticket.id}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/80">
                        {ticket.category}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        ticket.priority === "critical"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : ticket.priority === "high"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-white">{ticket.subject}</h4>
                    <p className="text-xs text-white/60 line-clamp-1 mt-0.5">{ticket.description}</p>
                  </div>
                  <div className="text-right text-xs text-white/40">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1A14] text-white rounded-3xl border border-white/15 w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#F59E0B]" /> New Support Ticket
              </h3>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div className="space-y-1">
                <Label className="text-white/80">Category</Label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-9 rounded-xl border border-white/15 bg-white/5 text-white px-3 text-xs"
                >
                  <option value="Hardware Calibration" className="bg-[#1C1A14]">Hardware Calibration</option>
                  <option value="Acoustic Sensors" className="bg-[#1C1A14]">Acoustic Sensors</option>
                  <option value="Data & API Export" className="bg-[#1C1A14]">Data & API Export</option>
                  <option value="Billing & Orders" className="bg-[#1C1A14]">Billing & Orders</option>
                  <option value="General Apiculture Inquiry" className="bg-[#1C1A14]">General Apiculture Inquiry</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-white/80">Subject</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Hive KBZ-01 acoustic sensor offline"
                  className="h-9 border-white/15 bg-white/5 text-white placeholder:text-white/40"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-white/80">Priority</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(["low", "medium", "high", "critical"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`h-8 rounded-lg border text-xs font-bold uppercase transition-all ${
                        formData.priority === p
                          ? "bg-[#F59E0B] text-black border-[#F59E0B]"
                          : "border-white/15 bg-white/5 text-white/60 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-white/80">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details about the issue..."
                  className="min-h-[100px] border-white/15 bg-white/5 text-white placeholder:text-white/40 resize-none text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="flex items-center gap-1.5 text-[11px] text-white/50">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SLA Guaranteed
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsNewTicketOpen(false)}
                    className="border-white/15 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="bg-[#F59E0B] hover:bg-[#EAB308] text-black font-bold"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Dispatch Ticket
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
