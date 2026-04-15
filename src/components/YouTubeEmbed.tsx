import { cn } from "@/lib/utils";

export const BEEYIELD_YOUTUBE_VIDEO_URL =
  "https://www.youtube.com/watch?v=pKDfIS7ugeQ&time_continue=3&source_ve_path=NzY3NTg&embeds_widget_referrer=https%3A%2F%2Fintelligenthives.eu%2F&embeds_referring_euri=https%3A%2F%2Fintelligenthives.eu%2F&embeds_referring_origin=https%3A%2F%2Fintelligenthives.eu";

export const BEEYIELD_YOUTUBE_EMBED_URL =
  "https://www.youtube.com/embed/pKDfIS7ugeQ?start=3&rel=0";

type YouTubeEmbedProps = {
  title: string;
  embedUrl?: string;
  loading?: "eager" | "lazy";
  wrapperClassName?: string;
  iframeClassName?: string;
};

export function YouTubeEmbed({
  title,
  embedUrl = BEEYIELD_YOUTUBE_EMBED_URL,
  loading = "lazy",
  wrapperClassName,
  iframeClassName,
}: YouTubeEmbedProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] border border-neutral-100 bg-neutral-100 shadow-premium",
        wrapperClassName,
      )}
    >
      <iframe
        className={cn("absolute inset-0 h-full w-full border-0", iframeClassName)}
        src={embedUrl}
        title={title}
        loading={loading}
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
