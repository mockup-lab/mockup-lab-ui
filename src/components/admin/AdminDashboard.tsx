import React, { useEffect, useState } from 'react';
import { TemplateData } from '../../types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from '@/components/ui/navigation-menu';
import { getAllTemplates } from '../../services/templateService';
import { deleteTemplate } from '../../services/adminService';
import TemplateForm from './TemplateForm';

const AdminDashboard: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchTemplates = async () => {
    try {
      const data = await getAllTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleEdit = (template: TemplateData) => {
    setSelectedTemplate(template);
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setShowForm(true);
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await deleteTemplate(templateId);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    fetchTemplates();
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar using Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="m-4">
            Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4">
          <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>
          <NavigationMenu>
            <NavigationMenuList className="flex flex-col space-y-2">
              <NavigationMenuItem>
                <a href="#" className="block px-2 py-1 rounded hover:bg-gray-100">Dashboard</a>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <a href="#" className="block px-2 py-1 rounded hover:bg-gray-100">Templates</a>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <a href="#" className="block px-2 py-1 rounded hover:bg-gray-100">Users</a>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleCreate}>
            Create New Template
          </Button>
        </header>

        <main className="p-4 overflow-auto">
          {showForm && (
            <TemplateForm
              template={selectedTemplate}
              onClose={handleFormClose}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded shadow p-4 flex flex-col">
                <img
                  src={template.thumbnailUrl || template.image}
                  alt={template.title}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h3 className="font-semibold text-lg">{template.title}</h3>
                <p className="text-gray-500">{template.category}</p>
                <div className="mt-2 flex space-x-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => handleEdit(template)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDelete(template.id!)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;