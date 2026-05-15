import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiPostMock, apiGetMock, apiPatchMock, fromMock, insertMock, upsertMock } = vi.hoisted(() => ({
  apiPostMock: vi.fn(),
  apiGetMock: vi.fn(),
  apiPatchMock: vi.fn(),
  fromMock: vi.fn(),
  insertMock: vi.fn(),
  upsertMock: vi.fn(),
}));

vi.mock("./api", () => ({
  apiPost: apiPostMock,
  apiGet: apiGetMock,
  apiPatch: apiPatchMock,
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: fromMock,
  },
}));

import {
  submitContactForm,
  submitContactMessage,
  submitNewsletterSubscription,
  submitPollinationRequest,
} from "./contactService";

describe("contactService fallback handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    fromMock.mockImplementation((table: string) => ({
      insert: (payload: unknown) => insertMock(table, payload),
      upsert: (payload: unknown, options: unknown) =>
        upsertMock(table, payload, options),
    }));

    insertMock.mockResolvedValue({ error: null });
    upsertMock.mockResolvedValue({ error: null });
  });

  it("falls back to Supabase for general contact submissions when the API is unreachable", async () => {
    apiPostMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const response = await submitContactForm({
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      phone: "+254700000001",
      city: "Nairobi",
      state: "Nairobi",
      country: "Kenya",
      inquiry_type: "general",
      topic: "Support",
      message: "Need help with the dashboard.",
    });

    expect(insertMock).toHaveBeenCalledWith(
      "contact_submissions",
      expect.objectContaining({
        first_name: "Jane",
        last_name: "Doe",
        name: "Jane Doe",
        subject: "GENERAL: Support",
        status: "new",
      }),
    );
    expect(response.status).toBe("success");
  });

  it("falls back to Supabase for secure contact messages when the API is unreachable", async () => {
    apiPostMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const response = await submitContactMessage({
      full_name: "Team User",
      email: "team@example.com",
      subject: "Secure message",
      message: "Testing secure inbox fallback.",
    });

    expect(insertMock).toHaveBeenCalledWith(
      "contact_messages",
      expect.objectContaining({
        full_name: "Team User",
        status: "new",
      }),
    );
    expect(response.message).toContain("Message sent");
  });

  it("falls back to Supabase upsert for newsletter subscriptions when the API is unreachable", async () => {
    apiPostMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const response = await submitNewsletterSubscription({
      email: "newsletter@example.com",
      first_name: "Newsletter",
      source: "footer_test",
    });

    expect(upsertMock).toHaveBeenCalledWith(
      "newsletter_subscribers",
      expect.objectContaining({
        email: "newsletter@example.com",
        first_name: "Newsletter",
        source: "footer_test",
      }),
      { onConflict: "email" },
    );
    expect(response.status).toBe("success");
  });

  it("falls back to Supabase for pollination requests when the API is unreachable", async () => {
    apiPostMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const response = await submitPollinationRequest({
      full_name: "Farmer User",
      email: "farmer@example.com",
      phone: "+254700000002",
      farm_name: "QA Farm",
      farm_location: "Kibwezi",
      crop_type: "Mangoes",
      acres: 5,
      preferred_start_date: "2026-04-20",
      additional_info: "Testing pollination fallback.",
    });

    expect(insertMock).toHaveBeenCalledWith(
      "pollination_requests",
      expect.objectContaining({
        full_name: "Farmer User",
        status: "pending",
      }),
    );
    expect(response.status).toBe("success");
  });

  it("does not use the fallback for validation errors from the API", async () => {
    const validationError = new Error("invalid email") as Error & { status?: number };
    validationError.status = 422;
    apiPostMock.mockRejectedValueOnce(validationError);

    await expect(
      submitContactForm({
        first_name: "Jane",
        last_name: "Doe",
        email: "broken",
        phone: "+254700000001",
        city: "Nairobi",
        state: "Nairobi",
        country: "Kenya",
        inquiry_type: "general",
        topic: "Support",
      }),
    ).rejects.toThrow("invalid email");

    expect(insertMock).not.toHaveBeenCalled();
  });
});
