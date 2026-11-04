import {
  ArrowLeftRight,
  Baby,
  Briefcase,
  Bus,
  Car,
  Coffee,
  Dumbbell,
  Folder,
  Fuel,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Key,
  Landmark,
  Music,
  Package,
  PawPrint,
  PiggyBank,
  Pill,
  Plane,
  Popcorn,
  Repeat,
  Shirt,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Utensils,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { CATEGORY_ICONS, type CategoryIconName } from '@finance/shared-types'

const CATEGORY_ICON_MAP: Record<CategoryIconName, LucideIcon> = {
  groceries: ShoppingCart,
  transport: Bus,
  salary: Wallet,
  entertainment: Popcorn,
  transfers: ArrowLeftRight,
  uncategorized: Folder,
  other: Package,
  food: Utensils,
  coffee: Coffee,
  car: Car,
  fuel: Fuel,
  home: Home,
  rent: Key,
  utilities: Zap,
  health: HeartPulse,
  pharmacy: Pill,
  gifts: Gift,
  travel: Plane,
  clothes: Shirt,
  tech: Smartphone,
  education: GraduationCap,
  sport: Dumbbell,
  pets: PawPrint,
  kids: Baby,
  subscriptions: Repeat,
  taxes: Landmark,
  savings: PiggyBank,
  freelance: Briefcase,
  beauty: Sparkles,
  music: Music,
}

function isCategoryIconName(value: string): value is CategoryIconName {
  return (CATEGORY_ICONS as readonly string[]).includes(value)
}

interface CategoryIconProps {
  name: string
  size?: number
  color?: string
}

export const CategoryIcon = ({ name, size = 16, color }: CategoryIconProps) => {
  const Icon = isCategoryIconName(name) ? CATEGORY_ICON_MAP[name] : Folder
  return <Icon size={size} color={color} aria-hidden />
}