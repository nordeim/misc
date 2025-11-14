import React from 'react';
import { Plus, Download, Settings, Heart, Share2, Edit, Trash2, Copy, RefreshCw } from 'lucide-react';

const ButtonsSection: React.FC = () => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h2 text-textPrimary">Buttons & Actions</h2>
        <span className="badge">12 variants</span>
      </div>

      <div className="space-y-8">
        {/* Primary Buttons */}
        <div>
          <h3 className="text-h3 text-textSecondary mb-4">Primary Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">Create Project</button>
            <button className="btn-primary">
              <Plus size={16} className="inline mr-2" />
              Add New
            </button>
            <button className="btn-primary">
              <Download size={16} className="inline mr-2" />
              Download
            </button>
            <button className="btn-primary" disabled>
              Disabled Primary
            </button>
          </div>
        </div>

        {/* Secondary Buttons */}
        <div>
          <h3 className="text-h3 text-textSecondary mb-4">Secondary Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <button className="btn-secondary">Cancel</button>
            <button className="btn-secondary">
              <Settings size={16} className="inline mr-2" />
              Settings
            </button>
            <button className="btn-secondary">
              <Copy size={16} className="inline mr-2" />
              Duplicate
            </button>
            <button className="btn-secondary" disabled>
              Disabled Secondary
            </button>
          </div>
        </div>

        {/* Ghost Buttons */}
        <div>
          <h3 className="text-h3 text-textSecondary mb-4">Ghost Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <button className="btn-ghost">Learn More</button>
            <button className="btn-ghost">
              <Heart size={16} className="inline mr-2" />
              Favorite
            </button>
            <button className="btn-ghost">
              <Share2 size={16} className="inline mr-2" />
              Share
            </button>
            <button className="btn-ghost" disabled>
              Disabled Ghost
            </button>
          </div>
        </div>

        {/* Icon Buttons */}
        <div>
          <h3 className="text-h3 text-textSecondary mb-4">Icon Buttons</h3>
          <div className="flex flex-wrap gap-4 items-center">
            <button className="w-10 h-10 rounded-full bg-white shadow-card hover:shadow-floating transition-all duration-200 flex items-center justify-center">
              <Edit size={16} className="text-textSecondary" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white shadow-card hover:shadow-floating transition-all duration-200 flex items-center justify-center">
              <Trash2 size={16} className="text-danger" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white shadow-card hover:shadow-floating transition-all duration-200 flex items-center justify-center">
              <Copy size={16} className="text-accentPrimary" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white shadow-card hover:shadow-floating transition-all duration-200 flex items-center justify-center">
              <RefreshCw size={16} className="text-accentSecondary" />
            </button>
            <button className="w-10 h-10 rounded-full bg-accentPrimary hover:bg-[#6B2FFF] transition-all duration-200 flex items-center justify-center">
              <Plus size={16} className="text-white" />
            </button>
            <button className="w-10 h-10 rounded-full bg-danger hover:bg-red-600 transition-all duration-200 flex items-center justify-center">
              <Trash2 size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Button Sizes */}
        <div>
          <h3 className="text-h3 text-textSecondary mb-4">Button Sizes</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <span className="text-label text-textSecondary">Small</span>
              <button className="px-3 py-1.5 text-label bg-accentPrimary text-white rounded-pill">
                Small Button
              </button>
            </div>
            <div className="space-y-2">
              <span className="text-label text-textSecondary">Medium</span>
              <button className="btn-primary">Medium Button</button>
            </div>
            <div className="space-y-2">
              <span className="text-label text-textSecondary">Large</span>
              <button className="px-8 py-4 text-body-lg bg-accentPrimary text-white rounded-pill">
                Large Button
              </button>
            </div>
          </div>
        </div>

        {/* Button States */}
        <div>
          <h3 className="text-h3 text-textSecondary mb-4">Button States</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <span className="text-body-bold text-textSecondary">Default</span>
              <button className="btn-primary">Click Me</button>
            </div>
            <div className="space-y-3">
              <span className="text-body-bold text-textSecondary">Hover</span>
              <button className="bg-[#6B2FFF] text-white rounded-pill px-4.5 py-2.5 text-body-bold shadow-[0_8px_18px_0_rgba(123,62,255,0.25)] -translate-y-0.5">
                Hover State
              </button>
            </div>
            <div className="space-y-3">
              <span className="text-body-bold text-textSecondary">Active</span>
              <button className="bg-[#6B2FFF] text-white rounded-pill px-4.5 py-2.5 text-body-bold shadow-[0_6px_14px_0_rgba(15,23,42,0.18)] scale-98">
                Active State
              </button>
            </div>
          </div>
        </div>

        {/* Loading States */}
        <div>
          <h3 className="text-h3 text-textSecondary mb-4">Loading States</h3>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary opacity-75 cursor-wait">
              <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Loading...
            </button>
            <button className="btn-secondary opacity-75 cursor-wait">
              <div className="inline-block w-4 h-4 border-2 border-textPrimary border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing
            </button>
            <button className="btn-ghost opacity-75 cursor-wait">
              <div className="inline-block w-4 h-4 border-2 border-textPrimary border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonsSection;
