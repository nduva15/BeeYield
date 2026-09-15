import React, { type ReactNode } from "react";

interface BeeYieldPageShellProps {
  children: ReactNode;
  className?: string;
}

export function BeeYieldPageShell({
  children,
  className = "",
}: BeeYieldPageShellProps) {
  return <div className={className}>{children}</div>;
}
