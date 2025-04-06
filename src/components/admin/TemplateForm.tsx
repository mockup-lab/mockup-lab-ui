import React, { useState } from 'react';
import { TemplateData } from '../../types';
import { doc, setDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '../../contexts/AuthContext';

interface TemplateFormProps {
  template: TemplateData | null;
  onClose: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, onClose }) => {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<TemplateData>>(template || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox && 'checked' in e.target ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Check if user is authenticated and is an admin
    if (!user) {
      setError('You must be logged in to perform this action');
      setIsSubmitting(false);
      return;
    }

    if (!userProfile?.isAdmin) {
      setError('You do not have permission to perform this action');
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare data with required fields
      const dataToSave = {
        ...formData,
        price: Number(formData.price) || 0,
        isPremium: !!formData.isPremium,
        updatedAt: Timestamp.now(),
        // Add any missing required fields
        index: formData.index || 0,
        category: formData.category || '',
        title: formData.title || '',
        description: formData.description || '',
        image: formData.image || formData.thumbnailUrl || '',
        tags: formData.tags || [],
      };

      if (template && template.id) {
        // Update existing
        const docRef = doc(db, 'templates', template.id);
        await setDoc(docRef, dataToSave, { merge: true });
      } else {
        // Create new
        const colRef = collection(db, 'templates');
        await addDoc(colRef, {
          ...dataToSave,
          createdAt: Timestamp.now(),
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      setError(error instanceof Error ? error.message : 'Failed to save template');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={onClose}
          className="mr-4 text-zinc-400 hover:text-white hover:bg-zinc-900"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
        <h2 className="text-2xl font-bold text-white">
          {template ? 'Edit Template' : 'Create New Template'}
        </h2>
      </div>

      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-zinc-400 mb-1">
                    Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Template title"
                    value={formData.title || ''}
                    onChange={handleChange}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-zinc-400 mb-1">
                    Category *
                  </label>
                  <Input
                    id="category"
                    name="category"
                    placeholder="Template category"
                    value={formData.category || ''}
                    onChange={handleChange}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-zinc-400 mb-1">
                    Short Description *
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of the template"
                    value={formData.description || ''}
                    onChange={handleChange}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="longDescription" className="block text-sm font-medium text-zinc-400 mb-1">
                    Long Description
                  </label>
                  <Textarea
                    id="longDescription"
                    name="longDescription"
                    placeholder="Detailed description of the template"
                    value={formData.longDescription || ''}
                    onChange={handleChange}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-indigo-500 min-h-[150px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-zinc-400 mb-1">
                    Thumbnail URL
                  </label>
                  <Input
                    id="thumbnailUrl"
                    name="thumbnailUrl"
                    placeholder="URL for the template thumbnail"
                    value={formData.thumbnailUrl || ''}
                    onChange={handleChange}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="fullImageUrl" className="block text-sm font-medium text-zinc-400 mb-1">
                    Full Image URL
                  </label>
                  <Input
                    id="fullImageUrl"
                    name="fullImageUrl"
                    placeholder="URL for the full-size template image"
                    value={formData.fullImageUrl || ''}
                    onChange={handleChange}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="demoUrl" className="block text-sm font-medium text-zinc-400 mb-1">
                    Demo URL
                  </label>
                  <Input
                    id="demoUrl"
                    name="demoUrl"
                    placeholder="URL to the template demo"
                    value={formData.demoUrl || ''}
                    onChange={handleChange}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="downloadUrl" className="block text-sm font-medium text-zinc-400 mb-1">
                    Download URL
                  </label>
                  <Input
                    id="downloadUrl"
                    name="downloadUrl"
                    placeholder="URL to download the template"
                    value={formData.downloadUrl || ''}
                    onChange={handleChange}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-zinc-400 mb-1">
                      Price
                    </label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      placeholder="0"
                      value={formData.price || 0}
                      onChange={handleChange}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <div className="flex items-center space-x-2 h-10">
                      <Checkbox
                        id="isPremium"
                        checked={!!formData.isPremium}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            isPremium: checked === true
                          }))
                        }
                        className="border-zinc-700 data-[state=checked]:bg-indigo-600"
                      />
                      <label htmlFor="isPremium" className="text-sm text-white">
                        Premium Template
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-md mb-4">
                <p>{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </form>
        </div>
      </ScrollArea>
    </div>
  );
};

export default TemplateForm;
