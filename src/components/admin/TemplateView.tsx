import React from 'react';
import { TemplateData } from '../../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, PencilIcon } from 'lucide-react';

interface TemplateViewProps {
  template: TemplateData;
  onBack: () => void;
  onEdit: (template: TemplateData) => void;
}

const TemplateView: React.FC<TemplateViewProps> = ({ template, onBack, onEdit }) => {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mr-4 text-zinc-400 hover:text-white hover:bg-zinc-900"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
        <h2 className="text-2xl font-bold text-white flex-1">Template Details</h2>
        <Button 
          onClick={() => onEdit(template)} 
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit Template
        </Button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="aspect-video w-full max-h-[400px] overflow-hidden">
          <img
            src={template.fullImageUrl || template.thumbnailUrl || template.image}
            alt={template.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
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
          
          <h1 className="text-3xl font-bold text-white mb-4">{template.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Description</h3>
              <p className="text-zinc-400 mb-4">{template.description}</p>
              
              {template.longDescription && (
                <>
                  <h3 className="text-lg font-medium text-white mb-2">Detailed Description</h3>
                  <p className="text-zinc-400 whitespace-pre-line">{template.longDescription}</p>
                </>
              )}
            </div>
            
            <div className="bg-zinc-800 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Template Information</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-zinc-400 text-sm">ID</p>
                  <p className="text-white font-mono">{template.id}</p>
                </div>
                
                {template.demoUrl && (
                  <div>
                    <p className="text-zinc-400 text-sm">Demo URL</p>
                    <a 
                      href={template.demoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 break-all"
                    >
                      {template.demoUrl}
                    </a>
                  </div>
                )}
                
                {template.downloadUrl && (
                  <div>
                    <p className="text-zinc-400 text-sm">Download URL</p>
                    <a 
                      href={template.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 break-all"
                    >
                      {template.downloadUrl}
                    </a>
                  </div>
                )}
                
                {template.createdAt && (
                  <div>
                    <p className="text-zinc-400 text-sm">Created</p>
                    <p className="text-white">{template.createdAt.toLocaleString()}</p>
                  </div>
                )}
                
                {template.updatedAt && (
                  <div>
                    <p className="text-zinc-400 text-sm">Last Updated</p>
                    <p className="text-white">{template.updatedAt.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateView;