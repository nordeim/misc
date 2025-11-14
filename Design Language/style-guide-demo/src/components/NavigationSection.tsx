import React, { useState } from 'react';
import { Home, BarChart3, FolderOpen, Users, Settings, Bell, Search, Menu, X, ChevronDown, Calendar, MessageSquare, FileText } from 'lucide-react';

const NavigationSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h2 text-textPrimary">Navigation & Menus</h2>
        <span className="badge">5 variants</span>
      </div>

      <div className="space-y-8">
        {/* Top Navigation */}
        <div>
          <h3 className="text-h3 text-textSecondary mb-4">Top Navigation</h3>
          <div className="bg-surfacePrimary rounded-card shadow-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-accentPrimary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <span className="text-h3 text-textPrimary font-semibold">Acme Corp</span>
                </div>
                
                <nav className="hidden md:flex items-center space-x-1">
                  {navItems.slice(0, 4).map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`px-4 py-2 rounded-pill text-body-bold transition-all duration-200 flex items-center space-x-2 ${
                          activeTab === item.id
                            ? 'bg-accentPrimary text-white'
                            : 'text-textSecondary hover:text-textPrimary hover:bg-surfaceSoft'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative hidden md:block">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" />
                  <input
                    type="search"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 bg-surfaceSoft rounded-pill border border-borderSubtle text-body focus:border-accentPrimary focus:outline-none focus:ring-2 focus:ring-accentPrimarySoft transition-all duration-200 w-64"
                  />
                </div>
                
                <button className="relative p-2 text-textSecondary hover:text-textPrimary transition-colors">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    3
                  </span>
                </button>
                
                <div className="w-8 h-8 bg-gradient-to-br from-accentPrimary to-accentSecondary rounded-full"></div>
                
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-textSecondary hover:text-textPrimary transition-colors"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
            
            {mobileMenuOpen && (
              <div className="mt-4 pt-4 border-t border-borderSubtle md:hidden">
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full px-4 py-2 rounded-lg text-body-bold transition-all duration-200 flex items-center space-x-3 ${
                          activeTab === item.id
                            ? 'bg-accentPrimary text-white'
                            : 'text-textSecondary hover:text-textPrimary hover:bg-surfaceSoft'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Side Navigation */}
        <div>
          <h3 className="text-h3 text-textSecondary mb-4">Side Navigation</h3>
          <div className="flex">
            <div className="w-64 bg-surfacePrimary rounded-card shadow-card p-4">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full px-4 py-3 rounded-lg text-body-bold transition-all duration-200 flex items-center space-x-3 ${
                        activeTab === item.id
                          ? 'bg-accentPrimary text-white'
                          : 'text-textSecondary hover:text-textPrimary hover:bg-surfaceSoft'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                      {item.id === 'messages' && (
                        <span className="ml-auto w-5 h-5 bg-danger rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          5
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-8 pt-4 border-t border-borderSubtle">
                <button className="w-full px-4 py-3 rounded-lg text-body-bold text-textSecondary hover:text-textPrimary hover:bg-surfaceSoft transition-all duration-200 flex items-center space-x-3">
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 ml-6 bg-surfacePrimary rounded-card shadow-card p-6">
              <h4 className="text-h3 text-textPrimary mb-4">Main Content Area</h4>
              <p className="text-body text-textSecondary">
                This area would contain the main content for the selected navigation item. 
                The side navigation provides easy access to different sections of the application.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div>
          <h3 className="text-h3 text-textSecondary mb-4">Tab Navigation</h3>
          <div className="bg-surfacePrimary rounded-card shadow-card p-6">
            <div className="border-b border-borderSubtle mb-6">
              <nav className="flex space-x-8">
                {['Overview', 'Details', 'Activity', 'Settings'].map((tab, index) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(`tab-${tab.toLowerCase()}`)}
                    className={`pb-4 px-1 text-body-bold transition-all duration-200 relative ${
                      activeTab === `tab-${tab.toLowerCase()}`
                        ? 'text-accentPrimary'
                        : 'text-textSecondary hover:text-textPrimary'
                    }`}
                  >
                    {tab}
                    {activeTab === `tab-${tab.toLowerCase()}` && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accentPrimary rounded-full"></span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="text-body text-textSecondary">
              Content for {activeTab.replace('tab-', '')} tab would appear here.
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div>
          <h3 className="text-h3 text-textSecondary mb-4">Breadcrumb Navigation</h3>
          <div className="bg-surfacePrimary rounded-card shadow-card p-6">
            <nav className="flex items-center space-x-2 text-body">
              <a href="#" className="text-accentPrimary hover:underline">Home</a>
              <span className="text-textSecondary">/</span>
              <a href="#" className="text-accentPrimary hover:underline">Projects</a>
              <span className="text-textSecondary">/</span>
              <a href="#" className="text-accentPrimary hover:underline">Web Development</a>
              <span className="text-textSecondary">/</span>
              <span className="text-textPrimary">Dashboard Redesign</span>
            </nav>
          </div>
        </div>

        {/* Pagination */}
        <div>
          <h3 className="text-h3 text-textSecondary mb-4">Pagination</h3>
          <div className="bg-surfacePrimary rounded-card shadow-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 text-body text-textSecondary hover:text-textPrimary hover:bg-surfaceSoft rounded-lg transition-all duration-200">
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, '...', 8, 9, 10].map((page, index) => (
                    <button
                      key={index}
                      className={`px-3 py-2 text-body rounded-lg transition-all duration-200 ${
                        page === 3
                          ? 'bg-accentPrimary text-white'
                          : page === '...'
                          ? 'text-textSecondary'
                          : 'text-textSecondary hover:text-textPrimary hover:bg-surfaceSoft'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button className="px-3 py-2 text-body text-textSecondary hover:text-textPrimary hover:bg-surfaceSoft rounded-lg transition-all duration-200">
                  Next
                </button>
              </div>
              
              <div className="text-body text-textSecondary">
                Showing 21-30 of 95 results
              </div>
            </div>
          </div>
        </div>

        {/* Dropdown Menus */}
        <div>
          <h3 className="text-h3 text-textSecondary mb-4">Dropdown Menus</h3>
          <div className="bg-surfacePrimary rounded-card shadow-card p-6">
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <button className="btn-secondary flex items-center space-x-2">
                  <span>Actions</span>
                  <ChevronDown size={16} />
                </button>
              </div>
              
              <div className="relative">
                <button className="btn-ghost flex items-center space-x-2">
                  <span>Sort by</span>
                  <ChevronDown size={16} />
                </button>
              </div>
              
              <button className="w-10 h-10 rounded-full bg-white shadow-card hover:shadow-floating transition-all duration-200 flex items-center justify-center">
                <Settings size={16} className="text-textSecondary" />
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-surfaceSoft rounded-lg">
              <p className="text-body text-textSecondary">
                Dropdown menus provide contextual actions and options. They appear on click and contain related actions or settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationSection;
