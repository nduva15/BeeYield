import { supabase } from "@/integrations/supabase/client";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/services/api";
import { beeyieldService, SupportRequest } from "@/services/beeyieldService";

export type Ticket = {
  id: string;
  device_id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  hive_label: string | null;
  body: string;
  contact_email: string | null;
  contact_phone: string | null;
  last_contact_at: string | null;
  resolution: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type CreateTicketDraft = {
  subject: string;
  category: string;
  priority: string;
  hive_label?: string | null;
  body: string;
  contact_email?: string | null;
  contact_phone?: string | null;
};

function getLocalKey(deviceId?: string) {
  return deviceId ? `beeyield_support_tickets_${deviceId}` : "beeyield_support_tickets";
}

function readLocalTickets(deviceId?: string): Ticket[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getLocalKey(deviceId);
    const raw = localStorage.getItem(key) || localStorage.getItem("beeyield_support_tickets");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("Failed to read local tickets:", err);
  }
  return [];
}

function saveLocalTickets(tickets: Ticket[], deviceId?: string) {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(tickets);
    if (deviceId) {
      localStorage.setItem(`beeyield_support_tickets_${deviceId}`, serialized);
    }
    localStorage.setItem("beeyield_support_tickets", serialized);
  } catch (err) {
    console.warn("Failed to save local tickets to localStorage:", err);
  }
}

