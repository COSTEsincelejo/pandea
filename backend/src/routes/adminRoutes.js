const express = require('express');
const { body, param, validationResult } = require('express-validator');
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAdmin);

// Usuarios
router.get('/users', adminController.getUsers);
router.delete('/users/:id', [param('id').isInt().withMessage('ID inválido')], adminController.deleteUser);
router.put('/users/:id/role', [param('id').isInt().withMessage('ID inválido'), body('rol').isIn(['admin', 'cliente']).withMessage('Rol inválido')], adminController.changeUserRole);

// Productos
router.get('/products', adminController.getProducts);
router.post('/products', [
  body('nombre').notEmpty(),
  // body('categoria').notEmpty(),
  body('precio').isFloat({ gt: 0 }),
], adminController.createProduct);
router.put('/products/:id', [param('id').isInt().withMessage('ID inválido')], adminController.updateProduct);
router.delete('/products/:id', [param('id').isInt().withMessage('ID inválido')], adminController.deleteProduct);

// Pedidos
router.get('/orders', adminController.getOrders);
router.put('/orders/:id', [param('id').isInt().withMessage('ID inválido'), body('estado').isString().notEmpty()], adminController.updateOrderStatus);
router.delete('/orders/:id', [param('id').isInt().withMessage('ID inválido')], adminController.deleteOrder);

// Cupones
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', [
  body('codigo').notEmpty(),
  body('tipo').isIn(['percent', 'fixed']),
  body('valor').isFloat({ gt: 0 }),
], adminController.createCoupon);
router.put('/coupons/:id', [param('id').isInt().withMessage('ID inválido')], adminController.updateCoupon);
router.delete('/coupons/:id', [param('id').isInt().withMessage('ID inválido')], adminController.deleteCoupon);

// Stats & actividad
router.get('/stats', adminController.getStats);
router.get('/activity', adminController.getActivity);

module.exports = router;
