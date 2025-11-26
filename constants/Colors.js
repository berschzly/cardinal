// Theme colors (fintech style)

// constants/Colors.js

/**
 * Color palette for Cardinal - Red themed fintech design
 * Cardinal = Red bird, so red is the primary brand color
 */

const Colors = {
  // Primary brand colors (CARDINAL RED)
  primary: '#dc2626', // Cardinal red - main brand color
  primaryDark: '#b91c1c',
  primaryLight: '#ef4444',
  
  // Background colors (dark theme)
  background: '#000000', // Pure black
  backgroundSecondary: '#0a0a0a', // Slightly lighter black
  surface: '#1a1a1a', // Card/component background
  surfaceLight: '#262626', // Hover/active states
  
  // Text colors
  text: '#ffffff', // Primary text (white)
  textSecondary: '#a3a3a3', // Secondary text (gray)
  textTertiary: '#737373', // Tertiary text (darker gray)
  textDisabled: '#525252', // Disabled text
  
  // Accent colors
  accent: '#dc2626', // Cardinal red accent
  accentSecondary: '#f97316', // Orange accent (complementary)
  
  // Status colors
  success: '#10b981', // Green - positive balance, active
  warning: '#f59e0b', // Amber - expiring soon
  error: '#ef4444', // Red - expired, errors
  info: '#3b82f6', // Blue - information
  
  // Card status colors (for expiration urgency)
  expired: '#ef4444', // Red
  critical: '#f97316', // Orange
  high: '#eab308', // Yellow
  medium: '#3b82f6', // Blue
  low: '#10b981', // Green
  none: '#6b7280', // Gray
  
  // Gradient colors (for cards) - Cardinal red themed
  gradientStart: '#dc2626', // Cardinal red
  gradientEnd: '#f97316', // Orange
  gradientStartAlt: '#b91c1c', // Dark cardinal red
  gradientEndAlt: '#dc2626', // Cardinal red
  
  // Border colors
  border: '#262626', // Default border
  borderLight: '#404040', // Lighter border
  borderFocus: '#dc2626', // Focused input border (cardinal red)
  
  // Overlay colors (with opacity)
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Premium colors
  premiumGold: '#fbbf24',
  premiumGradientStart: '#fbbf24',
  premiumGradientEnd: '#f59e0b',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowStrong: 'rgba(0, 0, 0, 0.5)',
  shadowCardinal: 'rgba(220, 38, 38, 0.3)', // Cardinal red shadow
  
  // Transparent
  transparent: 'transparent',
};

/**
 * Card gradient presets - Cardinal red themed
 */
export const CardGradients = {
  default: ['#dc2626', '#f97316'], // Cardinal red to orange
  cardinal: ['#b91c1c', '#dc2626'], // Dark red to cardinal red
  fire: ['#dc2626', '#fbbf24'], // Red to gold
  sunset: ['#f97316', '#fb923c'], // Orange variations
  blue: ['#3b82f6', '#06b6d4'], // Blue option
  green: ['#10b981', '#14b8a6'], // Green option
  premium: ['#fbbf24', '#f59e0b'], // Gold premium
};

/**
 * Gift card category colors
 * Users can organize cards by category with color coding
 */
export const CategoryColors = {
  // Shopping categories
  retail: '#3b82f6', // Blue
  grocery: '#10b981', // Green
  restaurant: '#f59e0b', // Amber
  fashion: '#ec4899', // Pink
  electronics: '#8b5cf6', // Purple
  home: '#06b6d4', // Cyan
  
  // Entertainment categories
  entertainment: '#a855f7', // Purple
  gaming: '#6366f1', // Indigo
  streaming: '#ef4444', // Red
  books: '#84cc16', // Lime
  music: '#f97316', // Orange
  
  // Services categories
  gas: '#eab308', // Yellow
  travel: '#0ea5e9', // Sky blue
  fitness: '#14b8a6', // Teal
  beauty: '#f472b6', // Pink
  
  // Other
  gift: '#dc2626', // Cardinal red
  rewards: '#fbbf24', // Gold
  other: '#6b7280', // Gray
  uncategorized: '#525252', // Dark gray
};

/**
 * Brand color variations by merchant/card type
 * For automatically styling cards based on brand
 */
export const BrandColors = {
  // Retail
  amazon: '#ff9900',
  target: '#cc0000',
  walmart: '#0071ce',
  bestbuy: '#0046be',
  kohls: '#6b4e71',
  macys: '#e21b23',
  nordstrom: '#00264d',
  
  // Food & Dining
  starbucks: '#00704a',
  mcdonalds: '#ffc72c',
  chipotle: '#a51c30',
  panera: '#6f5438',
  subway: '#008c15',
  dunkin: '#ff6600',
  
  // Tech & Electronics
  apple: '#000000',
  microsoft: '#00a4ef',
  steam: '#171a21',
  playstation: '#003791',
  xbox: '#107c10',
  nintendo: '#e60012',
  
  // Fashion
  nike: '#111111',
  adidas: '#000000',
  underarmour: '#1d1d1d',
  gap: '#00205b',
  
  // Entertainment
  netflix: '#e50914',
  spotify: '#1db954',
  hulu: '#1ce783',
  disney: '#113ccf',
  amc: '#000000',
  
  // Payment cards
  visa: '#1a1f71',
  mastercard: '#eb001b',
  amex: '#006fcf',
  discover: '#ff6000',
  
  // Gas & Auto
  shell: '#fbce07',
  exxon: '#ef1e26',
  chevron: '#005eb8',
  bp: '#009639',
  
  // Default fallback - cardinal red
  default: '#dc2626',
};

/**
 * Status badge colors
 */
export const StatusColors = {
  active: Colors.success,
  expiring: Colors.warning,
  expired: Colors.error,
  pending: Colors.info,
};

/**
 * Shadow presets
 */
export const Shadows = {
  small: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.shadowStrong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cardinalGlow: {
    shadowColor: Colors.shadowCardinal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
};

/**
 * Opacity values
 */
export const Opacity = {
  disabled: 0.5,
  hover: 0.8,
  pressed: 0.6,
  overlay: 0.7,
};

/**
 * Border radius values
 */
export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  full: 9999,
};

/**
 * Spacing values (multiples of 4)
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

/**
 * Font sizes
 */
export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

/**
 * Font weights
 */
export const FontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

/**
 * Get color by urgency level
 * @param {string} urgency - Urgency level (expired, critical, high, medium, low, none)
 * @returns {string} - Hex color
 */
export function getColorByUrgency(urgency) {
  return Colors[urgency] || Colors.none;
}

/**
 * Get brand color by company name
 * @param {string} brand - Brand name (lowercase)
 * @returns {string} - Hex color
 */
export function getBrandColor(brand) {
  if (!brand) return BrandColors.default;
  const brandKey = brand.toLowerCase().replace(/\s+/g, '');
  return BrandColors[brandKey] || BrandColors.default;
}

/**
 * Get category color
 * @param {string} category - Category name
 * @returns {string} - Hex color
 */
export function getCategoryColor(category) {
  if (!category) return CategoryColors.uncategorized;
  const categoryKey = category.toLowerCase().replace(/\s+/g, '');
  return CategoryColors[categoryKey] || CategoryColors.other;
}

/**
 * Get status color
 * @param {string} status - Status (active, expiring, expired, pending)
 * @returns {string} - Hex color
 */
export function getStatusColor(status) {
  return StatusColors[status] || Colors.textSecondary;
}

export default Colors;