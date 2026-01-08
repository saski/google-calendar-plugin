/**
 * Injects "Full Year" view option into Google Calendar's view switcher
 */

class ViewInjector {
  constructor() {
    this.viewSwitcherSelector = '[role="tablist"], [aria-label*="view"], .view-switcher';
    this.currentView = null;
    this.fullYearViewActive = false;
  }

  /**
   * Initialize view injection
   */
  async init() {
    await this.waitForCalendar();
    this.injectFullYearOption();
    this.setupViewListener();
  }

  /**
   * Wait for Google Calendar to load
   * @returns {Promise<void>}
   */
  async waitForCalendar() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const calendarContainer = document.querySelector('[role="main"]');
        if (calendarContainer) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Find view switcher element
   * @returns {HTMLElement|null}
   */
  findViewSwitcher() {
    // Ensure document is available
    if (typeof document === 'undefined') {
      return null;
    }
    
    // Try multiple selectors for robustness
    const selectors = [
      '[role="tablist"]',
      '[aria-label*="view" i]',
      '.view-switcher',
      '[data-view-switcher]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
    }
    return null;
  }

  /**
   * Inject "Full Year" option into view switcher
   */
  injectFullYearOption() {
    console.log('[ViewInjector] Attempting to inject Full Year button...');
    const viewSwitcher = this.findViewSwitcher();
    if (!viewSwitcher) {
      console.warn('[ViewInjector] View switcher not found, retrying...');
      setTimeout(() => this.injectFullYearOption(), 1000);
      return;
    }

    console.log('[ViewInjector] View switcher found:', viewSwitcher);

    // Check if already injected
    if (viewSwitcher.querySelector('[data-full-year-view]')) {
      console.log('[ViewInjector] Full Year button already injected');
      return;
    }

    const fullYearButton = document.createElement('button');
    fullYearButton.setAttribute('data-full-year-view', 'true');
    fullYearButton.setAttribute('role', 'tab');
    fullYearButton.setAttribute('aria-label', 'Full Year view');
    fullYearButton.textContent = 'Full Year';
    fullYearButton.className = 'full-year-view-button';
    
    // Store reference to this for the click handler
    const self = this;
    
    // Use onclick for better compatibility with jsdom in tests
    fullYearButton.onclick = function(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      try {
        self.activateFullYearView();
      } catch (error) {
        console.error('Error in full year view click handler:', error);
      }
    };

    viewSwitcher.appendChild(fullYearButton);
    console.log('[ViewInjector] Full Year button injected successfully');
  }

  /**
   * Activate full-year view
   */
  activateFullYearView() {
    console.log('[ViewInjector] Activating full-year view...');
    this.fullYearViewActive = true;
    this.hideStandardCalendar();
    this.showFullYearView();
    this.updateViewSwitcherState();
    console.log('[ViewInjector] Full-year view activation complete');
  }

  /**
   * Hide standard Google Calendar view
   * Note: We now insert our container INTO main content, so we don't hide it
   */
  hideStandardCalendar() {
    // We're now inserting our container into main content, so we clear it instead
    const mainContent = document.querySelector('[role="main"]');
    if (mainContent) {
      console.log('[ViewInjector] Clearing main content for full-year view');
      // Don't hide - we'll replace content in showFullYearView
    } else {
      console.warn('[ViewInjector] Main content not found');
    }
  }

  /**
   * Show full-year view container
   */
  showFullYearView() {
    console.log('[ViewInjector] Showing full-year view container...');
    // Inject full-year view CSS if not already injected
    this.injectFullYearCSS();
    
    // Find main content area first
    const mainContent = document.querySelector('[role="main"]');
    if (!mainContent) {
      console.error('[ViewInjector] Main content area not found!');
      return;
    }
    
    let container = document.getElementById('full-year-view-container');
    if (!container) {
      console.log('[ViewInjector] Creating full-year view container...');
      container = document.createElement('div');
      container.id = 'full-year-view-container';
      container.className = 'full-year-view-container';
      
      // Container styles are handled by CSS class
      // Only set essential inline styles if needed
      
      // Insert container INSIDE main content area (before hiding it)
      // This ensures it's in the correct layout context
      mainContent.innerHTML = ''; // Clear existing content
      mainContent.appendChild(container);
      console.log('[ViewInjector] Container inserted into main content area');
      
      // Log container position in DOM
      console.log('[ViewInjector] Container parent:', container.parentElement);
      console.log('[ViewInjector] Container offsetParent:', container.offsetParent);
      console.log('[ViewInjector] Container created');
    } else {
      console.log('[ViewInjector] Container already exists');
    }
    
    // Ensure main content is visible (we're using it as container now)
    if (mainContent) {
      mainContent.style.display = 'block';
    }
    
    // Trigger event for view renderer
    console.log('[ViewInjector] Dispatching fullYearViewActivated event...');
    window.dispatchEvent(new CustomEvent('fullYearViewActivated'));
    console.log('[ViewInjector] Event dispatched');
  }

