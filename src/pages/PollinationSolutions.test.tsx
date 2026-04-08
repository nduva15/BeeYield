import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PollinationSolutions from "./PollinationSolutions";

const submitContactFormMock = vi.fn();
const toastMock = vi.fn();

vi.mock("@/services/contactService", () => ({
  submitContactForm: submitContactFormMock,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

vi.mock("@/components/beeyield/BeeYieldUI", () => ({
  BeeYieldPageShell: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock("@/components/YouTubeEmbed", () => ({
  YouTubeEmbed: () => <div data-testid="youtube-embed" />,
}));

describe("PollinationSolutions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    submitContactFormMock.mockResolvedValue({
      status: "success",
      message: "Saved successfully.",
    });
  });

  it("submits the join network form to the backend contact service", async () => {
    render(
      <MemoryRouter>
        <PollinationSolutions />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email \*/i), {
      target: { value: "jane@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(submitContactFormMock).toHaveBeenCalledWith({
        first_name: "Jane",
        last_name: "Doe",
        email: "jane@example.com",
        phone: "N/A",
        city: "N/A",
        state: "N/A",
        country: "N/A",
        inquiry_type: "general",
        topic: "Pollination Network Signup",
        message: "Interested in updates about bee health, pollination research, and agricultural innovations.",
        form_specific_data: {
          source: "pollination_solutions_network",
          subscribe_to_updates: true,
        },
      });
    });

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Network request received",
        }),
      );
    });

    expect(screen.getByText(/your details were sent successfully/i)).toBeTruthy();
    expect((screen.getByLabelText(/first name/i) as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText(/last name/i) as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText(/email \*/i) as HTMLInputElement).value).toBe("");
  });
});
