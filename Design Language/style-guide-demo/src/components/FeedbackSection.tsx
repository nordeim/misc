import React, { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, Loader, Toast, MessageSquare, HelpCircle, Send } from 'lucide-react';

const FeedbackSection: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const openModal = (type: 'success' | 'error' | 'warning' | 'info') => {
    setModalType(type);
    setModalOpen(true);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h2 text-textPrimary">Feedback & Messages</h2>
        <span className="badge">8 variants</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Toast Notifications */}
        <div className="space-y-6">
          <h3 className="text-h3 text-textSecondary">Toast Notifications</h3>
          <div className="bg-surfacePrimary rounded-card shadow-card p-6">
            <h4 className="text-body-bold text-textPrimary mb-4">Trigger Toast Messages</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => showNotification('success', 'Changes saved successfully!')}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <CheckCircle size={16} />
                <span>Success Toast</span>
              </button>
              <button
                onClick={() => showNotification('error', 'Failed to save changes. Please try again.')}
                className="bg-danger text-white rounded-pill px-4 py-2 text-body-bold hover:bg-red-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <XCircle size={16} />
                <span>Error Toast</span>
              </button>
              <button
                onClick={() => showNotification('warning', 'Your session will expire in 5 minutes.')}
                className="bg-warning text-white rounded-pill px-4 py-2 text-body-bold hover:bg-yellow-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <AlertCircle size={16} />
                <span>Warning Toast</span>
              </button>
              <button
                onClick={() => showNotification('info', 'New feature available in Settings.')}
                className="bg-accentSecondary text-white rounded-pill px-4 py-2 text-body-bold hover:bg-teal-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Info size={16} />
                <span>Info Toast</span>
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-surfaceSoft rounded-lg">
              <p className="text-body text-textSecondary">
                Toast notifications appear temporarily at the top-right corner of the screen to provide feedback about user actions.
              </p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        <div className="space-y-6">
          <h3 className="text-h3 text-textSecondary">Alert Messages</h3>
          <div className="bg-surfacePrimary rounded-card shadow-card p-6 space-y-4">
            <div className="bg-success bg-opacity-20 border border-success border-opacity-30 rounded-lg p-4 flex items-start space-x-3">
              <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-body-bold text-success mb-1">Success!</h5>
                <p className="text-body text-success">Your profile has been updated successfully.</p>
              </div>
              <button className="text-success hover:text-green-700 transition-colors ml-auto">
                <XCircle size={16} />
              </button>
            </div>
            
            <div className="bg-danger bg-opacity-20 border border-danger border-opacity-30 rounded-lg p-4 flex items-start space-x-3">
              <XCircle size={20} className="text-danger flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-body-bold text-danger mb-1">Error!</h5>
                <p className="text-body text-danger">Unable to connect to the server. Please check your internet connection.</p>
              </div>
              <button className="text-danger hover:text-red-700 transition-colors ml-auto">
                <XCircle size={16} />
              </button>
            </div>
            
            <div className="bg-warning bg-opacity-20 border border-warning border-opacity-30 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle size={20} className="text-warning flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-body-bold text-warning mb-1">Warning!</h5>
                <p className="text-body text-warning">You have unsaved changes. Make sure to save before leaving this page.</p>
              </div>
              <button className="text-warning hover:text-yellow-700 transition-colors ml-auto">
                <XCircle size={16} />
              </button>
            </div>
            
            <div className="bg-accentPrimary bg-opacity-20 border border-accentPrimary border-opacity-30 rounded-lg p-4 flex items-start space-x-3">
              <Info size={20} className="text-accentPrimary flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-body-bold text-accentPrimary mb-1">Information</h5>
                <p className="text-body text-accentPrimary">A new version of the application is available. Update now to get the latest features.</p>
              </div>
              <button className="text-accentPrimary hover:text-purple-700 transition-colors ml-auto">
                <XCircle size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Dialogs */}
        <div className="space-y-6">
          <h3 className="text-h3 text-textSecondary">Modal Dialogs</h3>
          <div className="bg-surfacePrimary rounded-card shadow-card p-6">
            <h4 className="text-body-bold text-textPrimary mb-4">Open Modal Examples</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => openModal('success')}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <CheckCircle size={16} />
                <span>Success Modal</span>
              </button>
              <button
                onClick={() => openModal('error')}
                className="bg-danger text-white rounded-pill px-4 py-2 text-body-bold hover:bg-red-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <XCircle size={16} />
                <span>Error Modal</span>
              </button>
              <button
                onClick={() => openModal('warning')}
                className="bg-warning text-white rounded-pill px-4 py-2 text-body-bold hover:bg-yellow-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <AlertCircle size={16} />
                <span>Warning Modal</span>
              </button>
              <button
                onClick={() => openModal('info')}
                className="bg-accentSecondary text-white rounded-pill px-4 py-2 text-body-bold hover:bg-teal-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Info size={16} />
                <span>Info Modal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading States */}
        <div className="space-y-6">
          <h3 className="text-h3 text-textSecondary">Loading States</h3>
          <div className="bg-surfacePrimary rounded-card shadow-card p-6 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 border-2 border-accentPrimary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-body text-textPrimary">Loading data...</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 border-2 border-accentSecondary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-body text-textPrimary">Saving changes...</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 border-2 border-success border-t-transparent rounded-full animate-spin"></div>
              <span className="text-body text-textPrimary">Processing payment...</span>
            </div>
            
            <div className="mt-6 p-4 bg-surfaceSoft rounded-lg">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-textSecondary bg-opacity-20 rounded w-3/4"></div>
                <div className="h-4 bg-textSecondary bg-opacity-20 rounded w-1/2"></div>
                <div className="h-4 bg-textSecondary bg-opacity-20 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tooltips */}
        <div className="space-y-6">
          <h3 className="text-h3 text-textSecondary">Tooltips & Help</h3>
          <div className="bg-surfacePrimary rounded-card shadow-card p-6">
            <h4 className="text-body-bold text-textPrimary mb-4">Interactive Elements</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="relative group">
                <button className="btn-primary w-full">Hover for Tooltip</button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-textPrimary text-white text-label rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  This button saves your changes
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-textPrimary"></div>
                </div>
              </div>
              
              <div className="relative group">
                <button className="btn-secondary w-full">Help Icon</button>
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <HelpCircle size={16} className="text-accentPrimary cursor-help" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-success rounded-full"></div>
                <span className="text-body text-textPrimary">Completed tasks</span>
                <HelpCircle size={14} className="text-textSecondary cursor-help" />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-warning rounded-full"></div>
                <span className="text-body text-textPrimary">In progress</span>
                <HelpCircle size={14} className="text-textSecondary cursor-help" />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-textSecondary rounded-full"></div>
                <span className="text-body text-textPrimary">Not started</span>
                <HelpCircle size={14} className="text-textSecondary cursor-help" />
              </div>
            </div>
          </div>
        </div>

        {/* Empty States */}
        <div className="space-y-6">
          <h3 className="text-h3 text-textSecondary">Empty States</h3>
          <div className="bg-surfacePrimary rounded-card shadow-card p-6 space-y-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-surfaceSoft rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} className="text-textSecondary" />
              </div>
              <h4 className="text-h3 text-textPrimary mb-2">No messages yet</h4>
              <p className="text-body text-textSecondary mb-4">Start a conversation to see your messages here.</p>
              <button className="btn-primary">Send First Message</button>
            </div>
            
            <div className="text-center py-8 border-t border-borderSubtle">
              <div className="w-16 h-16 bg-surfaceSoft rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-textSecondary" />
              </div>
              <h4 className="text-h3 text-textPrimary mb-2">No team members</h4>
              <p className="text-body text-textSecondary mb-4">Invite people to join your team and collaborate.</p>
              <button className="btn-primary">Invite Members</button>
            </div>
            
            <div className="text-center py-8 border-t border-borderSubtle">
              <div className="w-16 h-16 bg-surfaceSoft rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-textSecondary" />
              </div>
              <h4 className="text-h3 text-textPrimary mb-2">No projects found</h4>
              <p className="text-body text-textSecondary mb-4">Create your first project to get started.</p>
              <button className="btn-primary">Create Project</button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification Overlay */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`bg-surfacePrimary rounded-card shadow-floating p-4 flex items-center space-x-3 min-w-[300px] ${
            toastType === 'success' ? 'border-l-4 border-success' :
            toastType === 'error' ? 'border-l-4 border-danger' :
            toastType === 'warning' ? 'border-l-4 border-warning' :
            'border-l-4 border-accentPrimary'
          }`}>
            {toastType === 'success' && <CheckCircle size={20} className="text-success" />}
            {toastType === 'error' && <XCircle size={20} className="text-danger" />}
            {toastType === 'warning' && <AlertCircle size={20} className="text-warning" />}
            {toastType === 'info' && <Info size={20} className="text-accentPrimary" />}
            <div className="flex-1">
              <p className="text-body text-textPrimary">{toastMessage}</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-textSecondary hover:text-textPrimary transition-colors"
            >
              <XCircle size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surfacePrimary rounded-card shadow-floating p-6 max-w-md w-full">
            <div className="text-center">
              {modalType === 'success' && (
                <div className="w-16 h-16 bg-success bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-success" />
                </div>
              )}
              {modalType === 'error' && (
                <div className="w-16 h-16 bg-danger bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle size={32} className="text-danger" />
                </div>
              )}
              {modalType === 'warning' && (
                <div className="w-16 h-16 bg-warning bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-warning" />
                </div>
              )}
              {modalType === 'info' && (
                <div className="w-16 h-16 bg-accentPrimary bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info size={32} className="text-accentPrimary" />
                </div>
              )}
              
              <h3 className="text-h2 text-textPrimary mb-2">
                {modalType === 'success' ? 'Success!' :
                 modalType === 'error' ? 'Error!' :
                 modalType === 'warning' ? 'Warning!' : 'Information'}
              </h3>
              
              <p className="text-body text-textSecondary mb-6">
                {modalType === 'success' ? 'Your action was completed successfully.' :
                 modalType === 'error' ? 'Something went wrong. Please try again.' :
                 modalType === 'warning' ? 'Please review your input before proceeding.' : 'Here is some important information for you.'}
              </p>
              
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className={modalType === 'success' ? 'btn-primary' :
                           modalType === 'error' ? 'bg-danger text-white rounded-pill px-4 py-2 text-body-bold hover:bg-red-600 transition-all duration-200' :
                           modalType === 'warning' ? 'bg-warning text-white rounded-pill px-4 py-2 text-body-bold hover:bg-yellow-600 transition-all duration-200' :
                           'bg-accentSecondary text-white rounded-pill px-4 py-2 text-body-bold hover:bg-teal-600 transition-all duration-200'}
                >
                  {modalType === 'success' ? 'Continue' :
                   modalType === 'error' ? 'Retry' :
                   modalType === 'warning' ? 'Proceed' : 'Got it'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackSection;
