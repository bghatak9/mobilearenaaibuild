import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/design-system/utils/cn";

type NoTranslateProps = {
  children: ReactNode;
  as?: "span" | "div";
  className?: string;
  /**
   * When true, blocks Google Translate.
   * Default false — whole-page GT covers A–Z / 0–9.
   * Only lock the logo and language control.
   */
  lock?: boolean;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className" | "translate">;

/**
 * Optional translation lock. Unlocked by default so Google Translate
 * can cover the whole site.
 */
export function NoTranslate({
  children,
  as: Tag = "span",
  className,
  lock = false,
  ...rest
}: NoTranslateProps) {
  if (!lock) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }
  return (
    <Tag className={cn("notranslate", className)} translate="no" {...rest}>
      {children}
    </Tag>
  );
}
