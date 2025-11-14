import React, { useState } from 'react';
import { Search, Mail, Lock, User, Phone, MapPin, Calendar, Upload } from 'lucide-react';

const FormsSection: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('');

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h2 text-textPrimary">Forms & Inputs</h2>
        <span className="badge">8 variants</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Text Inputs */}
        <div className="space-y-6">
          <h3 className="text-h3 text-textSecondary">Text Inputs</h3>
          
          <div className="space-y-2">
            <label className="text-body-bold text-textPrimary">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" />
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-3 bg-surfaceSoft rounded-pill border border-borderSubtle focus:border-accentPrimary focus:outline-none focus:ring-2 focus:ring-accentPrimarySoft transition-all duration-200"
                defaultValue="Sarah Johnson"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-body-bold text-textPrimary">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 bg-surfaceSoft rounded-pill border border-borderSubtle focus:border-accentPrimary focus:outline-none focus:ring-2 focus:ring-accentPrimarySoft transition-all duration-200"
                defaultValue="sarah@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-body-bold text-textPrimary">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" />
              <input
                type="password"
                placeholder="Enter secure password"
                className="w-full pl-10 pr-4 py-3 bg-surfaceSoft rounded-pill border border-borderSubtle focus:border-accentPrimary focus:outline-none focus:ring-2 focus:ring-accentPrimarySoft transition-all duration-200"
                defaultValue="••••••••••••"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-body-bold text-textPrimary">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" />
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="w-full pl-10 pr-4 py-3 bg-surfaceSoft rounded-pill border border-borderSubtle focus:border-accentPrimary focus:outline-none focus:ring-2 focus:ring-accentPrimarySoft transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Select & Dropdown */}
        <div className="space-y-6">
          <h3 className="text-h3 text-textSecondary">Select & Dropdown</h3>
          
          <div className="space-y-2">
            <label className="text-body-bold text-textPrimary">Country</label>
            <select className="w-full px-4 py-3 bg-surfaceSoft rounded-pill border border-borderSubtle focus:border-accentPrimary focus:outline-none focus:ring-2 focus:ring-accentPrimarySoft transition-all duration-200 appearance-none">
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Australia</option>
              <option>Germany</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-body-bold text-textPrimary">Role</label>
            <div className="relative">
              <select className="w-full px-4 py-3 bg-surfaceSoft rounded-pill border border-borderSubtle focus:border-accentPrimary focus:outline-none focus:ring-2 focus:ring-accentPrimarySoft transition-all duration-200 appearance-none">
                <option>Product Designer</option>
                <option>Frontend Developer</option>
                <option>Project Manager</option>
                <option>Marketing Specialist</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-body-bold text-textPrimary">Team Size</label>
            <div className="grid grid-cols-3 gap-2">
              {['1-5', '6-20', '21-50'].map((size) => (
                <button
                  key={size}
                  className="px-4 py-2 text-body bg-surfaceSoft border border-borderSubtle rounded-pill hover:border-accentPrimary hover:bg-accentPrimarySoft transition-all duration-200"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-body-bold text-textPrimary">Search Input</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" />
              <input
                type="search"
                placeholder="Search projects, tasks, or people..."
                className="w-full pl-10 pr-4 py-3 bg-surfaceSoft rounded-pill border border-borderSubtle focus:border-accentPrimary focus:outline-none focus:ring-2 focus:ring-accentPrimarySoft transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Textarea & File Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="space-y-6">
          <h3 className="text-h3 text-textSecondary">Textarea</h3>
          <div className="space-y-2">
            <label className="text-body-bold text-textPrimary">Project Description</label>
            <textarea
              rows={4}
              placeholder="Describe your project goals, requirements, and expected outcomes..."
              className="w-full px-4 py-3 bg-surfaceSoft rounded-card border border-borderSubtle focus:border-accentPrimary focus:outline-none focus:ring-2 focus:ring-accentPrimarySoft transition-all duration-200 resize-none"
              defaultValue="This project aims to redesign the customer portal with a focus on improving user experience and accessibility. We'll implement modern design patterns and ensure mobile responsiveness."
            />
          </div>

          <div className="space-y-2">
            <label className="text-body-bold text-textPrimary">Comments</label>
            <textarea
              rows={3}
              placeholder="Add your comments or feedback..."
              className="w-full px-4 py-3 bg-surfaceSoft rounded-card border border-borderSubtle focus:border-accentPrimary focus:outline-none focus:ring-2 focus:ring-accentPrimarySoft transition-all duration-200 resize-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-h3 text-textSecondary">File Upload</h3>
          <div className="space-y-2">
            <label className="text-body-bold text-textPrimary">Upload Documents</label>
            <div className="border-2 border-dashed border-borderSubtle rounded-card p-8 text-center hover:border-accentPrimary transition-colors duration-200">
              <Upload size={32} className="mx-auto text-textSecondary mb-4" />
              <p className="text-body text-textSecondary mb-2">
                Drag and drop files here or{' '}
                <button
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="text-accentPrimary hover:underline"
                >
                  browse
                </button>
              </p>
              <p className="text-label text-textMuted">Supports: PDF, DOC, JPG, PNG (Max 10MB)</p>
              <input
                id="file-input"
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setSelectedFile(e.target.files[0].name);
                  }
                }}
              />
            </div>
            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-surfaceSoft rounded-lg">
                <span className="text-body text-textPrimary">{selectedFile}</span>
                <button
                  onClick={() => setSelectedFile('')}
                  className="text-textSecondary hover:text-danger"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-body-bold text-textPrimary">Date Selection</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-3 bg-surfaceSoft rounded-pill border border-borderSubtle focus:border-accentPrimary focus:outline-none focus:ring-2 focus:ring-accentPrimarySoft transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Checkbox & Radio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="space-y-6">
          <h3 className="text-h3 text-textSecondary">Checkboxes</h3>
          <div className="space-y-3">
            {[
              { label: 'Email notifications', checked: true },
              { label: 'SMS alerts', checked: false },
              { label: 'Push notifications', checked: true },
              { label: 'Weekly digest', checked: false },
            ].map((item, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={item.checked}
                  className="w-5 h-5 text-accentPrimary bg-surfaceSoft border-borderSubtle rounded focus:ring-accentPrimary focus:ring-2"
                />
                <span className="text-body text-textPrimary">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-h3 text-textSecondary">Radio Buttons</h3>
          <div className="space-y-3">
            {[
              { label: 'Public project', value: 'public', checked: true },
              { label: 'Private project', value: 'private', checked: false },
              { label: 'Team only', value: 'team', checked: false },
            ].map((item, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="project-visibility"
                  value={item.value}
                  defaultChecked={item.checked}
                  className="w-5 h-5 text-accentPrimary bg-surfaceSoft border-borderSubtle focus:ring-accentPrimary focus:ring-2"
                />
                <span className="text-body text-textPrimary">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-borderSubtle">
        <button className="btn-secondary">Cancel</button>
        <button className="btn-primary">Save Changes</button>
      </div>
    </div>
  );
};

export default FormsSection;
