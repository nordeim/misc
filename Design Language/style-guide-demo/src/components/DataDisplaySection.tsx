import React, { useState } from 'react';
import { Calendar, Clock, Users, TrendingUp, Activity, Target, CheckCircle, AlertCircle, XCircle, MoreVertical, Filter, Download } from 'lucide-react';

const DataDisplaySection: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const day = i - 5;
    return day > 0 && day <= 31 ? day : null;
  });

  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Project completed',
      description: 'Website redesign project has been completed successfully',
      time: '2 hours ago',
      icon: CheckCircle,
      unread: true,
    },
    {
      id: 2,
      type: 'warning',
      title: 'Deadline approaching',
      description: 'Mobile app development deadline is in 3 days',
      time: '4 hours ago',
      icon: AlertCircle,
      unread: true,
    },
    {
      id: 3,
      type: 'info',
      title: 'New team member',
      description: 'Sarah Johnson joined the design team',
      time: '6 hours ago',
      icon: Users,
      unread: false,
    },
    {
      id: 4,
      type: 'error',
      title: 'Server issue',
      description: 'Production server experiencing high load',
      time: '1 day ago',
      icon: XCircle,
      unread: false,
    },
  ];

  const milestones = [
    {
      id: 1,
      title: 'Design System Implementation',
      progress: 85,
      dueDate: '2024-12-15',
      assignees: ['Alice', 'Bob', 'Charlie'],
      status: 'in-progress',
    },
    {
      id: 2,
      title: 'User Research Phase',
      progress: 100,
      dueDate: '2024-12-10',
      assignees: ['Diana', 'Eve'],
      status: 'completed',
    },
    {
      id: 3,
      title: 'API Integration',
      progress: 45,
      dueDate: '2024-12-20',
      assignees: ['Frank', 'Grace'],
      status: 'in-progress',
    },
    {
      id: 4,
      title: 'Performance Optimization',
      progress: 20,
      dueDate: '2024-12-25',
      assignees: ['Henry'],
      status: 'not-started',
    },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h2 text-textPrimary">Data Display</h2>
        <span className="badge">6 variants</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="space-y-6">
          <h3 className="text-h3 text-textSecondary">Calendar</h3>
          <div className="bg-surfacePrimary rounded-card shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-h3 text-textPrimary">December 2024</h4>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-textSecondary hover:text-textPrimary hover:bg-surfaceSoft rounded-lg transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="p-2 text-textSecondary hover:text-textPrimary hover:bg-surfaceSoft rounded-lg transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-label text-textSecondary py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => day && setSelectedDate(day)}
                  className={`aspect-square flex items-center justify-center text-body rounded-lg transition-all duration-200 ${
                    day === null
                      ? 'text-textMuted'
                      : day === selectedDate
                      ? 'bg-accentPrimary text-white'
                      : day === new Date().getDate()
                      ? 'bg-accentPrimarySoft text-accentPrimary font-semibold'
                      : 'text-textPrimary hover:bg-surfaceSoft'
                  }`}
                  disabled={!day}
                >
                  {day || ''}
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-borderSubtle">
              <div className="flex items-center justify-between text-body text-textSecondary">
                <span>Selected: Dec {selectedDate}, 2024</span>
                <span className="text-accentPrimary">2 events</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-6">
          <h3 className="text-h3 text-textSecondary">Notifications</h3>
          <div className="bg-surfacePrimary rounded-card shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-h3 text-textPrimary">Recent Activity</h4>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-textSecondary hover:text-textPrimary hover:bg-surfaceSoft rounded-lg transition-all duration-200">
                  <Filter size={16} />
                </button>
                <button className="p-2 text-textSecondary hover:text-textPrimary hover:bg-surfaceSoft rounded-lg transition-all duration-200">
                  <Download size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-3 p-4 rounded-lg transition-all duration-200 hover:bg-surfaceSoft ${
                      notification.unread ? 'bg-accentPrimarySoft bg-opacity-20' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.type === 'success' ? 'bg-success bg-opacity-20 text-success' :
                      notification.type === 'warning' ? 'bg-warning bg-opacity-20 text-warning' :
                      notification.type === 'error' ? 'bg-danger bg-opacity-20 text-danger' :
                      'bg-accentPrimary bg-opacity-20 text-accentPrimary'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-body-bold text-textPrimary">{notification.title}</h5>
                        <button className="text-textSecondary hover:text-textPrimary transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                      <p className="text-body text-textSecondary mb-2">{notification.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-label text-textMuted">{notification.time}</span>
                        {notification.unread && (
                          <span className="w-2 h-2 bg-accentPrimary rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-borderSubtle text-center">
              <button className="text-accentPrimary hover:underline text-body-bold">
                View all notifications
              </button>
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="space-y-6">
          <h3 className="text-h3 text-textSecondary">Progress Indicators</h3>
          <div className="bg-surfacePrimary rounded-card shadow-card p-6">
            <h4 className="text-h3 text-textPrimary mb-6">Project Progress</h4>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body text-textPrimary">Overall Completion</span>
                  <span className="text-body-bold text-accentPrimary">75%</span>
                </div>
                <div className="w-full bg-surfaceSoft rounded-full h-3">
                  <div className="bg-gradient-to-r from-accentPrimary to-accentSecondary h-3 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body text-textPrimary">Design Phase</span>
                  <span className="text-body-bold text-success">100%</span>
                </div>
                <div className="w-full bg-surfaceSoft rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body text-textPrimary">Development</span>
                  <span className="text-body-bold text-warning">60%</span>
                </div>
                <div className="w-full bg-surfaceSoft rounded-full h-2">
                  <div className="bg-warning h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body text-textPrimary">Testing</span>
                  <span className="text-body-bold text-textSecondary">25%</span>
                </div>
                <div className="w-full bg-surfaceSoft rounded-full h-2">
                  <div className="bg-textSecondary h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-surfaceSoft rounded-lg">
                <div className="w-16 h-16 mx-auto mb-2 relative">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="#EDE7FF" strokeWidth="4" fill="none"/>
                    <circle cx="32" cy="32" r="28" stroke="#7B3EFF" strokeWidth="4" fill="none" strokeDasharray="176" strokeDashoffset="44" className="transition-all duration-500"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-body-bold text-accentPrimary">75%</span>
                  </div>
                </div>
                <span className="text-body text-textSecondary">Tasks</span>
              </div>
              
              <div className="text-center p-4 bg-surfaceSoft rounded-lg">
                <div className="w-16 h-16 mx-auto mb-2 relative">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="#E5E7EB" strokeWidth="4" fill="none"/>
                    <circle cx="32" cy="32" r="28" stroke="#10B981" strokeWidth="4" fill="none" strokeDasharray="176" strokeDashoffset="0" className="transition-all duration-500"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-body-bold text-success">100%</span>
                  </div>
                </div>
                <span className="text-body text-textSecondary">Design</span>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-6">
          <h3 className="text-h3 text-textSecondary">Milestones</h3>
          <div className="bg-surfacePrimary rounded-card shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-h3 text-textPrimary">Project Milestones</h4>
              <button className="btn-primary">Add Milestone</button>
            </div>
            
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="border border-borderSubtle rounded-lg p-4 hover:shadow-card transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="text-body-bold text-textPrimary mb-1">{milestone.title}</h5>
                      <div className="flex items-center space-x-4 text-label text-textSecondary">
                        <span className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>{milestone.dueDate}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users size={12} />
                          <span>{milestone.assignees.length} assignees</span>
                        </span>
                      </div>
                    </div>
                    <button className="text-textSecondary hover:text-textPrimary transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-label text-textSecondary">Progress</span>
                      <span className="text-label text-accentPrimary">{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-surfaceSoft rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          milestone.status === 'completed' ? 'bg-success' :
                          milestone.status === 'in-progress' ? 'bg-accentPrimary' : 'bg-textSecondary'
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {milestone.assignees.slice(0, 3).map((assignee, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 bg-gradient-to-br from-accentPrimary to-accentSecondary rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                        >
                          {assignee[0]}
                        </div>
                      ))}
                      {milestone.assignees.length > 3 && (
                        <div className="w-6 h-6 bg-surfaceSoft rounded-full border-2 border-white flex items-center justify-center text-textSecondary text-xs font-semibold">
                          +{milestone.assignees.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <span className={`px-2 py-1 text-label rounded-pill ${
                      milestone.status === 'completed' ? 'bg-success bg-opacity-20 text-success' :
                      milestone.status === 'in-progress' ? 'bg-accentPrimary bg-opacity-20 text-accentPrimary' :
                      'bg-textSecondary bg-opacity-20 text-textSecondary'
                    }`}>
                      {milestone.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="space-y-6 lg:col-span-2">
          <h3 className="text-h3 text-textSecondary">Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Total Projects', value: '24', change: '+12%', trend: 'up', icon: Target, color: 'accentPrimary' },
              { title: 'Active Tasks', value: '156', change: '+8%', trend: 'up', icon: Activity, color: 'success' },
              { title: 'Team Members', value: '18', change: '+2', trend: 'up', icon: Users, color: 'accentSecondary' },
              { title: 'Completion Rate', value: '94%', change: '-2%', trend: 'down', icon: TrendingUp, color: 'warning' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-surfacePrimary rounded-card shadow-card p-6 hover:shadow-floating transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-${stat.color} bg-opacity-20 rounded-lg flex items-center justify-center`}>
                      <Icon size={24} className={`text-${stat.color}`} />
                    </div>
                    <span className={`text-label ${
                      stat.trend === 'up' ? 'text-success' : 'text-danger'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <h4 className="text-h3 text-textPrimary mb-1">{stat.value}</h4>
                  <p className="text-body text-textSecondary">{stat.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDisplaySection;
