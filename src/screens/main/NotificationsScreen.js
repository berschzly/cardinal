import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  RefreshControl 
} from 'react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, SPACING, FONTS } from '../../utils/constants';
import Loading from '../../components/common/Loading';

export default function NotificationsScreen({ navigation }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*, gift_cards(store_name, balance, image_url)')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Load notifications error:', error);
    }
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, []);

  const handleNotificationPress = (notification) => {
    if (notification.gift_card_id) {
      navigation.navigate('Dashboard', {
        screen: 'CardDetails',
        params: { id: notification.gift_card_id }
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'location': return '📍';
      case 'expiration': return '⏰';
      default: return '🔔';
    }
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>
            We'll notify you when you're near stores with gift cards
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.notificationItem}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationBody} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text style={styles.notificationDate}>
                  {formatDate(item.sent_at)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  header: { 
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: FONTS.weights.bold, 
    color: COLORS.textPrimary 
  },
  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyIcon: { 
    fontSize: 64, 
    marginBottom: SPACING.lg 
  },
  emptyText: { 
    fontSize: 18, 
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.textPrimary, 
    marginBottom: SPACING.sm 
  },
  emptySubtext: { 
    fontSize: 14, 
    color: COLORS.textSecondary, 
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationItem: { 
    backgroundColor: COLORS.surface, 
    padding: SPACING.md, 
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  typeIcon: { 
    fontSize: 24, 
    marginRight: SPACING.md, 
    marginTop: 2 
  },
  notificationContent: { 
    flex: 1 
  },
  notificationTitle: { 
    fontSize: 16, 
    fontWeight: FONTS.weights.semiBold, 
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  notificationBody: { 
    fontSize: 14, 
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  notificationDate: { 
    fontSize: 12, 
    color: COLORS.textSecondary 
  },
});