// ConfirmationModal.js - Reusable confirmation modal component with variant support

import { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Predefined variants for common modal types
const MODAL_VARIANTS = {
  default: {
    icon: 'help-circle',
    iconColor: '#DC2626',
    confirmColor: '#DC2626',
  },
  error: {
    icon: 'close-circle',
    iconColor: '#DC2626',
    confirmColor: '#DC2626',
  },
  warning: {
    icon: 'warning',
    iconColor: '#F59E0B',
    confirmColor: '#F59E0B',
  },
  success: {
    icon: 'checkmark-circle',
    iconColor: '#10B981',
    confirmColor: '#10B981',
  },
  info: {
    icon: 'information-circle',
    iconColor: '#3B82F6',
    confirmColor: '#3B82F6',
  },
  destructive: {
    icon: 'trash',
    iconColor: '#DC2626',
    confirmColor: '#DC2626',
  },
};

const ConfirmationModal = memo(({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default', // 'default', 'error', 'warning', 'success', 'info', 'destructive'
  icon, // Override variant icon
  iconColor, // Override variant icon color
  confirmColor, // Override variant confirm button color
  confirmDestructive = false, // Legacy prop for destructive style
  loading = false,
  singleButton = false, // Show only confirm button (no cancel)
}) => {
  if (!visible) return null;

  // Get variant settings
  const variantSettings = MODAL_VARIANTS[variant] || MODAL_VARIANTS.default;
  
  // Use custom values or fall back to variant defaults
  const finalIcon = icon || variantSettings.icon;
  const finalIconColor = iconColor || variantSettings.iconColor;
  const finalConfirmColor = confirmColor || (confirmDestructive ? '#DC2626' : variantSettings.confirmColor);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalWrapper}>
        <TouchableOpacity 
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={styles.modalContainer}>
          {/* Icon */}
          {finalIcon && (
            <View style={[styles.iconContainer, { backgroundColor: `${finalIconColor}20` }]}>
              <Ionicons name={finalIcon} size={32} color={finalIconColor} />
            </View>
          )}

          {/* Title */}
          <Text style={styles.modalTitle}>{title}</Text>

          {/* Message */}
          <Text style={styles.modalMessage}>{message}</Text>

          {/* Buttons */}
          <View style={[styles.buttonContainer, singleButton && styles.buttonContainerSingle]}>
            {!singleButton && cancelText && (
              <TouchableOpacity
                style={[styles.cancelButton, singleButton && { display: 'none' }]}
                onPress={onClose}
                activeOpacity={0.7}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: finalConfirmColor },
                loading && styles.buttonDisabled,
                singleButton && styles.confirmButtonFull,
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? 'Processing...' : confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  buttonContainerSingle: {
    flexDirection: 'column',
  },
  cancelButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3A3A3A',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonFull: {
    width: '100%',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ConfirmationModal;