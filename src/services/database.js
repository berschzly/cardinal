import { supabase } from './supabase';

// ====================================
// GIFT CARDS CRUD OPERATIONS
// ====================================

/**
 * Get all gift cards for the current user
 * @param {Object} filters - Optional filters (is_used, store_name, etc.)
 * @returns {Promise<{data, error}>}
 */
export const getGiftCards = async (filters = {}) => {
  try {
    let query = supabase
      .from('gift_cards')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.is_used !== undefined) {
      query = query.eq('is_used', filters.is_used);
    }

    if (filters.store_name) {
      query = query.ilike('store_name', `%${filters.store_name}%`);
    }

    if (filters.expiring_soon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query = query
        .not('expiration_date', 'is', null)
        .lte('expiration_date', thirtyDaysFromNow.toISOString())
        .gte('expiration_date', new Date().toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Get gift cards error:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Get a single gift card by ID
 * @param {string} cardId - Gift card ID
 * @returns {Promise<{data, error}>}
 */
export const getGiftCard = async (cardId) => {
  try {
    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Get gift card error:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Add a new gift card
 * @param {Object} cardData - Gift card data
 * @returns {Promise<{data, error}>}
 */
export const addGiftCard = async (cardData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user can add more cards (free tier limit)
    const canAdd = await checkCanAddCard();
    if (!canAdd) {
      throw new Error('You have reached the maximum number of gift cards for your plan. Upgrade to Premium for unlimited cards!');
    }

    const { data, error } = await supabase
      .from('gift_cards')
      .insert([
        {
          user_id: user.id,
          ...cardData,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Add gift card error:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Update an existing gift card
 * @param {string} cardId - Gift card ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
export const updateGiftCard = async (cardId, updates) => {
  try {
    const { data, error } = await supabase
      .from('gift_cards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Update gift card error:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Delete a gift card
 * @param {string} cardId - Gift card ID
 * @returns {Promise<{error}>}
 */
export const deleteGiftCard = async (cardId) => {
  try {
    const { error } = await supabase
      .from('gift_cards')
      .delete()
      .eq('id', cardId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Delete gift card error:', error);
    return { error: error.message };
  }
};

/**
 * Mark a gift card as used
 * @param {string} cardId - Gift card ID
 * @returns {Promise<{data, error}>}
 */
export const markCardAsUsed = async (cardId) => {
  try {
    const { data, error } = await supabase
      .from('gift_cards')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
      })
      .eq('id', cardId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Mark card as used error:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Get count of user's gift cards
 * @returns {Promise<{count, error}>}
 */
export const getGiftCardCount = async () => {
  try {
    const { count, error } = await supabase
      .from('gift_cards')
      .select('*', { count: 'exact', head: true })
      .eq('is_used', false);

    if (error) throw error;

    return { count, error: null };
  } catch (error) {
    console.error('Get gift card count error:', error);
    return { count: 0, error: error.message };
  }
};

/**
 * Check if user can add more gift cards (respects free tier limit)
 * @returns {Promise<boolean>}
 */
export const checkCanAddCard = async () => {
  try {
    // Get user's subscription status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: userProfile } = await supabase
      .from('users')
      .select('subscription_status, is_premium')
      .eq('id', user.id)
      .single();

    // Premium users have no limit
    if (userProfile?.is_premium || userProfile?.subscription_status === 'active') {
      return true;
    }

    // Check card count for free users
    const { count } = await getGiftCardCount();
    const MAX_FREE_CARDS = 15;

    return count < MAX_FREE_CARDS;
  } catch (error) {
    console.error('Check can add card error:', error);
    return false;
  }
};

/**
 * Get expiring gift cards (within 30 days)
 * @returns {Promise<{data, error}>}
 */
export const getExpiringCards = async () => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('is_used', false)
      .not('expiration_date', 'is', null)
      .lte('expiration_date', thirtyDaysFromNow.toISOString())
      .gte('expiration_date', new Date().toISOString())
      .order('expiration_date', { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Get expiring cards error:', error);
    return { data: null, error: error.message };
  }
};

// ====================================
// USER PROFILE OPERATIONS
// ====================================

/**
 * Get user profile
 * @returns {Promise<{data, error}>}
 */
export const getUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Get user profile error:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Update user profile
 * @param {Object} updates - Profile fields to update
 * @returns {Promise<{data, error}>}
 */
export const updateUserProfile = async (updates) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Update user profile error:', error);
    return { data: null, error: error.message };
  }
};

// ====================================
// PUSH NOTIFICATIONS & TOKENS
// ====================================

/**
 * Store push notification token for the current user
 * Used for sending push notifications (expiration alerts, location pings, etc.)
 * @param {string} token - Expo push token
 * @param {string} platform - 'ios' or 'android'
 * @returns {Promise<{data, error}>}
 */
export const storePushToken = async (token, platform) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if token already exists
    const { data: existingToken } = await supabase
      .from('push_tokens')
      .select('id')
      .eq('user_id', user.id)
      .eq('token', token)
      .single();

    if (existingToken) {
      // Token already exists, update last_used
      const { data, error } = await supabase
        .from('push_tokens')
        .update({ last_used: new Date().toISOString() })
        .eq('id', existingToken.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    }

    // Insert new token
    const { data, error } = await supabase
      .from('push_tokens')
      .insert([
        {
          user_id: user.id,
          token,
          platform,
          last_used: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Store push token error:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Remove push notification token (on logout or token invalidation)
 * @param {string} token - Expo push token
 * @returns {Promise<{error}>}
 */
export const removePushToken = async (token) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('token', token);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Remove push token error:', error);
    return { error: error.message };
  }
};

/**
 * Get all push tokens for the current user
 * @returns {Promise<{data, error}>}
 */
export const getUserPushTokens = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('push_tokens')
      .select('*')
      .eq('user_id', user.id)
      .order('last_used', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Get user push tokens error:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Update notification preferences in user profile
 * @param {Object} preferences - Notification settings
 * @param {boolean} preferences.location_notifications - Enable location-based notifications
 * @param {boolean} preferences.expiration_notifications - Enable expiration reminders
 * @returns {Promise<{data, error}>}
 */
export const updateNotificationPreferences = async (preferences) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update({
        location_notifications_enabled: preferences.location_notifications,
        expiration_reminders_enabled: preferences.expiration_notifications,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Update notification preferences error:', error);
    return { data: null, error: error.message };
  }
};

// ====================================
// SUBSCRIPTION OPERATIONS
// ====================================

/**
 * Check if user has an active premium subscription
 * @returns {Promise<{isPremium: boolean, error}>}
 */
export const checkPremiumStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: userProfile, error } = await supabase
      .from('users')
      .select('subscription_status, subscription_expires_at, is_premium')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    const isPremium = 
      userProfile?.is_premium ||
      (userProfile?.subscription_status === 'active' && 
       (!userProfile.subscription_expires_at || new Date(userProfile.subscription_expires_at) > new Date()));

    return { isPremium, error: null };
  } catch (error) {
    console.error('Check premium status error:', error);
    return { isPremium: false, error: error.message };
  }
};

/**
 * Update subscription status after purchase
 * @param {Object} subscriptionData - Subscription details
 * @param {string} subscriptionData.status - 'free', 'active', 'canceled', 'expired'
 * @param {string} subscriptionData.expiresAt - ISO date string
 * @returns {Promise<{data, error}>}
 */
export const updateSubscription = async (subscriptionData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update({
        subscription_status: subscriptionData.status,
        subscription_expires_at: subscriptionData.expiresAt,
        subscription_started_at: subscriptionData.status === 'active' ? new Date().toISOString() : undefined,
        is_premium: subscriptionData.status === 'active',
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Update subscription error:', error);
    return { data: null, error: error.message };
  }
};

// ====================================
// STATISTICS & ANALYTICS
// ====================================

/**
 * Get user statistics (total cards, total value, etc.)
 * @returns {Promise<{data, error}>}
 */
export const getUserStatistics = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get all cards
    const { data: cards, error: cardsError } = await getGiftCards();
    if (cardsError) throw new Error(cardsError);

    const activeCards = cards.filter(card => !card.is_used);
    const usedCards = cards.filter(card => card.is_used);

    // Calculate total value
    const totalValue = activeCards.reduce((sum, card) => {
      return sum + (parseFloat(card.balance) || 0);
    }, 0);

    // Get expiring cards count (next 30 days)
    const { data: expiringCards } = await getExpiringCards();
    
    // Count stores
    const uniqueStores = new Set(activeCards.map(card => card.store_name));

    const statistics = {
      totalCards: cards.length,
      activeCards: activeCards.length,
      usedCards: usedCards.length,
      totalValue: totalValue.toFixed(2),
      expiringCardsCount: expiringCards?.length || 0,
      uniqueStores: uniqueStores.size,
      onlineCards: activeCards.filter(card => card.is_online).length,
      physicalCards: activeCards.filter(card => !card.is_online).length,
    };

    return { data: statistics, error: null };
  } catch (error) {
    console.error('Get user statistics error:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Search gift cards by store name or card number
 * @param {string} searchQuery - Search term
 * @returns {Promise<{data, error}>}
 */
export const searchGiftCards = async (searchQuery) => {
  try {
    if (!searchQuery || searchQuery.trim().length === 0) {
      return getGiftCards();
    }

    const query = searchQuery.trim();

    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .or(`store_name.ilike.%${query}%,card_number.ilike.%${query}%,notes.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Search gift cards error:', error);
    return { data: null, error: error.message };
  }
};

// ====================================
// EXPORTS
// ====================================

export default {
  // Gift cards
  getGiftCards,
  getGiftCard,
  addGiftCard,
  updateGiftCard,
  deleteGiftCard,
  markCardAsUsed,
  getGiftCardCount,
  checkCanAddCard,
  getExpiringCards,
  searchGiftCards,
  
  // User profile
  getUserProfile,
  updateUserProfile,
  
  // Push notifications
  storePushToken,
  removePushToken,
  getUserPushTokens,
  updateNotificationPreferences,
  
  // Subscriptions
  checkPremiumStatus,
  updateSubscription,
  
  // Statistics
  getUserStatistics,
};