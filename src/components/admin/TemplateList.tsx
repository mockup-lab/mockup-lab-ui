import React, { useEffect, useState } from 'react';
import { TemplateData } from '../../types';
import { getAllTemplates } from '../../services/templateService';
import { deleteTemplate } from '../../services/adminService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PencilIcon, Trash2Icon, EyeIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TemplateListProps {
  onEdit: (template: TemplateData) => void;
  onView: (template: TemplateData) => void;
  onCreateNew: () => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ onEdit, onView, onCreateNew }) => {
  const { user, userProfile } = useAuth();
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    // Check if user is authenticated and is an admin
    if (!user) {
      alert('You must be logged in to perform this action');
      return;
    }

    if (!userProfile?.isAdmin) {
      alert('You do not have permission to perform this action');
      return;
    }

    try {
      await deleteTemplate(templateId);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete template');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Templates</h2>
        <Button onClick={onCreateNew} className="bg-indigo-600 hover:bg-indigo-700">
          Create New Template
        </Button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-md mb-6">
          <p>{error}</p>
          <Button
            onClick={fetchTemplates}
            variant="outline"
            className="mt-2 border-red-700 hover:bg-red-800 text-red-200"
          >
            Try Again
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-zinc-400">Loading templates...</p>
        </div>
      ) : templates.length === 0 && !error ? (
        <div className="flex flex-col justify-center items-center h-64 bg-zinc-900 rounded-lg border border-zinc-800 p-6">
          <p className="text-zinc-400 mb-4">No templates found</p>
          <Button onClick={onCreateNew} className="bg-indigo-600 hover:bg-indigo-700">
            Create Your First Template
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="grid grid-cols-1 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-32 md:h-auto">
                    <img
                      src={template.thumbnailUrl || template.image}
                      alt={template.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg text-white">{template.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-800">
                            {template.category}
                          </Badge>
                          {template.isPremium && (
                            <Badge className="bg-amber-600 hover:bg-amber-600">
                              Premium
                            </Badge>
                          )}
                          {(template.price ?? 0) > 0 && (
                            <Badge className="bg-indigo-900 text-indigo-200 hover:bg-indigo-900">
                              ${template.price}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-zinc-700 hover:bg-zinc-800 hover:text-white"
                          onClick={() => onView(template)}
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-zinc-700 hover:bg-zinc-800 hover:text-white"
                          onClick={() => onEdit(template)}
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(template.id!)}
                        >
                          <Trash2Icon className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="text-zinc-400 mt-2 line-clamp-2">{template.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default TemplateList;