import { Link } from "@/i18n/navigation";
import type { ComponentProps, ReactNode } from "react";

type Props = ComponentProps<typeof Link> & {
  children: ReactNode;
};

/** Device card link — navigates to the device page. */
export function DeviceBriefLink({ children, ...linkProps }: Props) {
  return <Link {...linkProps}>{children}</Link>;
}
