import React, { useState } from 'react';
import { TemplateData } from '../../types';
import { doc, setDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface TemplateFormProps {
  template: TemplateData | null;
  onClose: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, onClose }) => {
  const [formData, setFormData] = useState<Partial<TemplateData>>(template || {});

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

    try {
      const dataToSave = {
        ...formData,
        price: Number(formData.price) || 0,
        isPremium: !!formData.isPremium,
        updatedAt: Timestamp.now(),
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
      alert('Failed to save template');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'Create Template'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            name="title"
            placeholder="Title"
            value={formData.title || ''}
            onChange={handleChange}
            required
          />
          <Input
            name="category"
            placeholder="Category"
            value={formData.category || ''}
            onChange={handleChange}
            required
          />
          <Textarea
            name="description"
            placeholder="Short Description"
            value={formData.description || ''}
            onChange={handleChange}
            required
          />
          <Textarea
            name="longDescription"
            placeholder="Long Description"
            value={formData.longDescription || ''}
            onChange={handleChange}
          />
          <Input
            name="price"
            type="number"
            placeholder="Price (0 for free)"
            value={formData.price || 0}
            onChange={handleChange}
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPremium"
              checked={!!formData.isPremium}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isPremium: checked === true
                }))
              }
            />
            <label htmlFor="isPremium" className="text-sm">
              Premium Template
            </label>
          </div>
          <Input
            name="thumbnailUrl"
            placeholder="Thumbnail URL"
            value={formData.thumbnailUrl || ''}
            onChange={handleChange}
          />
          <Input
            name="fullImageUrl"
            placeholder="Full Image URL"
            value={formData.fullImageUrl || ''}
            onChange={handleChange}
          />
          <Input
            name="demoUrl"
            placeholder="Demo URL"
            value={formData.demoUrl || ''}
            onChange={handleChange}
          />
          <Input
            name="downloadUrl"
            placeholder="Download URL"
            value={formData.downloadUrl || ''}
            onChange={handleChange}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="submit">
              Save
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateForm;