/**
 * Iframe Embed Generator Configuration
 * 
 * Configure default values for the embed generator.
 * This file is loaded by the embed generator HTML page.
 */

window.EMBED_CONFIG = {
    // Widget server (where this iframe server is hosted)
    serverBase: window.location.origin || 'http://localhost:3004',
    
    // API server (working Zoom Events API server)
    apiServerBase: 'http://localhost:3004',
    
    // Default Event ID for quick testing - replace with your own Zoom Event ID
    defaultEventId: 'YOUR_EVENT_ID_HERE',  // Replace with your Zoom Event ID
    
    // Default widget configuration
    defaults: {
        title: 'Event Agenda',
        theme: 'light',
        layout: 'list',
        width: '100%',
        height: '600',
        autoResize: true
    },
    
    // Enable debug mode in preview (set to false to fetch real data)
    debugMode: false,
    
    // Force reload timestamp
    _timestamp: Date.now()
};