  /**
   * Inject full-year view CSS stylesheet
   */
  injectFullYearCSS() {
    if (document.getElementById('full-year-view-styles')) {
      return; // Already injected
    }
    
    // Try to get chrome.runtime - it should always be available in content scripts
    let chromeRuntime = null;
    try {
      if (typeof chrome !== 'undefined' && chrome && chrome.runtime) {
        chromeRuntime = chrome.runtime;
      } else if (typeof browser !== 'undefined' && browser && browser.runtime) {
        // Fallback for Firefox
        chromeRuntime = browser.runtime;
      }
    } catch (e) {
      console.warn('Could not access chrome/browser runtime:', e);
    }
    
    // If chrome.runtime is not available, inject minimal inline styles as fallback
    if (!chromeRuntime || typeof chromeRuntime.getURL !== 'function') {
      console.warn('chrome.runtime.getURL not available, using inline styles fallback');
      this.injectInlineStyles();
      return;
    }
    
    try {
      const cssUrl = chromeRuntime.getURL('src/styles/full-year-view.css');
      if (!cssUrl) {
        console.warn('chrome.runtime.getURL returned empty, using inline styles fallback');
        this.injectInlineStyles();
        return;
      }
      
      const link = document.createElement('link');
      link.id = 'full-year-view-styles';
      link.rel = 'stylesheet';
      link.href = cssUrl;
      link.onerror = () => {
        console.warn('Failed to load full-year-view.css, using inline styles fallback');
        this.injectInlineStyles();
      };
      document.head.appendChild(link);
    } catch (error) {
      console.warn('Failed to inject full-year-view CSS, using inline styles fallback:', error);
      this.injectInlineStyles();
    }
  }

  /**
   * Inject minimal inline styles as fallback when chrome.runtime.getURL is not available
   */
  injectInlineStyles() {
    if (document.getElementById('full-year-view-styles-inline')) {
      return; // Already injected
    }
    
    const style = document.createElement('style');
    style.id = 'full-year-view-styles-inline';
    style.textContent = `
      .full-year-view-container {
        padding: 24px;
        background: white;
        min-height: 100vh;
      }
      .full-year-grid {
        display: grid;
        grid-template-columns: [month-label] 120px repeat(31, [day] minmax(30px, 1fr));
        grid-template-rows: [header] auto repeat(12, [month] auto);
        gap: 0;
        border: 1px solid #e0e0e0;
      }
      .full-year-header {
        grid-column: 1 / -1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 2px solid #e0e0e0;
        background: #f5f5f5;
      }
      .month-row {
        display: grid;
        grid-column: 1 / -1;
        grid-template-columns: subgrid;
        border-bottom: 1px solid #e0e0e0;
      }
      .month-label {
        grid-column: month-label;
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: #f5f5f5;
        font-weight: 500;
        position: sticky;
        left: 0;
        z-index: 10;
      }
      .day-cell {
        border-right: 1px solid #e0e0e0;
        min-height: 40px;
        padding: 4px;
        position: relative;
      }
      .day-cell.weekend-saturday { background-color: #e8f5e9; }
      .day-cell.weekend-sunday { background-color: #fce4ec; }
      .day-cell.weekday { background-color: #e3f2fd; }
    `;
    document.head.appendChild(style);
  }

  /**
   * Update view switcher button states
   */
  updateViewSwitcherState() {
    const fullYearButton = document.querySelector('[data-full-year-view]');
    const otherButtons = document.querySelectorAll('[role="tab"]:not([data-full-year-view])');
    
    if (fullYearButton) {
      fullYearButton.setAttribute('aria-selected', 'true');
      fullYearButton.classList.add('active');
    }
    
    otherButtons.forEach(btn => {
      btn.setAttribute('aria-selected', 'false');
      btn.classList.remove('active');
    });
  }

  /**
   * Setup listener for view changes
   */
  setupViewListener() {
    // Ensure document is available
    if (typeof document === 'undefined' || !document.body) {
      return;
    }
    
    // Use MutationObserver to detect view switcher changes
    const observer = new MutationObserver(() => {
      // Ensure document is still available in callback
      if (typeof document === 'undefined') {
        return;
      }
      if (!this.fullYearViewActive) {
        this.injectFullYearOption();
      }
    });

    const target = document.body;
    observer.observe(target, {
      childList: true,
      subtree: true
    });
  }
}

// Export as global
window.ViewInjector = ViewInjector;

