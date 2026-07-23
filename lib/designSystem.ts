// Design System Tokens — The Edge
// Extracted from existing project. All values map to Tailwind CSS variables.

export const colors = {
  // Primary (brand green)
  primary: "hsl(134 81% 65%)",
  primaryForeground: "hsl(222 30% 10%)",
  primaryGlow: "hsl(134 81% 75%)",
  primaryDark: "hsl(134 81% 60%)",

  // Success (green)
  success: "hsl(134 81% 65%)",
  successForeground: "hsl(222 30% 10%)",
  successSoft: "hsl(137 100% 87%)",

  // Warning (amber)
  warning: "hsl(38 100% 60%)",
  warningForeground: "hsl(222 30% 10%)",

  // Destructive (red)
  destructive: "hsl(0 84% 60%)",
  destructiveForeground: "hsl(0 0% 100%)",

  // Backgrounds
  background: "hsl(0 0% 100%)",
  backgroundDark: "hsl(222 30% 6%)",

  // Surface
  card: "hsl(0 0% 100%)",
  cardDark: "hsl(222 25% 9%)",

  // Neutral
  secondary: "hsl(220 14% 96%)",
  secondaryDark: "hsl(222 20% 14%)",
  muted: "hsl(220 14% 96%)",
  mutedForeground: "hsl(220 9% 46%)",
  mutedForegroundDark: "hsl(220 10% 65%)",

  // Accent (soft green)
  accent: "hsl(137 100% 92%)",
  accentForeground: "hsl(222 30% 10%)",

  // Border
  border: "hsl(220 13% 91%)",
  borderDark: "hsl(222 20% 16%)",
};

export const gradients = {
  hero: "linear-gradient(135deg, hsl(134 81% 65%) 0%, hsl(142 76% 80%) 45%, hsl(137 100% 92%) 100%)",
  success: "linear-gradient(135deg, hsl(137 100% 87%) 0%, hsl(134 81% 65%) 100%)",
};

export const shadows = {
  soft: "0 1px 2px hsl(0 0% 0% / 0.04), 0 4px 12px hsl(0 0% 0% / 0.04)",
  elevated: "0 8px 30px -8px hsl(0 0% 0% / 0.12), 0 2px 8px hsl(0 0% 0% / 0.06)",
  pop: "0 20px 60px -20px hsl(0 0% 0% / 0.15)",
};

export const typography = {
  fonts: {
    sans: "Inter, system-ui, -apple-system, sans-serif",
    mono: "JetBrains Mono, ui-monospace, monospace",
  },
  letterSpacing: {
    body: "-0.011em",
    heading: "-0.025em",
    mono: "0.12em",
  },
};

export const radius = {
  sm: "calc(1rem - 4px)",  // 12px
  md: "calc(1rem - 2px)",  // 14px
  lg: "1rem",              // 16px (rounded-2xl)
  xl: "1.5rem",            // 24px (rounded-3xl, cards)
  xxl: "2rem",             // 32px (hero cards)
  full: "9999px",          // pill shape
};

export const spacing = {
  containerPadding: "1rem",
  sectionGap: "3.5rem",
  cardPadding: "1.25rem",
  cardGap: "1.25rem",
};

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
};

export const dietaryFilters = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Halal",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Desserts",
] as const;
export type DietaryTag = typeof dietaryFilters[number];

export const orderStatuses = ["new", "preparing", "ready", "completed", "expired", "customer_late"] as const;
export type OrderStatus = typeof orderStatuses[number];
