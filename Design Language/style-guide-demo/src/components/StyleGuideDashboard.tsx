import React from 'react';
import ComponentShowcase from './ComponentShowcase';
import DesignTokens from './DesignTokens';

const StyleGuideDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-backgroundMain p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-h1 text-textPrimary mb-4">
            Design System Style Guide
          </h1>
          <p className="text-body text-textSecondary max-w-2xl">
            A comprehensive showcase of all UI components following the LimeAura productivity dashboard design language. 
            This guide demonstrates the bright, soft, modern aesthetic with high contrast between vivid pastel backgrounds and clean white cards.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-surfaceSoft rounded-pill p-1 inline-flex">
          <button className="px-6 py-2 rounded-pill text-body-bold bg-accentPrimary text-white transition-all duration-200">
            Components
          </button>
          <button className="px-6 py-2 rounded-pill text-body-bold text-textPrimary hover:bg-white transition-all duration-200">
            Design Tokens
          </button>
          <button className="px-6 py-2 rounded-pill text-body-bold text-textPrimary hover:bg-white transition-all duration-200">
            Guidelines
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <ComponentShowcase />
        </div>
      </div>
    </div>
  );
};

export default StyleGuideDashboard;
