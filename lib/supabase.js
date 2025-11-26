// Supabase client setup

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============ AUTH FUNCTIONS ============

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

// ============ CARD FUNCTIONS ============

export async function createCard(cardData) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('cards')
    .insert([{ ...cardData, user_id: user.id }])
    .select()
    .single(); // ← Added .single() to return object instead of array
  return { data, error };
}

export async function getCards() {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getCard(id) {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function updateCard(id, updates) {
  const { data, error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', id)
    .select()
    .single(); // ← Added .single() for consistency
  return { data, error };
}

export async function deleteCard(id) {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id);
  return { error };
}

// ============ USER SETTINGS FUNCTIONS ============

export async function getUserSettings() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();
  return { data, error };
}

export async function updateUserSettings(settings) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ user_id: user.id, ...settings })
    .select()
    .single(); // ← Added .single() for consistency
  return { data, error };
}