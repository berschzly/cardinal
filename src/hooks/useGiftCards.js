import { useState, useEffect, useCallback } from 'react';
import {
  getGiftCards,
  getGiftCard,
  addGiftCard,
  updateGiftCard,
  deleteGiftCard,
  markCardAsUsed,
  getGiftCardCount,
  checkCanAddCard,
  getExpiringCards,
} from '../services/database';

/**
 * Custom hook for gift card operations
 * Provides state management and CRUD functions for gift cards
 */
export const useGiftCards = (autoFetch = true) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardCount, setCardCount] = useState(0);
  const [canAddMore, setCanAddMore] = useState(true);

  /**
   * Fetch all gift cards
   */
  const fetchCards = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await getGiftCards(filters);

    if (fetchError) {
      setError(fetchError);
      setCards([]);
    } else {
      setCards(data || []);
    }

    setLoading(false);
    return { data, error: fetchError };
  }, []);

  /**
   * Fetch card count and check if user can add more
   */

  const fetchCardCount = useCallback(async () => {
    const { count } = await getGiftCardCount();
    setCardCount(count || 0);

    // Check if user can add more cards (considers premium status)
    const canAdd = await checkCanAddCard();
    setCanAddMore(canAdd);
  }, []);

  /**
   * Add a new gift card
   */
  const addCard = async (cardData) => {
    setLoading(true);
    setError(null);

    const { data, error: addError } = await addGiftCard(cardData);

    if (addError) {
      setError(addError);
      setLoading(false);
      return { data: null, error: addError };
    }

    // Refresh cards list
    await fetchCards();
    await fetchCardCount();

    setLoading(false);
    return { data, error: null };
  };

  /**
   * Update an existing gift card
   */
  const updateCard = async (cardId, updates) => {
    setLoading(true);
    setError(null);

    const { data, error: updateError } = await updateGiftCard(cardId, updates);

    if (updateError) {
      setError(updateError);
      setLoading(false);
      return { data: null, error: updateError };
    }

    // Update local state
    setCards((prevCards) =>
      prevCards.map((card) => (card.id === cardId ? data : card))
    );

    setLoading(false);
    return { data, error: null };
  };

  /**
   * Delete a gift card
   */
  const deleteCard = async (cardId) => {
    setLoading(true);
    setError(null);

    const { error: deleteError } = await deleteGiftCard(cardId);

    if (deleteError) {
      setError(deleteError);
      setLoading(false);
      return { error: deleteError };
    }

    // Remove from local state
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
    await fetchCardCount();

    setLoading(false);
    return { error: null };
  };

  /**
   * Mark a card as used
   */
  const markAsUsed = async (cardId) => {
    setLoading(true);
    setError(null);

    const { data, error: markError } = await markCardAsUsed(cardId);

    if (markError) {
      setError(markError);
      setLoading(false);
      return { data: null, error: markError };
    }

    // Update local state
    setCards((prevCards) =>
      prevCards.map((card) => (card.id === cardId ? data : card))
    );
    await fetchCardCount();

    setLoading(false);
    return { data, error: null };
  };

  /**
   * Fetch a single card by ID
   */
  const fetchCard = async (cardId) => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await getGiftCard(cardId);

    setLoading(false);
    return { data, error: fetchError };
  };

  /**
   * Get expiring cards
   */
  const fetchExpiringCards = async () => {
    const { data, error: fetchError } = await getExpiringCards();
    return { data, error: fetchError };
  };

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await fetchCards();
    await fetchCardCount();
  }, [fetchCards, fetchCardCount]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchCards();
      fetchCardCount();
    }
  }, [autoFetch, fetchCards, fetchCardCount]);

  return {
    // State
    cards,
    loading,
    error,
    cardCount,
    canAddMore,

    // Functions
    fetchCards,
    addCard,
    updateCard,
    deleteCard,
    markAsUsed,
    fetchCard,
    fetchExpiringCards,
    refresh,
  };
};

export default useGiftCards;