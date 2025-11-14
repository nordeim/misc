/**
 * LimeAura Dashboard - Main JavaScript
 * Version: 1.0.0
 */

(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const config = {
    animationDuration: 180,
    loadingDelay: 800,
    countUpDuration: 1500,
    calendarMonths: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    calendarDaysShort: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  };

  // ============================================
  // State Management
  // ============================================
  const state = {
    currentDate: new Date(),
    selectedDate: null,
    notifications: 3,
    integrations: {
      slack: true,
      googleDrive: true,
      github: false,
      stripe: false
    }
  };

  // ============================================
  // DOM Elements Cache
  // ============================================
  let elements = {};

  // ============================================
  // Utility Functions
  // ============================================
  const utils = {
    /**
     * Query selector wrapper
     */
    $(selector) {
      return document.querySelector(selector);
    },
    
    /**
     * Query selector all wrapper
     */
    $$(selector) {
      return document.querySelectorAll(selector);
    },
    
    /**
     * Add event listener wrapper
     */
    
