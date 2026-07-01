/**
 * Titan Spectrum Design System v1.0
 * @mobilearena/ui — shared primitives for MobileArena
 */

export { cn } from "./lib/cn";

export { brandThemes, getBrandColor, type BrandSlug } from "./tokens/brand-themes";
export {
  categoryAccents,
  resolveGadgetCategory,
  getCategoryClass,
  getCategoryAccent,
  type GadgetCategory,
} from "./tokens/categories";
export {
  titanGradients,
  HERO_GRADIENTS,
  type TitanGradient,
} from "./tokens/gradients";

export { Button, type ButtonProps, type ButtonVariant } from "./components/Button";
export { Card, type CardProps } from "./components/Card";
export { Badge, type BadgeProps } from "./components/Badge";
export { Chip, type ChipProps } from "./components/Chip";
export { Container, type ContainerProps } from "./components/Container";
export { Input, type InputProps } from "./components/Input";
export {
  SpecTable,
  type SpecTableProps,
  type SpecSection,
  type SpecRow,
} from "./components/SpecTable";

export {
  TitanLogo,
  SmartphoneIcon,
  SpecGridIcon,
  CompareScaleIcon,
} from "./icons";
