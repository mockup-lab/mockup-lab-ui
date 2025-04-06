import { collection, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { TemplateData } from '../types';

/**
 * Check if the current user is an admin
 */
const checkAdminPermission = async (): Promise<boolean> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('You must be logged in to perform this action');
  }

  const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

  if (!userDoc.exists() || !userDoc.data().isAdmin) {
    throw new Error('You do not have permission to perform this action');
  }

  return true;
};

/**
 * Fetch all templates from Firestore
 */
export const getAllTemplates = async (): Promise<TemplateData[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'templates'));
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as TemplateData;
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw new Error('Failed to fetch templates');
  }
};

/**
 * Delete a template by ID
 */
export const deleteTemplate = async (templateId: string): Promise<void> => {
  try {
    // Verify admin permissions before proceeding
    await checkAdminPermission();

    // Delete the template
    await deleteDoc(doc(db, 'templates', templateId));
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};