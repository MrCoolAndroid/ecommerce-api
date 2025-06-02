const express = require('express');
const router = express.Router();
const { getOrders, validateOrder, createOrder, updateOrder } = require('../controllers/ordersController');
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get('/', authMiddleware, getOrders);
router.post('/', authMiddleware, validateOrder, createOrder);
router.put('/:id', authMiddleware, roleMiddleware("admin"), validateOrder, updateOrder);

module.exports = router;