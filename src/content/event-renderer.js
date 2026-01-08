// EventParser loaded from manifest

/**
 * Renders events in full-year view
 */
class EventRenderer {
  constructor() {
    this.events = [];
  }

  /**
   * Set events data
   * @param {Array<Object>} events
   */
  setEvents(events) {
    this.events = events.map(e => window.EventParser.normalizeEvent(e));
  }

  /**
   * Render events in day cells
   */
  renderEvents() {
    const dayCells = document.querySelectorAll('.day-cell[data-date]');
    
    dayCells.forEach(cell => {
      const dateStr = cell.getAttribute('data-date');
      const date = new Date(dateStr);
      const eventsForDay = window.EventParser.getEventsForDate(this.events, date);
      
      this.renderEventsInCell(cell, eventsForDay);
    });
  }

  /**
   * Render events in a single day cell
   * @param {HTMLElement} cell
   * @param {Array<Object>} events
   */
  renderEventsInCell(cell, events) {
    // Clear existing event indicators
    const existingIndicators = cell.querySelectorAll('.event-indicator');
    existingIndicators.forEach(el => el.remove());

    if (events.length === 0) {
      return;
    }

    // Create event indicator container
    const indicatorContainer = document.createElement('div');
    indicatorContainer.className = 'event-indicators';

    if (events.length <= 3) {
      // Show individual event dots
      events.forEach(event => {
        const dot = this.createEventDot(event);
        indicatorContainer.appendChild(dot);
      });
    } else {
      // Show count indicator
      const countIndicator = document.createElement('div');
      countIndicator.className = 'event-count';
      countIndicator.textContent = `${events.length}`;
      countIndicator.setAttribute('aria-label', `${events.length} events`);
      indicatorContainer.appendChild(countIndicator);
    }

    cell.appendChild(indicatorContainer);
  }

  /**
   * Create event dot indicator
   * @param {Object} event
   * @returns {HTMLElement}
   */
  createEventDot(event) {
    const dot = document.createElement('div');
    dot.className = 'event-dot';
    dot.setAttribute('data-event-id', event.id);
    dot.setAttribute('aria-label', event.title);
    dot.style.backgroundColor = this.getEventColor(event.colorId);
    dot.title = event.title;
    
    // Add hover handler for tooltip
    dot.addEventListener('mouseenter', (e) => {
      this.showEventTooltip(e.target, event);
    });
    
    return dot;
  }

  /**
   * Show event details tooltip
   * @param {HTMLElement} element
   * @param {Object} event
   */
  showEventTooltip(element, event) {
    // Remove existing tooltip
    const existing = document.querySelector('.event-tooltip');
    if (existing) {
      existing.remove();
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'event-tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-title">${event.title}</div>
      ${event.location ? `<div class="tooltip-location">${event.location}</div>` : ''}
      <div class="tooltip-time">${this.formatEventTime(event)}</div>
    `;

    document.body.appendChild(tooltip);

    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;

    // Remove on mouse leave
    const removeTooltip = () => {
      tooltip.remove();
      element.removeEventListener('mouseleave', removeTooltip);
    };
    element.addEventListener('mouseleave', removeTooltip);
  }

  /**
   * Format event time for display
   * @param {Object} event
   * @returns {string}
   */
  formatEventTime(event) {
    if (event.isAllDay) {
      return 'All day';
    }
    const startTime = event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${startTime} - ${endTime}`;
  }

  /**
   * Get color for event based on colorId
   * @param {string} colorId
   * @returns {string} Hex color
   */
  getEventColor(colorId) {
    // Google Calendar color palette
    const colors = {
      '1': '#a4bdfc', // Lavender
      '2': '#7ae7bf', // Sage
      '3': '#dbadff', // Grape
      '4': '#ff887c', // Flamingo
      '5': '#fbd75b', // Banana
      '6': '#ffb878', // Tangerine
      '7': '#46d6db', // Peacock
      '8': '#e1e1e1', // Graphite
      '9': '#5484ed', // Blueberry
      '10': '#51b749', // Basil
      '11': '#dc2127'  // Tomato
    };
    return colors[colorId] || colors['1'];
  }

  /**
   * Get events for a specific date
   * @param {Date} date
   * @returns {Array<Object>}
   */
  getEventsForDate(date) {
    return window.EventParser.getEventsForDate(this.events, date);
  }
}

// Export as global
window.EventRenderer = EventRenderer;

