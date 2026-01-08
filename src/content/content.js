// All modules loaded from manifest in dependency order

let fullYearView = null;
let calendarAPI = null;

/**
 * Load and display events
 */
async function loadEvents() {
  if (!calendarAPI) {
    calendarAPI = new window.CalendarAPI();
  }

  try {
    // Initialize OAuth handler first
    await calendarAPI.oauthHandler.initialize();
    
    const calendars = await calendarAPI.getCalendars();
    const calendarIds = calendars.map(cal => cal.id);
    const currentYear = new Date().getFullYear();
    
    const events = await calendarAPI.getYearEvents(currentYear, calendarIds);
    
    if (fullYearView) {
      fullYearView.setEvents(events);
    }
  } catch (error) {
    console.error('Failed to load events:', error);
    
    // Show error to user
    showErrorToUser(error.message || 'Failed to load calendar events. Please try again.');
    
    // Retry after delay
    setTimeout(() => loadEvents(), 5000);
  }
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showErrorToUser(message) {
  // Create or update error notification
  let errorDiv = document.getElementById('calendar-extension-error');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'calendar-extension-error';
    errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #f44336; color: white; padding: 16px; border-radius: 4px; z-index: 10000; max-width: 400px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
    document.body.appendChild(errorDiv);
  }
  errorDiv.textContent = message;
  
  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (errorDiv && errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 10000);
}

/**
 * Initialize full-year view when activated
 */
async function initFullYearView() {
  console.log('[Content] initFullYearView called');
  const container = document.getElementById('full-year-view-container');
  console.log('[Content] Container found:', container);
  if (container && !fullYearView) {
    console.log('[Content] Creating FullYearView instance...');
    fullYearView = new window.FullYearView(container);
    console.log('[Content] Rendering full-year view...');
    fullYearView.render();
    console.log('[Content] Full-year view rendered, loading events...');
    
    // Load events after view is rendered
    await loadEvents();
    console.log('[Content] Events loaded');
  } else {
    if (!container) {
      console.error('[Content] Container not found!');
    }
    if (fullYearView) {
      console.log('[Content] FullYearView already exists');
    }
  }
}

// Listen for full-year view activation
window.addEventListener('fullYearViewActivated', initFullYearView);

/**
 * Main content script - runs on calendar.google.com
 */
async function init() {
  console.log('[Content] Initializing content script...');
  const injector = new window.ViewInjector();
  await injector.init();
  console.log('[Content] ViewInjector initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

