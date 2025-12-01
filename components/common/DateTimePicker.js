import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Month/Year picker for gift card expiration dates
 * Automatically sets to the last day of the selected month
 */
export function DatePickerInput({
  label,
  value,
  onChange,
  helperText,
  placeholder = "Select Month & Year",
  error,
  touched,
  required = false,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(value ? value.getMonth() : new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(value ? value.getFullYear() : new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);

  // Get last day of month
  const getLastDayOfMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Format display value
  const getDisplayValue = () => {
    if (!value) return placeholder;
    const month = months[value.getMonth()];
    const year = value.getFullYear();
    return `${month} ${year}`;
  };

  const handleConfirm = () => {
    const lastDay = getLastDayOfMonth(selectedYear, selectedMonth);
    const newDate = new Date(selectedYear, selectedMonth, lastDay);
    onChange(newDate);
    setShowPicker(false);
  };

  const handleClear = () => {
    onChange(null);
    setShowPicker(false);
  };

  const handleCancel = () => {
    // Reset to current value or defaults
    if (value) {
      setSelectedMonth(value.getMonth());
      setSelectedYear(value.getFullYear());
    } else {
      setSelectedMonth(new Date().getMonth());
      setSelectedYear(new Date().getFullYear());
    }
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      {/* Input Button */}
      <TouchableOpacity
        style={[
          styles.input,
          error && touched && styles.inputError,
          value && styles.inputFilled,
        ]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <View style={styles.inputContent}>
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={value ? '#FFFFFF' : '#6B7280'} 
            style={styles.inputIcon}
          />
          <Text style={[
            styles.inputText,
            !value && styles.inputPlaceholder,
          ]}>
            {getDisplayValue()}
          </Text>
        </View>
        
        {value ? (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        ) : (
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        )}
      </TouchableOpacity>

      {/* Error Message */}
      {error && touched && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}

      {/* Picker Modal */}
      <Modal
        visible={showPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCancel}
          />
          
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Expiration Date</Text>
              <Text style={styles.modalSubtitle}>
                Card expires on the last day of the month
              </Text>
            </View>

            {/* Picker Content */}
            <View style={styles.pickerContainer}>
              {/* Month Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>Month</Text>
                <ScrollView 
                  style={styles.scrollView}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                >
                  {months.map((month, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.pickerItem,
                        selectedMonth === index && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedMonth(index)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        selectedMonth === index && styles.pickerItemTextSelected,
                      ]}>
                        {month}
                      </Text>
                      {selectedMonth === index && (
                        <Ionicons name="checkmark" size={20} color="#DC2626" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>Year</Text>
                <ScrollView 
                  style={styles.scrollView}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                >
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        selectedYear === year && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedYear(year)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        selectedYear === year && styles.pickerItemTextSelected,
                      ]}>
                        {year}
                      </Text>
                      {selectedYear === year && (
                        <Ionicons name="checkmark" size={20} color="#DC2626" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Preview */}
            <View style={styles.previewContainer}>
              <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" />
              <Text style={styles.previewText}>
                Expires: {months[selectedMonth]} {getLastDayOfMonth(selectedYear, selectedMonth)}, {selectedYear}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  // Label
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  required: {
    color: '#DC2626',
  },

  // Input
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F1F1F',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  inputError: {
    borderColor: '#DC2626',
  },
  inputFilled: {
    borderColor: '#374151',
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  inputPlaceholder: {
    color: '#6B7280',
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#DC2626',
  },

  // Helper Text
  helperText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#1F1F1F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#2A2A2A',
    paddingBottom: 40,
    maxHeight: '80%',
  },

  // Modal Header
  modalHeader: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },

  // Picker
  pickerContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    paddingTop: 16,
  },
  pickerColumn: {
    flex: 1,
  },
  columnLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollView: {
    maxHeight: 300,
  },
  scrollContent: {
    gap: 8,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141414',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pickerItemSelected: {
    backgroundColor: '#DC262620',
    borderColor: '#DC2626',
  },
  pickerItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  pickerItemTextSelected: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Preview
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#141414',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  previewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#141414',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  confirmButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});