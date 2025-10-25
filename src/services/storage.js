import { supabase } from './supabase';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

/**
 * Upload an image to Supabase storage
 */
export const uploadImage = async (uri, userId) => {
  try {
    if (!uri || !userId) {
      throw new Error('Missing required parameters');
    }

    // Compress image
    const compressed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Generate filename
    const ext = 'jpg';
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Read as base64
    const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Decode to array buffer
    const arrayBuffer = decode(base64);

    // Upload
    const { data, error } = await supabase.storage
      .from('gift-card-images')
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('gift-card-images')
      .getPublicUrl(fileName);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Upload error:', error);
    return { url: null, error: error.message };
  }
};

/**
 * Delete an image from Supabase storage
 */
export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return { error: null };

    const path = imageUrl.split('gift-card-images/')[1];
    if (!path) return { error: null };

    const { error } = await supabase.storage
      .from('gift-card-images')
      .remove([path]);

    return { error: error?.message || null };
  } catch (error) {
    console.error('Delete error:', error);
    return { error: error.message };
  }
};

/**
 * Compress and resize image for optimal storage
 */
export const compressImage = async (uri) => {
  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipulatedImage;
  } catch (error) {
    console.error('Compress image error:', error);
    throw error;
  }
};

/**
 * Update card image URL in database
 */
export const updateCardImage = async (cardId, imageUrl) => {
  try {
    const { error } = await supabase
      .from('gift_cards')
      .update({ image_url: imageUrl })
      .eq('id', cardId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Update card image error:', error);
    return { error: error.message };
  }
};

export default {
  uploadImage,
  deleteImage,
  compressImage,
  updateCardImage,
};