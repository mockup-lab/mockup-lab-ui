import React, { useEffect, useState } from 'react';
import { TemplateData } from '../../types';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet';
import { BookOpenIcon, MenuIcon } from 'lucide-react';
import TemplateForm from './TemplateForm';
import TemplateList from './TemplateList';
import TemplateView from './TemplateView';

// Add admin dashboard specific styles
import './admin-dashboard.css';

// Define content types for the main section
type ContentType = 'list' | 'form' | 'view';

const AdminDashboard: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [contentType, setContentType] = useState<ContentType>('list');
  const [activeSection, setActiveSection] = useState('templates');

  // Reset to template list when section changes
  useEffect(() => {
    if (activeSection === 'templates') {
      setContentType('list');
    }
  }, [activeSection]);

  const handleEdit = (template: TemplateData) => {
    setSelectedTemplate(template);
    setContentType('form');
  };

  const handleView = (template: TemplateData) => {
    setSelectedTemplate(template);
    setContentType('view');
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setContentType('form');
  };

  const handleBackToList = () => {
    setContentType('list');
    setSelectedTemplate(null);
  };

  return (
    <div className="admin-dashboard flex h-screen w-screen max-w-full bg-black text-white overflow-hidden">
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-zinc-900 border-r border-zinc-800">
          <SidebarContent activeSection={activeSection} setActiveSection={setActiveSection} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:shrink-0 bg-zinc-900 border-r border-zinc-800">
        <SidebarContent activeSection={activeSection} setActiveSection={setActiveSection} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
          <h1 className="text-xl font-medium">Template Management</h1>
        </header>

        <main className="flex-1 p-0 bg-black relative overflow-auto">
          {contentType === 'list' && (
            <TemplateList
              onEdit={handleEdit}
              onView={handleView}
              onCreateNew={handleCreate}
            />
          )}

          {contentType === 'form' && (
            <TemplateForm
              template={selectedTemplate}
              onClose={handleBackToList}
            />
          )}

          {contentType === 'view' && selectedTemplate && (
            <TemplateView
              template={selectedTemplate}
              onBack={handleBackToList}
              onEdit={handleEdit}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// Sidebar content component
const SidebarContent: React.FC<{
  activeSection: string;
  setActiveSection: (section: string) => void;
}> = ({ activeSection, setActiveSection }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-xl font-bold text-white">MockupLab</h2>
        <p className="text-zinc-400 text-sm mt-1">Admin Dashboard</p>
      </div>
      {/* Navigation links - positioned at the top */}
      <div className="w-full mt-2">
        <Button
          variant={activeSection === 'templates' ? 'secondary' : 'ghost'}
          className={`w-full justify-start rounded-none px-6 py-3 h-auto ${
            activeSection === 'templates'
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          onClick={() => setActiveSection('templates')}
        >
          <BookOpenIcon className="h-5 w-5 mr-3" />
          Templates
        </Button>
      </div>
      <div className="mt-auto p-4 border-t border-zinc-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-medium">A</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-zinc-400">admin@mockuplab.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;