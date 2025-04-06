import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { TemplateData, UserProfile } from '../types';

/**
 * Get all templates
 * @returns Array of template data
 */
export const getAllTemplates = async (): Promise<TemplateData[]> => {
  try {
    const templatesCollection = collection(db, 'templates');
    const templatesSnapshot = await getDocs(templatesCollection);
    
    return templatesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        index: data.index || 0,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as TemplateData;
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw new Error('Failed to fetch templates');
  }
};

/**
 * Get templates by category
 * @param category Category to filter by
 * @returns Array of template data
 */
export const getTemplatesByCategory = async (category: string): Promise<TemplateData[]> => {
  try {
    const templatesCollection = collection(db, 'templates');
    const categoryQuery = query(
      templatesCollection, 
      where('category', '==', category),
      orderBy('index')
    );
    
    const templatesSnapshot = await getDocs(categoryQuery);
    
    return templatesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as TemplateData;
    });
  } catch (error) {
    console.error('Error fetching templates by category:', error);
    throw new Error('Failed to fetch templates by category');
  }
};

/**
 * Get a single template by ID
 * @param templateId Template ID
 * @returns Template data or null if not found
 */
export const getTemplateById = async (templateId: string): Promise<TemplateData | null> => {
  try {
    const templateDocRef = doc(db, 'templates', templateId);
    const templateDoc = await getDoc(templateDocRef);
    
    if (templateDoc.exists()) {
      const data = templateDoc.data();
      return {
        ...data,
        id: templateDoc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as TemplateData;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching template:', error);
    throw new Error('Failed to fetch template');
  }
};

/**
 * Get user's favorite templates
 * @param userId User ID
 * @returns Array of template data
 */
export const getFavoriteTemplates = async (userId: string): Promise<TemplateData[]> => {
  try {
    // First get the user's favorites list
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return [];
    }
    
    const userData = userDoc.data() as UserProfile;
    const favoriteIds = userData.favorites || [];
    
    if (favoriteIds.length === 0) {
      return [];
    }
    
    // Then fetch each template
    const templates: TemplateData[] = [];
    
    for (const templateId of favoriteIds) {
      const template = await getTemplateById(templateId);
      if (template) {
        templates.push(template);
      }
    }
    
    return templates;
  } catch (error) {
    console.error('Error fetching favorite templates:', error);
    throw new Error('Failed to fetch favorite templates');
  }
};

/**
 * Get user's purchased templates
 * @param userId User ID
 * @returns Array of template data
 */
export const getPurchasedTemplates = async (userId: string): Promise<TemplateData[]> => {
  try {
    // First get the user's purchases list
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return [];
    }
    
    const userData = userDoc.data() as UserProfile;
    const purchaseIds = userData.purchases || [];
    
    if (purchaseIds.length === 0) {
      return [];
    }
    
    // Then fetch each template
    const templates: TemplateData[] = [];
    
    for (const templateId of purchaseIds) {
      const template = await getTemplateById(templateId);
      if (template) {
        templates.push(template);
      }
    }
    
    return templates;
  } catch (error) {
    console.error('Error fetching purchased templates:', error);
    throw new Error('Failed to fetch purchased templates');
  }
};

/**
 * Record a template purchase for a user
 * @param userId User ID
 * @param templateId Template ID
 */
export const recordTemplatePurchase = async (userId: string, templateId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    
    // Add to user's purchases
    await updateDoc(userDocRef, {
      purchases: arrayUnion(templateId),
      updatedAt: Timestamp.now()
    });
    
    // Could also record the purchase in a separate collection for reporting/analytics
    // This is just a simple implementation
  } catch (error) {
    console.error('Error recording template purchase:', error);
    throw new Error('Failed to record template purchase');
  }
};

/**
 * Check if user has purchased a template
 * @param userId User ID
 * @param templateId Template ID
 * @returns Boolean indicating if template is purchased
 */
export const hasUserPurchasedTemplate = async (userId: string, templateId: string): Promise<boolean> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      return userData.purchases.includes(templateId);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking purchase status:', error);
    return false;
  }
};