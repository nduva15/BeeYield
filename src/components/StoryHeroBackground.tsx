import React from "react";

/** Shared hero/header background — the same apiary photo + soft white wash used on the Our Story header. */
export const STORY_HERO_BG = "/images/story/hives/apiary-langstroth-row.jpg";

interface StoryHeroBackgroundProps {
  className?: string;
}

export const StoryHeroBackground: React.FC<StoryHeroBackgroundProps> = ({ className = "" }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden="true">
    <img
      src={STORY_HERO_BG}
      alt=""
      className="w-full h-full object-cover"
      loading="eager"
      decoding="async"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-white/94 via-white/86 to-white/96" />
  </div>
);

export default StoryHeroBackground;
