import React from 'react';
import CardsSection from './sections/CardsSection';
import ButtonsSection from './sections/ButtonsSection';
import FormsSection from './sections/FormsSection';
import NavigationSection from './sections/NavigationSection';
import DataDisplaySection from './sections/DataDisplaySection';
import FeedbackSection from './sections/FeedbackSection';

const ComponentShowcase: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="card text-center">
          <div className="text-3xl font-bold text-accentPrimary mb-2">28</div>
          <div className="text-body text-textSecondary">Total Components</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-success mb-2">100%</div>
          <div className="text-body text-textSecondary">Design Coverage</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-accentSecondary mb-2">15</div>
          <div className="text-body text-textSecondary">Color Tokens</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-warning mb-2">8</div>
          <div className="text-body text-textSecondary">Spacing Levels</div>
        </div>
      </div>

      {/* Component Sections */}
      <CardsSection />
      <ButtonsSection />
      <FormsSection />
      <NavigationSection />
      <DataDisplaySection />
      <FeedbackSection />
    </div>
  );
};

export default ComponentShowcase;
