import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile } from '../types';

/**
 * Add a template to user's favorites
 * @param userId User ID
 * @param templateId Template ID to add to favorites
 */
export const addToFavorites = async (userId: string, templateId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      favorites: arrayUnion(templateId)
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw new Error('Failed to add template to favorites');
  }
};

/**
 * Remove a template from user's favorites
 * @param userId User ID
 * @param templateId Template ID to remove from favorites
 */
export const removeFromFavorites = async (userId: string, templateId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      favorites: arrayRemove(templateId)
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw new Error('Failed to remove template from favorites');
  }
};

/**
 * Check if a template is in user's favorites
 * @param userId User ID
 * @param templateId Template ID to check
 * @returns Boolean indicating if template is favorited
 */
export const isTemplateFavorited = async (userId: string, templateId: string): Promise<boolean> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      return userData.favorites.includes(templateId);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

/**
 * Toggle favorite status for a template
 * @param userId User ID
 * @param templateId Template ID to toggle
 * @returns New favorite status (true if favorited, false if unfavorited)
 */
export const toggleFavorite = async (userId: string, templateId: string): Promise<boolean> => {
  try {
    const isFavorited = await isTemplateFavorited(userId, templateId);
    
    if (isFavorited) {
      await removeFromFavorites(userId, templateId);
      return false;
    } else {
      await addToFavorites(userId, templateId);
      return true;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw new Error('Failed to update favorite status');
  }
};