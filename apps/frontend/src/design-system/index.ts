/**
 * MobileArena Design System
 * Incremental adoption — tokens first, components gradually.
 * @see src/design-system/ for colors, typography, spacing, animations, shadows, themes
 */

export { colors, cssColorVars } from "./colors";
export { typography, fontFamily, typographyClasses } from "./typography";
export { spacing, radius, spaceVars } from "./spacing";
export { animations, motionClasses } from "./animations";
export { shadows, shadowClasses } from "./shadows";
export { themes, themeCssVars, STORAGE_KEY, type ThemeMode } from "./themes";

export { cn } from "./utils/cn";

/* Components — adopt page-by-page (Step 2) */
export { Button } from "./buttons/Button";
export { Card } from "./cards/Card";
export { Badge } from "./badges/Badge";
export { Input } from "./forms/Input";
export { SearchBar } from "./forms/SearchBar";
export { Modal } from "./modals/Modal";
export { Dropdown } from "./navigation/Dropdown";
export { Tabs } from "./navigation/Tabs";
export { Breadcrumbs } from "./navigation/Breadcrumbs";
export type { BreadcrumbItem } from "./navigation/Breadcrumbs";
export { ToastProvider, useToast } from "./feedback/Toast";
export { Skeleton } from "./feedback/Skeleton";
export { Avatar } from "./feedback/Avatar";
export { Pagination } from "./data/Pagination";
export { SwipePagination } from "./data/SwipePagination";
export { SwipePagedList } from "@/components/ui/SwipePagedList";
export { DataTable } from "./data/DataTable";

/* Phase 3+ — available but not wired into main layout yet */
export { FloatingNav, trackRecentDevice } from "./navigation/FloatingNav";
export { AuroraHero } from "./animations/AuroraHero";
export { ArenaCard } from "./cards/ArenaCard";
export { SpectrumPanel } from "./panels/SpectrumPanel";
export type { SpectrumPanelVariant } from "./panels/SpectrumPanel";

/* Titan Spectrum */
export {
  TITAN_ACCENTS,
  NAV_LINK_ACCENTS,
  accentForNavHref,
  accentForPathname,
  type TitanAccent,
} from "./titan-spectrum/category-accents";
export {
  brandThemes,
  brandAccent,
  type BrandThemeKey,
} from "./titan-spectrum/brand-themes";
export {
  SpectrumBatteryIcon,
  SpectrumChipIcon,
  SpectrumCompareIcon,
  SpectrumGridIcon,
  SpectrumLensIcon,
  SpectrumSignalIcon,
} from "./titan-spectrum/SpectrumIcons";
