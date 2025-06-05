const { body, param, query, validationResult } = require('express-validator');

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Invalid input parameters',
      details: errors.array()
    });
  }
  next();
};

// Common validation rules
const eventIdValidation = param('eventId')
  .isString()
  .isLength({ min: 1, max: 50 })
  .matches(/^[a-zA-Z0-9_-]+$/)
  .withMessage('EventId must be alphanumeric with underscores/hyphens only');

const embedCodeValidation = [
  query('eventId')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('EventId must be alphanumeric with underscores/hyphens only'),
  query('title')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .escape()
    .withMessage('Title must be 1-100 characters'),
  query('theme')
    .optional()
    .isIn(['light', 'dark', 'minimal'])
    .withMessage('Theme must be light, dark, or minimal'),
  query('layout')
    .optional()
    .isIn(['list', 'grid', 'compact', 'timeline'])
    .withMessage('Layout must be list, grid, compact, or timeline'),
  query('width')
    .optional()
    .matches(/^\d+(%|px)?$/)
    .withMessage('Width must be a number with optional % or px suffix'),
  query('height')
    .optional()
    .isInt({ min: 100, max: 2000 })
    .withMessage('Height must be between 100 and 2000 pixels'),
  query('autoResize')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('autoResize must be true or false')
];

module.exports = {
  handleValidationErrors,
  eventIdValidation,
  embedCodeValidation
};