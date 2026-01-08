// DateUtils and EventRenderer loaded from manifest

/**
 * Full-year view renderer
 */
class FullYearView {
  constructor(container) {
    this.container = container;
    this.currentYear = new Date().getFullYear();
    this.eventRenderer = new window.EventRenderer();
  }

  /**
   * Set events and re-render
   * @param {Array<Object>} events
   */
  setEvents(events) {
    this.eventRenderer.setEvents(events);
    this.render();
  }

  /**
   * Render full-year view
   */
  render() {
    console.log('[FullYearView] Starting render...');
    console.log('[FullYearView] Container:', this.container);
    this.container.innerHTML = '';
    
    const grid = document.createElement('div');
    grid.className = 'full-year-grid';
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', `Full year view for ${this.currentYear}`);
    console.log('[FullYearView] Grid element created');

    // Create header
    const header = this.createHeader();
    grid.appendChild(header);

    // Create month rows
    const months = window.DateUtils.getMonthsForYear(this.currentYear);
    months.forEach(month => {
      const row = this.createMonthRow(month);
      grid.appendChild(row);
    });

    this.container.appendChild(grid);
    console.log('[FullYearView] Grid appended to container');
    console.log('[FullYearView] Container innerHTML length:', this.container.innerHTML.length);
    
    // Verify container is visible
    const containerStyle = window.getComputedStyle(this.container);
    console.log('[FullYearView] Container visibility check:', {
      display: containerStyle.display,
      visibility: containerStyle.visibility,
      opacity: containerStyle.opacity,
      width: containerStyle.width,
      height: containerStyle.height,
      position: containerStyle.position
    });
    
    // Verify grid is visible
    const gridStyle = window.getComputedStyle(grid);
    console.log('[FullYearView] Grid visibility check:', {
      display: gridStyle.display,
      visibility: gridStyle.visibility,
      width: gridStyle.width,
      height: gridStyle.height
    });
    
    // Render events after grid is created
    setTimeout(() => {
      console.log('[FullYearView] Rendering events...');
      this.eventRenderer.renderEvents();
    }, 0);
  }

  /**
   * Create header row
   * @returns {HTMLElement}
   */
  createHeader() {
    const header = document.createElement('div');
    header.className = 'full-year-header';
    
    const title = document.createElement('div');
    title.className = 'full-year-title';
    title.textContent = 'YEARLY PLANNER';
    
    const year = document.createElement('div');
    year.className = 'full-year-year';
    year.textContent = this.currentYear.toString();
    
    header.appendChild(title);
    header.appendChild(year);
    return header;
  }

  /**
   * Create month row
   * @param {Date} monthDate
   * @returns {HTMLElement}
   */
  createMonthRow(monthDate) {
    const row = document.createElement('div');
    row.className = 'month-row';
    row.setAttribute('role', 'row');
    row.setAttribute('aria-label', `Month: ${window.DateUtils.getMonthAbbreviation(monthDate)}`);

    // Month label
    const monthLabel = document.createElement('div');
    monthLabel.className = 'month-label';
    monthLabel.textContent = window.DateUtils.getMonthAbbreviation(monthDate);
    monthLabel.setAttribute('role', 'rowheader');
    row.appendChild(monthLabel);

    // Day cells (1-31)
    const days = window.DateUtils.getDaysInMonth(monthDate);
    for (let day = 1; day <= 31; day++) {
      const cell = this.createDayCell(day, days.find(d => d.dayOfMonth === day));
      row.appendChild(cell);
    }

    return row;
  }

  /**
   * Create day cell
   * @param {number} dayNumber
   * @param {Object|null} dayData
   * @returns {HTMLElement}
   */
  createDayCell(dayNumber, dayData) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    cell.setAttribute('role', 'gridcell');
    
    if (dayData) {
      cell.setAttribute('data-date', dayData.date.toISOString());
      cell.setAttribute('aria-label', `Day ${dayNumber}, ${dayData.dayOfWeek}`);
      
      if (dayData.isWeekend) {
        if (window.DateUtils.isSaturday(dayData.date)) {
          cell.classList.add('saturday');
        } else if (window.DateUtils.isSunday(dayData.date)) {
          cell.classList.add('sunday');
        }
      } else {
        cell.classList.add('weekday');
      }

      const dayNumberEl = document.createElement('div');
      dayNumberEl.className = 'day-number';
      dayNumberEl.textContent = dayNumber;

      const dayOfWeekEl = document.createElement('div');
      dayOfWeekEl.className = 'day-of-week';
      dayOfWeekEl.textContent = dayData.dayOfWeek;

      cell.appendChild(dayNumberEl);
      cell.appendChild(dayOfWeekEl);

      // Add click handler
      cell.addEventListener('click', () => {
        this.handleDayClick(dayData.date);
      });
    } else {
      // Empty cell for months with fewer than 31 days
      cell.classList.add('empty');
      cell.setAttribute('aria-hidden', 'true');
    }

    return cell;
  }

  /**
   * Handle day cell click
   * @param {Date} date
   */
  handleDayClick(date) {
    const events = this.eventRenderer.getEventsForDate(date);
    
    if (events.length === 0) {
      // Future: Open create event dialog
      console.log('No events, would open create dialog');
    } else {
      // Show event list
      this.showEventList(date, events);
    }
  }

  /**
   * Show event list for a day
   * @param {Date} date
   * @param {Array<Object>} events
   */
  showEventList(date, events) {
    // Create modal or sidebar
    const modal = document.createElement('div');
    modal.className = 'event-list-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${date.toLocaleDateString()}</h2>
          <button class="modal-close" aria-label="Close">×</button>
        </div>
        <div class="modal-body">
          ${events.map(event => `
            <div class="event-item">
              <div class="event-title">${event.title}</div>
              <div class="event-time">${this.formatEventTime(event)}</div>
              ${event.location ? `<div class="event-location">${event.location}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close handler
    const closeModal = () => {
      modal.remove();
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Escape key handler
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
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
}

// Export as global
window.FullYearView = FullYearView;

