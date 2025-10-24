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

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single();

    // Premium users have no limit
    if (profile?.subscription_status === 'premium') {
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
      .from('profiles')
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
      .from('profiles')
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
  
  // User profile
  getUserProfile,
  updateUserProfile,
};