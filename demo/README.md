# Widget Demo Interface

Development interface for testing widget configurations and previewing different themes/layouts.

## Quick Start

### 1. Start Widget Service
```bash
cd zoom-agenda-iframe
npm install
npm start               # Port 3004
```

### 2. Open Demo Interface
Visit: `http://localhost:3004/demo/`

## Configuration

Update `config.js` with your event ID:
```javascript
window.EMBED_CONFIG = {
    defaultEventId: 'your_event_id',
    defaults: {
        title: 'Your Event Agenda',
        theme: 'light',
        layout: 'list'
    }
};
```

## Features

### Real-time Preview
- Live event sessions display
- Instant updates on configuration changes
- Actual session data with speakers

### Interactive Controls
- **Themes**: Light, Dark, Minimal, Custom with full color customization
- **Layouts**: List (default stack), Grid (responsive columns), Compact (tight spacing)
- **Dimensions**: Width/height with live preview updates
- **Color Pickers**: Full customization for background, cards, text colors
- **Behavior Options**: Auto-resize, hover effects, speaker display with avatars
- **Debug Mode**: Enable console logging for development and troubleshooting

### Demo Code Generation
- **Basic**: Fixed-size iframe examples
- **Responsive**: Scales with container examples
- **Advanced**: JavaScript with auto-resize examples
- Copy sample embed codes

## Sample Embed Codes

### Basic Embed
```html
<iframe 
  src="https://widgets.zoom.us/agenda/?eventId=your_event_id&theme=light&layout=list&disableHover=true&showSpeakers=true"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none;">
</iframe>
```

### Responsive Embed
```html
<div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;">
  <iframe 
    src="https://widgets.zoom.us/agenda/?eventId=your_event_id&theme=light"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;">
  </iframe>
</div>
```

## File Structure
```
demo/
├── index.html    # Demo interface
├── config.js     # Demo configuration
└── README.md     # This guide
```

## Key Features
- No page refresh needed
- All controls functional
- Error handling included
- Mobile-friendly interface
- Sample embed codes for testing and documentation