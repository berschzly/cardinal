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
      .select(`
        *,
        store_location:store_locations(*)
      `)
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
      .select(`
        *,
        store_location:store_locations(*)
      `)
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
      .select(`
        *,
        store_location:store_locations(*)
      `)
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
      .select(`
        *,
        store_location:store_locations(*)
      `)
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check premium status
    const { isPremium } = await checkPremiumStatus();

    // Premium users have no limit
    if (isPremium) {
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
// SUBSCRIPTION OPERATIONS
// ====================================

/**
 * Check if user has an active premium subscription
 * @returns {Promise<{isPremium: boolean, subscriptionStatus: object, error}>}
 */
export const checkPremiumStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get user's profile from 'users' table (not 'profiles')
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('is_premium, subscription_status, subscription_started_at, subscription_expires_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Check premium status error:', profileError);
      // Return free tier if we can't check
      return { isPremium: false, subscriptionStatus: null, error: profileError.message };
    }

    // Check if subscription is still valid
    const now = new Date();
    const expiresAt = userProfile?.subscription_expires_at ? new Date(userProfile.subscription_expires_at) : null;
    
    const isPremium = 
      userProfile?.is_premium === true ||
      (userProfile?.subscription_status === 'active' && (!expiresAt || expiresAt > now));

    return { 
      isPremium, 
      subscriptionStatus: userProfile,
      error: null 
    };
  } catch (error) {
    console.error('Check premium status error:', error);
    return { isPremium: false, subscriptionStatus: null, error: error.message };
  }
};

/**
 * Create a new subscription after successful purchase
 * @param {Object} subscriptionData - Purchase details
 * @returns {Promise<{data, error}>}
 */
export const createSubscription = async (subscriptionData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Update user profile to premium status
    const { error: profileError } = await supabase
      .from('users')
      .update({
        is_premium: true,
        subscription_status: 'active',
        subscription_started_at: new Date().toISOString(),
        subscription_expires_at: subscriptionData.expiresAt,
      })
      .eq('id', user.id);

    if (profileError) throw profileError;

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Create subscription error:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Cancel subscription
 * @returns {Promise<{data, error}>}
 */
export const cancelSubscription = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Update profile - set to free
    const { data, error } = await supabase
      .from('users')
      .update({
        is_premium: false,
        subscription_status: 'free',
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Cancel subscription error:', error);
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
      .select(`
        *,
        store_location:store_locations(*)
      `)
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
// STORE LOCATIONS OPERATIONS
// ====================================

/**
 * Search for store locations by name
 * @param {string} storeName - Store name to search
 * @returns {Promise<{data, error}>}
 */
export const searchStoreLocations = async (storeName) => {
  try {
    if (!storeName || storeName.trim().length < 2) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('store_locations')
      .select('*')
      .ilike('store_name', `%${storeName.trim()}%`)
      .order('store_name', { ascending: true })
      .limit(10);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Search store locations error:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Get a store location by ID
 * @param {string} locationId - Store location ID
 * @returns {Promise<{data, error}>}
 */
export const getStoreLocation = async (locationId) => {
  try {
    const { data, error } = await supabase
      .from('store_locations')
      .select('*')
      .eq('id', locationId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Get store location error:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Find nearby store locations
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} radiusKm - Search radius in kilometers (default: 5)
 * @param {string} storeFilter - Optional store name filter
 * @returns {Promise<{data, error}>}
 */
export const findNearbyLocations = async (
  latitude,
  longitude,
  radiusKm = 5.0,
  storeFilter = null
) => {
  try {
    const { data, error } = await supabase.rpc('find_nearby_locations', {
      user_lat: latitude,
      user_lng: longitude,
      radius_km: radiusKm,
      store_filter: storeFilter,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Find nearby locations error:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Add a new store location
 * @param {Object} locationData - Store location data
 * @returns {Promise<{data, error}>}
 */
export const addStoreLocation = async (locationData) => {
  try {
    const { data, error } = await supabase
      .from('store_locations')
      .insert([locationData])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Add store location error:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Get all locations for a specific store
 * @param {string} storeName - Store name
 * @returns {Promise<{data, error}>}
 */
export const getStoreLocationsByName = async (storeName) => {
  try {
    const { data, error } = await supabase
      .from('store_locations')
      .select('*')
      .ilike('store_name', storeName)
      .order('city', { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Get store locations by name error:', error);
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
  
  // Subscriptions
  checkPremiumStatus,
  createSubscription,
  cancelSubscription,
  
  // Statistics
  getUserStatistics,
  
  // Store locations
  searchStoreLocations,
  getStoreLocation,
  findNearbyLocations,
  addStoreLocation,
  getStoreLocationsByName,
};