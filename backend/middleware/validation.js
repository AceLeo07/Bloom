import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
      code: 'VALIDATION_ERROR'
    });
  }
  next();
};

export const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors
];

export const validateSignin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateHabitAnswer = [
  body('questionId')
    .isIn(['mood', 'food', 'hydration', 'sleep'])
    .withMessage('Invalid question ID'),
  body('answer')
    .isBoolean()
    .withMessage('Answer must be true or false'),
  handleValidationErrors
];

export const validateTreeUpdate = [
  body('health')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Health must be between 0 and 100'),
  body('stage')
    .optional()
    .isIn(['seed', 'sapling', 'bloom', 'decay'])
    .withMessage('Invalid stage'),
  body('day')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Day must be between 1 and 7'),
  handleValidationErrors
];
