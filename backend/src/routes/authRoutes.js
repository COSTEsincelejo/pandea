const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('documento').notEmpty().withMessage('El documento es obligatorio'),
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
  authController.login
);

router.post(
  '/recover',
  [body('email').isEmail().withMessage('Email inválido')],
  authController.recover
);

router.get(
  '/reset-password/validate/:token',
  authController.validateResetToken
);

router.post(
  '/reset-password/:token',
  [
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  ],
  authController.resetPassword
);

module.exports = router;
