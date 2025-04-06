import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { TemplateData } from '../types';

/**
 * Fetch all templates from Firestore
 */
export const getAllTemplates = async (): Promise<TemplateData[]> => {
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
};

/**
 * Delete a template by ID
 */
export const deleteTemplate = async (templateId: string): Promise<void> => {
  await deleteDoc(doc(db, 'templates', templateId));
};