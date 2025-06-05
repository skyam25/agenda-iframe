const express = require('express');
const router = express.Router();
const zoomApi = require('../services/zoomApi');
const config = require('../config');
const { eventIdValidation, embedCodeValidation, handleValidationErrors } = require('../middleware/validation');

// API: Get event sessions
router.get('/sessions/:eventId',
  eventIdValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const sessions = await zoomApi.getEventSessions(eventId);
      res.json(sessions);
      
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      
      console.error(`❌ Sessions request failed for event ${req.params.eventId}:`, message);
      
      res.status(status).json({
        error: 'Failed to fetch sessions',
        message: message,
        eventId: req.params.eventId
      });
    }
  }
);

// API: Get event details
router.get('/events/:eventId',
  eventIdValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const data = await zoomApi.getEventDetails(eventId);
      res.json(data);
      
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      
      res.status(status).json({
        error: 'Failed to fetch event details',
        message: message,
        eventId: req.params.eventId
      });
    }
  }
);

// API: Get event speakers
router.get('/speakers/:eventId',
  eventIdValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const speakers = await zoomApi.getEventSpeakers(eventId);
      res.json(speakers);
      
    } catch (error) {
      const status = error.response?.status || 500;
      res.status(status).json({
        error: 'Failed to fetch speakers',
        message: error.response?.data?.message || error.message
      });
    }
  }
);

// Generate embed code
router.get('/embed-code',
  ...embedCodeValidation,
  handleValidationErrors,
  (req, res) => {
    const {
      eventId = config.zoom.defaultEventId,
      title = 'Event Agenda',
      theme = 'light',
      layout = 'list',
      width = '100%',
      height = '600',
      autoResize = 'true',
      showDate = 'false'
    } = req.query;

    if (!eventId) {
      return res.status(400).json({
        error: 'Missing eventId parameter'
      });
    }

    const widgetUrl = new URL('/agenda/', config.server.widgetDomain);
    widgetUrl.searchParams.set('eventId', eventId);
    widgetUrl.searchParams.set('apiBaseUrl', `${config.server.widgetDomain}/api`);
    widgetUrl.searchParams.set('title', title);
    widgetUrl.searchParams.set('theme', theme);
    widgetUrl.searchParams.set('layout', layout);
    widgetUrl.searchParams.set('autoResize', autoResize);
    widgetUrl.searchParams.set('showDate', showDate);

    const embedCode = `<iframe 
  src="${widgetUrl.toString()}"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border: none; overflow: hidden;"
  title="${title}">
</iframe>`;

    const responsiveEmbedCode = `<div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;">
  <iframe 
    src="${widgetUrl.toString()}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    frameborder="0"
    title="${title}">
  </iframe>
</div>`;

    res.json({
      widgetUrl: widgetUrl.toString(),
      embedCode,
      responsiveEmbedCode,
      configuration: {
        eventId,
        title,
        theme,
        layout,
        width,
        height,
        autoResize,
        showDate
      }
    });
  }
);

// Widget configuration endpoint
router.get('/widget-config', async (req, res) => {
  try {
    const cacheStats = await zoomApi.getCacheStats();
    res.json({
      domain: config.server.widgetDomain,
      defaultEventId: config.zoom.defaultEventId,
      apiEndpoint: `${config.server.widgetDomain}/api`,
      availableThemes: ['light', 'dark', 'minimal'],
      availableLayouts: ['list', 'grid', 'compact'],
      supportedParams: [
        'eventId', 'title', 'theme', 'layout', 'width', 'height', 'autoResize',
        'disableHover', 'showSpeakers', 'showDate', 'customBg', 'customText', 'customCard'
      ],
      cacheInfo: cacheStats
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get widget configuration',
      message: error.message
    });
  }
});

module.exports = router;