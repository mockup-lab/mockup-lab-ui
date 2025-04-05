import React from 'react';
import { TemplateData } from '../types';

interface DebugPanelProps {
  templates: TemplateData[];
  activeIndex: number;
  isAnimatingFilter: boolean;
}

// Define a variable to check if we're in development mode
// Using import.meta.env for Vite projects instead of process.env
const isDevelopment = import.meta.env.MODE === 'development';

const DebugPanel: React.FC<DebugPanelProps> = ({ templates, activeIndex, isAnimatingFilter }) => {
  // Only show in development mode
  if (!isDevelopment) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px',
      maxHeight: '200px',
      overflow: 'auto'
    }}>
      <h3>Debug Info</h3>
      <p>Templates: {templates.length}</p>
      <p>Active Index: {activeIndex}</p>
      <p>Animating: {isAnimatingFilter ? 'Yes' : 'No'}</p>
      <p>Active Template: {templates[activeIndex]?.title || 'None'}</p>
      <details>
        <summary>Template Data</summary>
        <pre>{JSON.stringify(templates, null, 2)}</pre>
      </details>
    </div>
  );
};

export default DebugPanel;