class ZoomAgendaWidget {
    constructor() {
        this.config = this.parseURLParams();
        this.sessions = [];
        this.eventDetails = null;
        this.loading = true;
        this.error = null;
        
        this.init();
    }
    
    parseURLParams() {
        const params = new URLSearchParams(window.location.search);
        
        return {
            // API Configuration
            apiBaseUrl: params.get('apiBaseUrl') || params.get('api') || null,
            eventId: params.get('eventId') || params.get('event') || null,
            
            // Content Configuration
            title: params.get('title') || 'Event Agenda',
            
            // Layout Configuration
            layout: params.get('layout') || 'list', // list, grid, compact
            maxWidth: params.get('maxWidth') || '1200px',
            
            // Styling Configuration
            theme: params.get('theme') || 'light', // light, dark, custom
            bgColor: params.get('bgColor') || params.get('bg'),
            cardBg: params.get('cardBg') || params.get('cardBackground'),
            titleColor: params.get('titleColor'),
            sessionNameColor: params.get('sessionNameColor'),
            timeColor: params.get('timeColor'),
            descColor: params.get('descColor') || params.get('descriptionColor'),
            speakerColor: params.get('speakerColor'),
            dateColor: params.get('dateColor'),
            
            // Advanced Styling
            cardRadius: params.get('cardRadius') || params.get('borderRadius'),
            cardShadow: params.get('cardShadow'),
            cardPadding: params.get('cardPadding'),
            titleAlign: params.get('titleAlign') || 'left',
            
            // Behavior Configuration
            autoResize: params.get('autoResize') !== 'false',
            disableHover: params.get('disableHover') === 'true',
            showSpeakers: params.get('showSpeakers') === 'true',
            showDate: params.get('showDate') === 'true',
            refreshInterval: params.get('refreshInterval') ? parseInt(params.get('refreshInterval')) : null,
            
            // Debug Configuration
            debug: params.get('debug') === 'true'
        };
    }
    
    init() {
        this.applyConfiguration();
        this.setupEventListeners();
        
        // Apply layout configuration on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applyLayoutConfiguration());
        } else {
            this.applyLayoutConfiguration();
        }
        
        if (this.config.eventId && this.config.apiBaseUrl) {
            this.fetchData();
        } else if (this.config.debug) {
            this.loadSampleData();
        } else {
            this.showError('Missing required parameters: eventId and apiBaseUrl');
        }
        
        if (this.config.refreshInterval) {
            setInterval(() => this.fetchData(), this.config.refreshInterval * 1000);
        }
    }
    
    applyConfiguration() {
        const root = document.documentElement;
        
        // Apply CSS custom properties based on configuration
        if (this.config.bgColor) root.style.setProperty('--bg-color', this.config.bgColor);
        if (this.config.cardBg) root.style.setProperty('--card-bg', this.config.cardBg);
        if (this.config.titleColor) root.style.setProperty('--title-color', this.config.titleColor);
        if (this.config.sessionNameColor) root.style.setProperty('--session-name-color', this.config.sessionNameColor);
        if (this.config.timeColor) root.style.setProperty('--time-color', this.config.timeColor);
        if (this.config.descColor) root.style.setProperty('--desc-color', this.config.descColor);
        if (this.config.speakerColor) root.style.setProperty('--speaker-color', this.config.speakerColor);
        if (this.config.dateColor) root.style.setProperty('--date-color', this.config.dateColor);
        if (this.config.cardRadius) root.style.setProperty('--card-radius', this.config.cardRadius);
        if (this.config.cardShadow) root.style.setProperty('--card-shadow', this.config.cardShadow);
        if (this.config.cardPadding) root.style.setProperty('--card-padding', this.config.cardPadding);
        if (this.config.maxWidth) root.style.setProperty('--max-width', this.config.maxWidth);
        if (this.config.titleAlign) root.style.setProperty('--title-align', this.config.titleAlign);
        
        // Apply layout configuration
        const agendaContainer = document.querySelector('.agenda-container');
        if (agendaContainer) {
            // Remove existing layout classes
            agendaContainer.classList.remove('grid-layout', 'list-layout', 'compact-layout');
            
            // Add the appropriate layout class
            if (this.config.layout === 'grid') {
                agendaContainer.classList.add('grid-layout');
            } else if (this.config.layout === 'compact') {
                agendaContainer.classList.add('compact-layout');
            } else {
                agendaContainer.classList.add('list-layout');
            }
        }
        
        // Handle hover behavior
        if (this.config.disableHover) {
            root.style.setProperty('--card-hover-shadow', 'var(--card-shadow, 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06))');
            root.style.setProperty('--card-hover-transform', 'none');
            root.style.setProperty('--card-transition', 'none');
        }
        
        // Apply theme presets
        if (this.config.theme === 'dark') {
            this.applyDarkTheme();
        } else if (this.config.theme === 'minimal') {
            this.applyMinimalTheme();
        }
        
        // Apply layout classes
        if (this.config.layout === 'compact') {
            document.body.classList.add('compact');
        } else if (this.config.layout === 'grid') {
            document.body.classList.add('grid-layout');
        }
        
        // Set title
        document.getElementById('agenda-title').textContent = this.config.title;
        document.title = this.config.title;
    }
    
    applyDarkTheme() {
        const root = document.documentElement;
        root.style.setProperty('--bg-color', '#1e293b');
        root.style.setProperty('--card-bg', '#334155');
        root.style.setProperty('--title-color', '#f1f5f9');
        root.style.setProperty('--session-name-color', '#e2e8f0');
        root.style.setProperty('--time-color', '#94a3b8');
        root.style.setProperty('--desc-color', '#cbd5e1');
        root.style.setProperty('--speaker-color', '#cbd5e1');
        root.style.setProperty('--date-color', '#94a3b8');
        root.style.setProperty('--speaker-avatar-bg', '#475569');
        root.style.setProperty('--speaker-avatar-border', '#64748b');
        root.style.setProperty('--speakers-label-color', '#94a3b8');
        root.style.setProperty('--empty-color', '#94a3b8');
    }
    
    applyMinimalTheme() {
        const root = document.documentElement;
        root.style.setProperty('--card-bg', 'transparent');
        root.style.setProperty('--card-shadow', 'none');
        root.style.setProperty('--card-border', '1px solid #e5e7eb');
        root.style.setProperty('--card-padding', '1rem');
        root.style.setProperty('--speaker-avatar-border', '#d1d5db');
    }
    
    setupEventListeners() {
        // Listen for messages from parent window
        window.addEventListener('message', (event) => {
            if (event.data.type === 'updateConfig') {
                Object.assign(this.config, event.data.config);
                this.applyConfiguration();
            } else if (event.data.type === 'setSessions') {
                this.setSessions(event.data.sessions);
            } else if (event.data.type === 'refresh') {
                this.fetchData();
            }
        });
        
        // Auto-resize functionality
        if (this.config.autoResize) {
            this.setupAutoResize();
        }
    }
    
    setupAutoResize() {
        const resizeObserver = new ResizeObserver(() => {
            this.notifyParentOfResize();
        });
        
        resizeObserver.observe(document.body);
        
        // Initial size notification
        setTimeout(() => this.notifyParentOfResize(), 100);
    }
    
    notifyParentOfResize() {
        const height = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        
        window.parent.postMessage({
            type: 'resize',
            height: height,
            width: document.body.scrollWidth
        }, '*');
    }
    
    async fetchData() {
        this.setLoading(true);
        
        try {
            // Always fetch sessions
            const sessionsPromise = this.fetchSessions();
            
            // Fetch event details if showDate is enabled
            let eventDetailsPromise = Promise.resolve(null);
            if (this.config.showDate) {
                eventDetailsPromise = this.fetchEventDetails();
            }
            
            const [, eventDetails] = await Promise.all([sessionsPromise, eventDetailsPromise]);
            
            if (eventDetails) {
                this.eventDetails = eventDetails;
                this.displayEventDate();
            }
            
        } catch (error) {
            console.error('Failed to fetch data:', error);
            this.showError(`Failed to load data: ${error.message}`);
        }
    }
    
    async fetchSessions() {
        this.setLoading(true);
        
        try {
            const url = `${this.config.apiBaseUrl}/sessions/${this.config.eventId}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            const sessions = Array.isArray(data) ? data : (data.sessions || data.data || []);
            
            this.setSessions(sessions);
            
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
            this.showError(`Failed to load sessions: ${error.message}`);
        }
    }
    
    async fetchEventDetails() {
        try {
            const url = `${this.config.apiBaseUrl}/events/${this.config.eventId}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const eventDetails = await response.json();
            return eventDetails;
            
        } catch (error) {
            console.error('Failed to fetch event details:', error);
            throw error;
        }
    }
    
    setSessions(sessions) {
        this.sessions = sessions || [];
        this.loading = false;
        this.error = null;
        this.render();
        
        // Notify parent of successful load
        window.parent.postMessage({
            type: 'sessionsLoaded',
            count: this.sessions.length
        }, '*');
    }
    
    setLoading(loading) {
        this.loading = loading;
        if (loading) {
            this.error = null;
            this.render();
        }
    }
    
    showError(message) {
        this.loading = false;
        this.error = message;
        this.render();
        
        // Notify parent of error
        window.parent.postMessage({
            type: 'error',
            message: message
        }, '*');
    }
    
    displayEventDate() {
        const dateElement = document.getElementById('event-date');
        if (!dateElement || !this.eventDetails) return;
        
        try {
            // Check for different possible date fields from Zoom API
            const startTime = this.eventDetails.start_time || this.eventDetails.start_date;
            const endTime = this.eventDetails.end_time || this.eventDetails.end_date;
            
            if (startTime) {
                const startDate = new Date(startTime);
                let dateText = this.formatEventDate(startDate);
                
                // If there's an end date and it's different from start date
                if (endTime) {
                    const endDate = new Date(endTime);
                    if (startDate.toDateString() !== endDate.toDateString()) {
                        dateText += ` - ${this.formatEventDate(endDate)}`;
                    }
                }
                
                dateElement.textContent = dateText;
                dateElement.style.display = 'block';
            }
        } catch (error) {
            console.error('Error displaying event date:', error);
        }
    }
    
    formatEventDate(date) {
        try {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return date.toString();
        }
    }
    
    formatTime(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            return dateString;
        }
    }
    
    applyLayoutConfiguration() {
        const agendaContainer = document.querySelector('.agenda-container');
        if (agendaContainer) {
            // Remove existing layout classes
            agendaContainer.classList.remove('grid-layout', 'list-layout', 'compact-layout');
            
            // Add the appropriate layout class
            if (this.config.layout === 'grid') {
                agendaContainer.classList.add('grid-layout');
            } else if (this.config.layout === 'compact') {
                agendaContainer.classList.add('compact-layout');
            } else {
                agendaContainer.classList.add('list-layout');
            }
            
            if (this.config.debug) {
                console.log(`Applied layout: ${this.config.layout}`, agendaContainer.className);
            }
        } else if (this.config.debug) {
            console.warn('Could not find .agenda-container element');
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    async generateHash(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text.toLowerCase().trim());
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    getGravatarUrl(email, fallbackName) {
        if (!email || email.trim() === '') {
            return this.getInitialsAvatar(fallbackName);
        }
        
        // Create a simple hash for demo purposes (not MD5, but works for fallback)
        const emailHash = btoa(email.toLowerCase().trim()).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        return `https://www.gravatar.com/avatar/${emailHash}?s=40&d=mp&r=g`;
    }
    
    getInitialsAvatar(name) {
        if (!name) return this.getDefaultAvatar();
        
        const initials = name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
        
        // Generate a consistent color based on name
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        
        // Create SVG avatar with initials
        const svg = `
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="hsl(${hue}, 70%, 60%)"/>
                <text x="20" y="26" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-size="14" font-weight="500">
                    ${initials}
                </text>
            </svg>
        `;
        
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
    
    getDefaultAvatar() {
        const svg = `
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="#9ca3af"/>
                <path d="M20 18a4 4 0 100-8 4 4 0 000 8zm-8 14c0-4.418 3.582-8 8-8s8 3.582 8 8" fill="white" opacity="0.8"/>
            </svg>
        `;
        
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
    
    render() {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const emptyState = document.getElementById('empty-state');
        const sessionsGrid = document.getElementById('sessions-grid');
        
        // Hide all states first
        loadingState.style.display = 'none';
        errorState.style.display = 'none';
        emptyState.style.display = 'none';
        sessionsGrid.style.display = 'none';

        if (this.loading) {
            loadingState.style.display = 'block';
        } else if (this.error) {
            document.getElementById('error-message').textContent = this.error;
            errorState.style.display = 'block';
        } else if (this.sessions.length === 0) {
            emptyState.style.display = 'block';
        } else {
            sessionsGrid.style.display = 'block';
            
            // Re-apply layout configuration after each render
            this.applyLayoutConfiguration();
            
            // Force layout application with debug info
            if (this.config.debug) {
                console.log('Sessions grid classes:', sessionsGrid.className);
                console.log('Container classes:', document.querySelector('.agenda-container')?.className);
                console.log('Layout config:', this.config.layout);
            }
            
            sessionsGrid.innerHTML = this.sessions.map(session => `
                <div class="session-card">
                    <div class="session-header">
                        <h3 class="session-name">${this.escapeHtml(session.name || '')}</h3>
                        ${session.start_time && session.end_time ? `
                            <div class="session-time">
                                ${this.formatTime(session.start_time)} - ${this.formatTime(session.end_time)}
                            </div>
                        ` : ''}
                    </div>
                    
                    ${session.description ? `
                        <p class="session-description">${this.escapeHtml(session.description)}</p>
                    ` : ''}
                    
                    ${this.config.showSpeakers && session.session_speakers && session.session_speakers.length > 0 ? `
                        <div class="speakers-section">
                            <span class="speakers-label">Speakers:</span>
                            <div class="speakers-list">
                                ${session.session_speakers.map(speaker => `
                                    <div class="speaker-item">
                                        <div class="speaker-avatar">
                                            <img src="${this.getGravatarUrl(speaker.email || '', speaker.name)}" 
                                                 alt="${this.escapeHtml(speaker.name)}"
                                                 class="speaker-photo"
                                                 onerror="this.src='${this.getInitialsAvatar(speaker.name)}'">
                                        </div>
                                        <span class="speaker-info">
                                            <span class="speaker-name">${this.escapeHtml(speaker.name)}</span>
                                        </span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }
        
        // Trigger resize after rendering
        if (this.config.autoResize) {
            setTimeout(() => this.notifyParentOfResize(), 50);
        }
    }
    
    loadSampleData() {
        // No sample data - must use API
        this.showError('Debug mode: No API configuration provided. Please specify eventId and apiBaseUrl parameters.');
    }
}

// Initialize widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.agendaWidget = new ZoomAgendaWidget();
});
