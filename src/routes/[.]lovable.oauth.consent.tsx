import { createFileRoute } from "@tanstack/react-router";
import OAuthConsent from "@/pages/OAuthConsent";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  head: () => ({
    meta: [
      { title: "Authorize access — Beeyield" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Review and approve an application requesting access to your Beeyield account.",
      },
      { property: "og:title", content: "Authorize access — Beeyield" },
      {
        property: "og:description",
        content: "Approve or deny an application requesting access to your Beeyield account.",
      },
    ],
  }),
  component: OAuthConsent,
});
