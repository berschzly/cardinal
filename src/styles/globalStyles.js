import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/constants';

// ====================================
// GLOBAL STYLES
// ====================================
// Pre-defined StyleSheet objects that can be imported and used directly
// These are performance-optimized and avoid re-creating style objects

export const globalStyles = StyleSheet.create({
  // ====================================
  // CONTAINER STYLES
  // ====================================
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeAreaContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },

  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },

  paddedContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },

  // ====================================
  // CARD STYLES
  // ====================================
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },

  cardLarge: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },

  cardSmall: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },

  cardFlat: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cardElevated: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },

  // ====================================
  // BUTTON STYLES
  // ====================================
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },

  buttonLarge: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },

  buttonSmall: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
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

  buttonGhost: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonDisabled: {
    backgroundColor: COLORS.disabled,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ====================================
  // BUTTON TEXT STYLES
  // ====================================
  buttonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
  },

  buttonTextPrimary: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.background, // Dark text on light button
  },

  buttonTextSecondary: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
  },

  buttonTextOutline: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.primary,
  },

  buttonTextDisabled: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.textMuted,
  },

  // ====================================
  // TEXT STYLES
  // ====================================
  h1: {
    fontSize: FONTS.sizes['4xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  h2: {
    fontSize: FONTS.sizes['3xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  h3: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  h4: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  body: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.regular,
    color: COLORS.text,
    lineHeight: FONTS.sizes.base * 1.5,
  },

  bodyLarge: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.regular,
    color: COLORS.text,
    lineHeight: FONTS.sizes.lg * 1.5,
  },

  bodySmall: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.regular,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.sm * 1.5,
  },

  caption: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.regular,
    color: COLORS.textLight,
    lineHeight: FONTS.sizes.xs * 1.5,
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

  textCenter: {
    textAlign: 'center',
  },

  textRight: {
    textAlign: 'right',
  },

  textBold: {
    fontWeight: FONTS.weights.bold,
  },

  textSemiBold: {
    fontWeight: FONTS.weights.semiBold,
  },

  textMedium: {
    fontWeight: FONTS.weights.medium,
  },

  textSecondary: {
    color: COLORS.textSecondary,
  },

  textLight: {
    color: COLORS.textLight,
  },

  textMuted: {
    color: COLORS.textMuted,
  },

  textPrimary: {
    color: COLORS.primary,
  },

  textError: {
    color: COLORS.error,
  },

  textSuccess: {
    color: COLORS.success,
  },

  textWarning: {
    color: COLORS.warning,
  },

  // ====================================
  // INPUT STYLES
  // ====================================
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  inputLarge: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  inputMultiline: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    marginBottom: SPACING.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  inputError: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  inputDisabled: {
    backgroundColor: COLORS.disabled,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },

  // ====================================
  // LAYOUT STYLES
  // ====================================
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

  rowStart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  rowEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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

  // ====================================
  // SPACING STYLES
  // ====================================
  mt_xs: { marginTop: SPACING.xs },
  mt_sm: { marginTop: SPACING.sm },
  mt_md: { marginTop: SPACING.md },
  mt_lg: { marginTop: SPACING.lg },
  mt_xl: { marginTop: SPACING.xl },

  mb_xs: { marginBottom: SPACING.xs },
  mb_sm: { marginBottom: SPACING.sm },
  mb_md: { marginBottom: SPACING.md },
  mb_lg: { marginBottom: SPACING.lg },
  mb_xl: { marginBottom: SPACING.xl },

  ml_xs: { marginLeft: SPACING.xs },
  ml_sm: { marginLeft: SPACING.sm },
  ml_md: { marginLeft: SPACING.md },
  ml_lg: { marginLeft: SPACING.lg },
  ml_xl: { marginLeft: SPACING.xl },

  mr_xs: { marginRight: SPACING.xs },
  mr_sm: { marginRight: SPACING.sm },
  mr_md: { marginRight: SPACING.md },
  mr_lg: { marginRight: SPACING.lg },
  mr_xl: { marginRight: SPACING.xl },

  mx_xs: { marginHorizontal: SPACING.xs },
  mx_sm: { marginHorizontal: SPACING.sm },
  mx_md: { marginHorizontal: SPACING.md },
  mx_lg: { marginHorizontal: SPACING.lg },
  mx_xl: { marginHorizontal: SPACING.xl },

  my_xs: { marginVertical: SPACING.xs },
  my_sm: { marginVertical: SPACING.sm },
  my_md: { marginVertical: SPACING.md },
  my_lg: { marginVertical: SPACING.lg },
  my_xl: { marginVertical: SPACING.xl },

  pt_xs: { paddingTop: SPACING.xs },
  pt_sm: { paddingTop: SPACING.sm },
  pt_md: { paddingTop: SPACING.md },
  pt_lg: { paddingTop: SPACING.lg },
  pt_xl: { paddingTop: SPACING.xl },

  pb_xs: { paddingBottom: SPACING.xs },
  pb_sm: { paddingBottom: SPACING.sm },
  pb_md: { paddingBottom: SPACING.md },
  pb_lg: { paddingBottom: SPACING.lg },
  pb_xl: { paddingBottom: SPACING.xl },

  pl_xs: { paddingLeft: SPACING.xs },
  pl_sm: { paddingLeft: SPACING.sm },
  pl_md: { paddingLeft: SPACING.md },
  pl_lg: { paddingLeft: SPACING.lg },
  pl_xl: { paddingLeft: SPACING.xl },

  pr_xs: { paddingRight: SPACING.xs },
  pr_sm: { paddingRight: SPACING.sm },
  pr_md: { paddingRight: SPACING.md },
  pr_lg: { paddingRight: SPACING.lg },
  pr_xl: { paddingRight: SPACING.xl },

  px_xs: { paddingHorizontal: SPACING.xs },
  px_sm: { paddingHorizontal: SPACING.sm },
  px_md: { paddingHorizontal: SPACING.md },
  px_lg: { paddingHorizontal: SPACING.lg },
  px_xl: { paddingHorizontal: SPACING.xl },

  py_xs: { paddingVertical: SPACING.xs },
  py_sm: { paddingVertical: SPACING.sm },
  py_md: { paddingVertical: SPACING.md },
  py_lg: { paddingVertical: SPACING.lg },
  py_xl: { paddingVertical: SPACING.xl },

  // ====================================
  // BADGE STYLES
  // ====================================
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

  badgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
  },

  badgeTextSuccess: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.activeText,
  },

  badgeTextWarning: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.expiringSoonText,
  },

  badgeTextError: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.expiredText,
  },

  badgeTextInfo: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
  },

  // ====================================
  // DIVIDER STYLES
  // ====================================
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },

  dividerThick: {
    height: 2,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },

  dividerVertical: {
    width: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: SPACING.md,
  },

  // ====================================
  // ICON STYLES
  // ====================================
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainerLarge: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainerSmall: {
    width: 32,
    height: 32,
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
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ====================================
  // EMPTY STATE STYLES
  // ====================================
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

  // ====================================
  // LOADING STYLES
  // ====================================
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ====================================
  // MESSAGE STYLES
  // ====================================
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

  warningContainer: {
    backgroundColor: COLORS.expiringSoon,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },

  warningText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.expiringSoonText,
    fontWeight: FONTS.weights.medium,
  },

  infoContainer: {
    backgroundColor: COLORS.blueGrey,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },

  infoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: FONTS.weights.medium,
  },

  // ====================================
  // MISC STYLES
  // ====================================
  separator: {
    height: SPACING.md,
  },

  flex1: {
    flex: 1,
  },

  absolute: {
    position: 'absolute',
  },

  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },

  hidden: {
    display: 'none',
  },

  rounded: {
    borderRadius: RADIUS.md,
  },

  roundedFull: {
    borderRadius: RADIUS.full,
  },

  shadow: {
    ...SHADOWS.md,
  },

  shadowLarge: {
    ...SHADOWS.lg,
  },

  shadowSmall: {
    ...SHADOWS.sm,
  },
});

export default globalStyles;