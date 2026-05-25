const express = require('express');
const { body, validationResult } = require('express-validator');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', requireAuth, userController.getProfile);
router.put(
  '/me',
  requireAuth,
  [
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('apellido').optional().notEmpty().withMessage('El apellido no puede estar vacío'),
  ],
  userController.updateProfile
);
router.get('/me/orders', requireAuth, userController.getMyOrders);

module.exports = router;
