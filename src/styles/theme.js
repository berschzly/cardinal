import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/constants';

// ====================================
// THEME CONFIGURATION
// ====================================
// Centralized theme object for consistent styling across the app

export const theme = {
  colors: COLORS,
  fonts: FONTS,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
};

// ====================================
// COMMON COMPONENT STYLES
// ====================================
// Reusable style objects for common UI patterns

export const commonStyles = {
  // Container styles
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  contentContainer: {
    padding: SPACING.md,
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  
  // Card styles
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  
  cardElevated: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  
  cardFlat: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  // Button styles
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  
  buttonSecondary: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  
  buttonDisabled: {
    backgroundColor: COLORS.disabled,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Text styles
  heading1: {
    fontSize: FONTS.sizes['4xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    lineHeight: FONTS.sizes['4xl'] * FONTS.lineHeights.tight,
  },
  
  heading2: {
    fontSize: FONTS.sizes['3xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    lineHeight: FONTS.sizes['3xl'] * FONTS.lineHeights.tight,
  },
  
  heading3: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    lineHeight: FONTS.sizes['2xl'] * FONTS.lineHeights.normal,
  },
  
  heading4: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    lineHeight: FONTS.sizes.xl * FONTS.lineHeights.normal,
  },
  
  bodyLarge: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.regular,
    color: COLORS.text,
    lineHeight: FONTS.sizes.lg * FONTS.lineHeights.normal,
  },
  
  body: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.regular,
    color: COLORS.text,
    lineHeight: FONTS.sizes.base * FONTS.lineHeights.normal,
  },
  
  bodySmall: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.regular,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.sm * FONTS.lineHeights.normal,
  },
  
  caption: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.regular,
    color: COLORS.textLight,
    lineHeight: FONTS.sizes.xs * FONTS.lineHeights.normal,
  },
  
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  
  link: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.medium,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  
  // Input styles
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
  },
  
  inputFocused: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.borderFocus,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
  },
  
  inputError: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
  },
  
  inputDisabled: {
    backgroundColor: COLORS.disabled,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.base,
    color: COLORS.textMuted,
  },
  
  // Badge styles
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  
  badgeSuccess: {
    backgroundColor: COLORS.active,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  
  badgeWarning: {
    backgroundColor: COLORS.expiringSoon,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  
  badgeError: {
    backgroundColor: COLORS.expired,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  
  badgeInfo: {
    backgroundColor: COLORS.blueGrey,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  
  // Divider styles
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  
  dividerVertical: {
    width: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: SPACING.md,
  },
  
  // List item styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  
  listItemPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  
  // Icon container styles
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconContainerSecondary: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  // Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  
  emptyStateText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  
  emptyStateSubtext: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  
  // Error styles
  errorContainer: {
    backgroundColor: COLORS.expired,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.expiredText,
    fontWeight: FONTS.weights.medium,
  },
  
  // Success styles
  successContainer: {
    backgroundColor: COLORS.active,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  
  successText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.activeText,
    fontWeight: FONTS.weights.medium,
  },
};

// ====================================
// LAYOUT HELPERS
// ====================================
// Utility functions for layout calculations

export const layout = {
  // Flex helpers
  row: {
    flexDirection: 'row',
  },
  
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  rowAround: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  columnCenter: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Flex values
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flex3: { flex: 3 },
  
  // Alignment
  alignStart: { alignItems: 'flex-start' },
  alignCenter: { alignItems: 'center' },
  alignEnd: { alignItems: 'flex-end' },
  
  justifyStart: { justifyContent: 'flex-start' },
  justifyCenter: { justifyContent: 'center' },
  justifyEnd: { justifyContent: 'flex-end' },
  justifyBetween: { justifyContent: 'space-between' },
  justifyAround: { justifyContent: 'space-around' },
  
  // Self alignment
  selfStart: { alignSelf: 'flex-start' },
  selfCenter: { alignSelf: 'center' },
  selfEnd: { alignSelf: 'flex-end' },
  selfStretch: { alignSelf: 'stretch' },
};

export default theme;