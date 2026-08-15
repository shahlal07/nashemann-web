import {
  FileEdit,
  Rocket,
  ShoppingBag,
  TrendingUp,
  Palette,
  PackageCheck,
  Boxes,
  LineChart,
  MessageCircle,
  ShieldCheck,
  Sprout,
  Trees,
  Flower2,
  Star,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP = {
  FileEdit,
  Rocket,
  ShoppingBag,
  TrendingUp,
  Palette,
  PackageCheck,
  Boxes,
  LineChart,
  MessageCircle,
  ShieldCheck,
  Sprout,
  Trees,
  Flower2,
  Star,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICON_MAP;

export function Icon({ name, ...props }: { name: IconName } & React.ComponentProps<LucideIcon>) {
  const Cmp = ICON_MAP[name];
  return <Cmp {...props} />;
}
