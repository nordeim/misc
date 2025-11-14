import React from 'react';
import { Calendar, Bell, Users, Settings, TrendingUp, CreditCard } from 'lucide-react';

const CardsSection: React.FC = () => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h2 text-textPrimary">Cards & Containers</h2>
        <span className="badge">6 variants</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Standard Card */}
        <div className="space-y-4">
          <h3 className="text-h3 text-textSecondary">Standard Card</h3>
          <div className="card card-hover">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-body-bold text-textPrimary">Project Overview</h4>
              <button className="text-textSecondary hover:text-textPrimary transition-colors">
                <Settings size={20} />
              </button>
            </div>
            <p className="text-body text-textSecondary mb-4">
              This is a standard card component with hover effects and proper spacing.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-label text-textSecondary">Active</span>
              </div>
              <span className="text-body text-textSecondary">Due: Dec 15</span>
            </div>
          </div>
        </div>

        {/* Hero Card with Cutout */}
        <div className="space-y-4">
          <h3 className="text-h3 text-textSecondary">Hero Card</h3>
          <div className="card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-accentPrimary rounded-bl-full"></div>
            <h4 className="text-h3 text-textPrimary mb-2">Amber Website Redesign</h4>
            <p className="text-body text-textSecondary mb-4">
              Complete redesign of the company website with modern aesthetics and improved UX.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                <div className="avatar w-8 h-8 bg-accentSecondary"></div>
                <div className="avatar w-8 h-8 bg-accentYellow"></div>
                <div className="avatar w-8 h-8 bg-accentPrimary"></div>
              </div>
              <span className="text-body text-textSecondary">+3 team members</span>
            </div>
          </div>
        </div>

        {/* Compact Card */}
        <div className="space-y-4">
          <h3 className="text-h3 text-textSecondary">Compact Card</h3>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accentPrimary rounded-lg flex items-center justify-center">
                  <Calendar size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="text-body-bold text-textPrimary">Team Meeting</h4>
                  <p className="text-label text-textSecondary">Today, 2:00 PM</p>
                </div>
              </div>
              <button className="btn-ghost">Join</button>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="space-y-4">
          <h3 className="text-h3 text-textSecondary">Profile Card</h3>
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="avatar w-16 h-16 bg-gradient-to-br from-accentPrimary to-accentSecondary"></div>
                <div>
                  <h4 className="text-h3 text-textPrimary">Sarah Johnson</h4>
                  <p className="text-body text-textSecondary">Product Designer</p>
                </div>
              </div>
              <button className="text-textSecondary hover:text-textPrimary transition-colors">
                <Settings size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="tag">UI Design</span>
              <span className="tag">Research</span>
              <span className="tag">Prototyping</span>
            </div>
            <div className="flex items-center justify-between text-body text-textSecondary">
              <span>15 projects completed</span>
              <span>Member since 2023</span>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="space-y-4">
          <h3 className="text-h3 text-textSecondary">Stats Card</h3>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-body-bold text-textPrimary">Performance Metrics</h4>
              <TrendingUp size={20} className="text-success" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body text-textSecondary">Completion Rate</span>
                <span className="text-h3 text-textPrimary">94%</span>
              </div>
              <div className="w-full bg-surfaceSoft rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body text-textSecondary">Team Satisfaction</span>
                <span className="text-h3 text-textPrimary">4.8/5</span>
              </div>
              <div className="w-full bg-surfaceSoft rounded-full h-2">
                <div className="bg-accentPrimary h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Card */}
        <div className="space-y-4">
          <h3 className="text-h3 text-textSecondary">Integration Card</h3>
          <div className="card">
            <h4 className="text-body-bold text-textPrimary mb-4">Connected Services</h4>
            <div className="space-y-3">
              {[
                { name: 'Slack', icon: '💬', color: 'bg-purple-500', enabled: true },
                { name: 'GitHub', icon: '🐙', color: 'bg-gray-800', enabled: true },
                { name: 'Google Meet', icon: '📹', color: 'bg-green-500', enabled: false },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${service.color} rounded-lg flex items-center justify-center text-white text-sm`}>
                      {service.icon}
                    </div>
                    <span className="text-body text-textPrimary">{service.name}</span>
                  </div>
                  <div className="toggle">
                    <input type="checkbox" className="toggle-input" defaultChecked={service.enabled} />
                    <span className="toggle-track"></span>
                    <span className="toggle-handle"></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardsSection;
