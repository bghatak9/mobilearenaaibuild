import type { ReactNode } from "react";

import { cn } from "@/design-system/utils/cn";

export type SpectrumPanelVariant =
  | "default"
  | "accent"
  | "purple"
  | "gold"
  | "elevated";

type SpectrumPanelProps = {
  children: ReactNode;
  className?: string;
  variant?: SpectrumPanelVariant;
  as?: "div" | "section" | "article" | "header" | "footer";
};

const variantClass: Record<SpectrumPanelVariant, string> = {
  default: "spectrum-panel",
  accent: "spectrum-panel spectrum-panel-accent",
  purple: "spectrum-panel spectrum-panel-purple",
  gold: "spectrum-panel spectrum-panel-gold",
  elevated: "spectrum-panel spectrum-panel-elevated",
};

export function SpectrumPanel({
  children,
  className = "",
  variant = "default",
  as: Tag = "div",
}: SpectrumPanelProps) {
  return (
    <Tag className={cn(variantClass[variant], "rounded-[24px]", className)}>
      {children}
    </Tag>
  );
}