export const supportTicketService = {
  async getTickets(deviceId?: string): Promise<Ticket[]> {
    const localTickets = readLocalTickets(deviceId);
    const mergedMap = new Map<string, Ticket>();

    // 1. Seed with local tickets
    localTickets.forEach((t) => {
      if (t.id) mergedMap.set(t.id, t);
    });

    // 2. Fetch from Supabase support_tickets table
    if (supabase) {
      try {
        let query = supabase.from("support_tickets").select("*");
        if (deviceId) {
          query = query.eq("device_id", deviceId);
        }
        const { data, error } = await query.order("created_at", { ascending: false });
        if (!error && Array.isArray(data)) {
          (data as Ticket[]).forEach((t) => {
            if (t.id) {
              const prev = mergedMap.get(t.id);
              mergedMap.set(t.id, { ...prev, ...t });
            }
          });
        }
      } catch (sbErr) {
        console.warn("Supabase support_tickets getTickets notice:", sbErr);
      }
    }

    // 3. Fetch from FastAPI Backend (/api/v1/beeyield/requests)
    try {
      const backendRequests = await apiGet<any[]>("beeyield/requests");
      if (Array.isArray(backendRequests)) {
        backendRequests.forEach((req: any) => {
          const reqId = String(req.id || "");
          if (!reqId) return;

          const rawStatus = String(req.status || "").toLowerCase();
          const mappedStatus =
            rawStatus === "resolved" ? "resolved" :
            rawStatus === "in progress" || rawStatus === "in_progress" ? "in progress" :
            "new";

          const mappedTicket: Ticket = {
            id: reqId,
            device_id: deviceId || "default_device",
            subject: req.subject || "Support Ticket",
            category: req.category || "General",
            priority: (req.priority || "normal").toLowerCase(),
            status: mappedStatus,
            hive_label: req.hive_id || req.hive_label || null,
            body: req.description || req.body || "",
            contact_email: null,
            contact_phone: null,
            last_contact_at: req.updated_at || req.created_at || new Date().toISOString(),
            resolution: null,
            created_at: req.created_at || new Date().toISOString(),
          };

          const existing = mergedMap.get(reqId);
          mergedMap.set(reqId, { ...mappedTicket, ...existing });
        });
      }
    } catch (beErr) {
      // Non-blocking fallback
    }

    // 4. Merge with beeyieldService request cache
    try {
      const localRequests = await beeyieldService.getRequests();
      if (Array.isArray(localRequests)) {
        localRequests.forEach((r: SupportRequest) => {
          if (!mergedMap.has(r.id)) {
            const rawStatus = String(r.status || "").toLowerCase();
            mergedMap.set(r.id, {
              id: r.id,
              device_id: deviceId || "default_device",
              subject: r.subject,
              category: r.category || "General",
              priority: (r.priority || "normal").toLowerCase(),
              status: rawStatus.includes("resolve") ? "resolved" : rawStatus.includes("progress") ? "in progress" : "new",
              hive_label: r.hive_id || null,
              body: r.description || "",
              contact_email: null,
              contact_phone: null,
              last_contact_at: r.updated_at || r.created_at,
              resolution: null,
              created_at: r.created_at,
            });
          }
        });
      }
    } catch {}

    const combined = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

    saveLocalTickets(combined, deviceId);
    return combined;
  },

  async createTicket(draft: CreateTicketDraft, deviceId: string): Promise<{ data: Ticket; error: null }> {
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newTicket: Ticket = {
      id: newId,
      device_id: deviceId || "device_" + Math.random().toString(36).slice(2, 9),
      subject: draft.subject.trim(),
      category: draft.category || "General",
      priority: (draft.priority || "normal").toLowerCase(),
      status: "new",
      hive_label: draft.hive_label?.trim() || null,
      body: draft.body.trim(),
      contact_email: draft.contact_email?.trim() || null,
      contact_phone: draft.contact_phone?.trim() || null,
      last_contact_at: now,
      resolution: null,
      created_at: now,
      updated_at: now,
    };

    // 1. Immediately store locally for 100% offline & instantaneous resilience
    const current = readLocalTickets(deviceId);
    const updated = [newTicket, ...current.filter((t) => t.id !== newId)];
    saveLocalTickets(updated, deviceId);

    // 2. Synchronize with FastAPI backend API
    try {
      const priorityFormatted =
        newTicket.priority === "urgent" || newTicket.priority === "critical" ? "Critical" :
        newTicket.priority === "high" ? "High" :
        newTicket.priority === "low" ? "Low" :
        "Medium";

      await apiPost("beeyield/requests", {
        subject: newTicket.subject,
        description: newTicket.body,
        type: "support",
        category: newTicket.category,
        priority: priorityFormatted,
        status: "Open",
      });
    } catch (apiErr) {
      console.warn("Backend API request creation notice:", apiErr);
    }

    // 3. Synchronize with Supabase support_tickets table
    if (supabase) {
      try {
        const { error } = await supabase.from("support_tickets").insert({
          id: newTicket.id,
          device_id: newTicket.device_id,
          subject: newTicket.subject,
          category: newTicket.category,
          priority: newTicket.priority,
          status: newTicket.status,
          hive_label: newTicket.hive_label,
          body: newTicket.body,
          contact_email: newTicket.contact_email,
          contact_phone: newTicket.contact_phone,
          last_contact_at: newTicket.last_contact_at,
        });
        if (error) {
          console.warn("Supabase support_tickets insert notice:", error.message);
        }
      } catch (sbErr) {
        console.warn("Supabase insert exception (ticket saved locally and backend):", sbErr);
      }
    }

    // 4. Update beeyieldService request cache
    try {
      await beeyieldService.createRequest({
        subject: newTicket.subject,
        description: newTicket.body,
        category: newTicket.category,
        priority: newTicket.priority as any,
        type: "support",
      });
    } catch {}

    return { data: newTicket, error: null };
  },

  async advanceTicket(ticket: Ticket, deviceId: string): Promise<Ticket> {
    const nextStatus =
      ticket.status === "new" ? "in progress" :
      ticket.status === "in progress" ? "resolved" :
      "new";

    const now = new Date().toISOString();
    const updatedTicket: Ticket = {
      ...ticket,
      status: nextStatus,
      last_contact_at: now,
      updated_at: now,
    };

    // 1. Update local storage
    const current = readLocalTickets(deviceId);
    const updated = current.map((t) => (t.id === ticket.id ? updatedTicket : t));
    saveLocalTickets(updated, deviceId);

    // 2. Synchronize with Backend API
    try {
      const backendStatus =
        nextStatus === "resolved" ? "Resolved" :
        nextStatus === "in progress" ? "In Progress" :
        "Open";

      await apiPatch(`beeyield/requests/${ticket.id}`, {
        status: backendStatus,
      });
    } catch (apiErr) {
      console.warn("Backend API request status patch notice:", apiErr);
    }

    // 3. Synchronize with Supabase
    if (supabase) {
      try {
        await supabase
          .from("support_tickets")
          .update({
            status: nextStatus,
            last_contact_at: now,
          })
          .eq("id", ticket.id);
      } catch (sbErr) {
        console.warn("Supabase status update notice:", sbErr);
      }
    }

    // 4. Update beeyieldService
    try {
      await beeyieldService.updateRequest(ticket.id, {
        status: nextStatus,
      });
    } catch {}

    return updatedTicket;
  },

  async deleteTicket(id: string, deviceId: string): Promise<boolean> {
    // 1. Remove from local storage
    const current = readLocalTickets(deviceId);
    const filtered = current.filter((t) => t.id !== id);
    saveLocalTickets(filtered, deviceId);

    // 2. Synchronize with Backend API
    try {
      await apiDelete(`beeyield/requests/${id}`);
    } catch (apiErr) {
      console.warn("Backend API request delete notice:", apiErr);
    }

    // 3. Synchronize with Supabase
    if (supabase) {
      try {
        await supabase.from("support_tickets").delete().eq("id", id);
      } catch (sbErr) {
        console.warn("Supabase ticket delete notice:", sbErr);
      }
    }

    // 4. Update beeyieldService
    try {
      await beeyieldService.deleteRequest(id);
    } catch {}

    return true;
  },
};
