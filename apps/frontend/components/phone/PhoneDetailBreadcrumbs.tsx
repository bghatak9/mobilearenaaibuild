"use client";

import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { useSiteLanguage } from "@/lib/site-language";

type PhoneDetailBreadcrumbsProps = {
  deviceName: string;
  brandName?: string | null;
  className?: string;
};

/**
 * Breadcrumbs use curated chrome labels + English device name so Google
 * Translate can localize the device title with the rest of the page.
 */
export function PhoneDetailBreadcrumbs({
  deviceName,
  brandName: _brandName,
  className,
}: PhoneDetailBreadcrumbsProps) {
  void _brandName;
  const { t } = useSiteLanguage();

  return (
    <Breadcrumbs
      className={className}
      items={[
        { label: t("common.home"), href: "/" },
        { label: t("phones.title"), href: "/phones" },
        { label: deviceName },
      ]}
    />
  );
}
