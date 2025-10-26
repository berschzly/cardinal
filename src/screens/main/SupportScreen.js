import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Linking,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/constants';

const FAQ_DATA = [
  {
    id: 1,
    question: 'How do I add a gift card?',
    answer: 'Tap the "+" button in the center of the bottom navigation bar. You can manually enter card details or scan a physical card using your camera (Premium feature).',
  },
  {
    id: 2,
    question: 'How do I edit a gift card?',
    answer: 'Tap on any gift card to view its details, then tap the "Edit Card" button. You can update the balance, expiration date, or any other information.',
  },
  {
    id: 3,
    question: 'What happens when a card expires?',
    answer: 'Expired cards will be highlighted with a red badge. You\'ll receive notifications before cards expire if you have notifications enabled.',
  },
  {
    id: 4,
    question: 'How do location notifications work?',
    answer: 'When you enable location notifications (Premium feature), Cardinal will alert you when you\'re near a store where you have a gift card, so you never forget to use it!',
  },
  {
    id: 5,
    question: 'What\'s included in Premium?',
    answer: 'Premium includes: unlimited gift cards, card scanning with OCR, location-based notifications, no ads, and priority support.',
  },
  {
    id: 6,
    question: 'How do I mark a card as used?',
    answer: 'Open the card details and tap "Mark as Used". This moves the card to your used cards section while keeping the history.',
  },
  {
    id: 7,
    question: 'Can I restore deleted cards?',
    answer: 'Unfortunately, deleted cards cannot be restored. Make sure you really want to delete a card before confirming.',
  },
  {
    id: 8,
    question: 'Is my data secure?',
    answer: 'Yes! All your data is encrypted and securely stored. We use industry-standard security practices and never share your information with third parties.',
  },
  {
    id: 9,
    question: 'How do I cancel Premium?',
    answer: 'Premium subscriptions are managed through the App Store (iOS) or Google Play (Android). Go to your device\'s subscription settings to cancel.',
  },
  {
    id: 10,
    question: 'Why can\'t I add more cards?',
    answer: 'Free users can store up to 15 gift cards. Upgrade to Premium for unlimited cards!',
  },
];

const SupportScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Calculate bottom padding for tab bar
  const tabBarHeight = Platform.OS === 'ios' ? 95 : 82;
  const bottomPadding = tabBarHeight + SPACING.md;

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSubmitContact = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Missing Information', 'Please fill in both subject and message.');
      return;
    }

    setSubmitting(true);

    // Simulate API call (replace with actual implementation)
    try {
      // TODO: Send to your support email or ticketing system
      // For now, just open email client
      const supportEmail = 'support@cardinal.app'; // Replace with your support email
      const emailSubject = encodeURIComponent(`[Cardinal Support] ${subject}`);
      const emailBody = encodeURIComponent(
        `User: ${user?.email || 'Unknown'}\n\n${message}`
      );
      
      const mailtoURL = `mailto:${supportEmail}?subject=${emailSubject}&body=${emailBody}`;
      
      const canOpen = await Linking.canOpenURL(mailtoURL);
      if (canOpen) {
        await Linking.openURL(mailtoURL);
        
        Alert.alert(
          'Email Client Opened',
          'Please send the email from your mail app to complete your support request.',
          [
            {
              text: 'OK',
              onPress: () => {
                setSubject('');
                setMessage('');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Could not open email client. Please email us at support@cardinal.app');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      Alert.alert('Error', 'Failed to open email client. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomPadding },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => {
                  Alert.alert(
                    'Email Support',
                    'Send us an email at support@cardinal.app'
                  );
                }}
              >
                <Text style={styles.quickActionIcon}>📧</Text>
                <Text style={styles.quickActionLabel}>Email Us</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => {
                  Linking.openURL('https://cardinal.app/docs'); // Replace with your docs URL
                }}
              >
                <Text style={styles.quickActionIcon}>📖</Text>
                <Text style={styles.quickActionLabel}>Documentation</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => {
                  Linking.openURL('https://twitter.com/cardinalapp'); // Replace with your Twitter
                }}
              >
                <Text style={styles.quickActionIcon}>🐦</Text>
                <Text style={styles.quickActionLabel}>Twitter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => {
                  Alert.alert(
                    'Cardinal',
                    'Version 1.0.0\n\nA simple gift card manager by Cardinal Team'
                  );
                }}
              >
                <Text style={styles.quickActionIcon}>ℹ️</Text>
                <Text style={styles.quickActionLabel}>About</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

            {FAQ_DATA.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={styles.faqItem}
                onPress={() => toggleFAQ(faq.id)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Text style={styles.faqToggle}>
                    {expandedId === faq.id ? '−' : '+'}
                  </Text>
                </View>
                {expandedId === faq.id && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Support</Text>
            <Text style={styles.sectionDescription}>
              Can't find what you're looking for? Send us a message and we'll get back to you soon.
            </Text>

            <View style={styles.contactForm}>
              <TextInput
                style={styles.input}
                placeholder="Subject"
                placeholderTextColor={COLORS.textLight}
                value={subject}
                onChangeText={setSubject}
                maxLength={100}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your issue or question..."
                placeholderTextColor={COLORS.textLight}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                maxLength={1000}
                textAlignVertical="top"
              />

              <Text style={styles.characterCount}>
                {message.length} / 1000 characters
              </Text>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!subject.trim() || !message.trim() || submitting) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitContact}
                disabled={!subject.trim() || !message.trim() || submitting}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Additional Resources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Resources</Text>

            <TouchableOpacity
              style={styles.resourceItem}
              onPress={() => navigation.navigate('Subscription')}
            >
              <Text style={styles.resourceIcon}>⭐</Text>
              <View style={styles.resourceText}>
                <Text style={styles.resourceLabel}>Upgrade to Premium</Text>
                <Text style={styles.resourceDescription}>
                  Unlock unlimited cards and premium features
                </Text>
              </View>
              <Text style={styles.resourceArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resourceItem}
              onPress={() => {
                Linking.openURL('https://cardinal.app/privacy');
              }}
            >
              <Text style={styles.resourceIcon}>🔒</Text>
              <View style={styles.resourceText}>
                <Text style={styles.resourceLabel}>Privacy Policy</Text>
                <Text style={styles.resourceDescription}>
                  How we protect your data
                </Text>
              </View>
              <Text style={styles.resourceArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resourceItem}
              onPress={() => {
                Linking.openURL('https://cardinal.app/terms');
              }}
            >
              <Text style={styles.resourceIcon}>📄</Text>
              <View style={styles.resourceText}>
                <Text style={styles.resourceLabel}>Terms of Service</Text>
                <Text style={styles.resourceDescription}>
                  Our terms and conditions
                </Text>
              </View>
              <Text style={styles.resourceArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },

  backButton: {
    paddingVertical: SPACING.xs,
    paddingRight: SPACING.md,
  },

  backButtonText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },

  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },

  headerSpacer: {
    width: 60,
  },

  keyboardView: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: SPACING.md,
  },

  section: {
    marginBottom: SPACING.xl,
  },

  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  sectionDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: FONTS.sizes.sm * 1.5,
  },

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },

  quickActionCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  quickActionIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },

  quickActionLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
    textAlign: 'center',
  },

  faqItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  faqQuestion: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },

  faqToggle: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.light,
    color: COLORS.primary,
    width: 24,
    textAlign: 'center',
  },

  faqAnswer: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    lineHeight: FONTS.sizes.sm * 1.6,
  },

  contactForm: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },

  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  textArea: {
    height: 150,
    paddingTop: SPACING.md,
  },

  characterCount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    textAlign: 'right',
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },

  submitButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  submitButtonDisabled: {
    backgroundColor: COLORS.disabled,
    opacity: 0.6,
  },

  submitButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.background,
  },

  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  resourceIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },

  resourceText: {
    flex: 1,
  },

  resourceLabel: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },

  resourceDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },

  resourceArrow: {
    fontSize: FONTS.sizes['2xl'],
    color: COLORS.textLight,
    fontWeight: FONTS.weights.light,
  },
});

export default SupportScreen;