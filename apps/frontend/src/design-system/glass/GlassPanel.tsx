import type { ReactNode } from "react";

import { cn } from "@/design-system/utils/cn";

export type GlassPanelVariant =
  | "default"
  | "accent"
  | "purple"
  | "gold"
  | "elevated";

type GlassPanelProps = {
  children: ReactNode;
  className?: string;
  variant?: GlassPanelVariant;
  as?: "div" | "section" | "article" | "header" | "footer";
};

const variantClass: Record<GlassPanelVariant, string> = {
  default: "glass-panel",
  accent: "glass-panel glass-panel-accent",
  purple: "glass-panel glass-panel-purple",
  gold: "glass-panel glass-panel-gold",
  elevated: "glass-panel glass-panel-elevated",
};

export function GlassPanel({
  children,
  className = "",
  variant = "default",
  as: Tag = "div",
}: GlassPanelProps) {
  return (
    <Tag className={cn(variantClass[variant], "rounded-[20px]", className)}>
      {children}
    </Tag>
  );
}
