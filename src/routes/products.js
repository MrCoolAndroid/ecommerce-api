const express = require('express');
const router = express.Router();
const { getProducts, createProduct, validateProduct, updateProduct, deleteProduct } = require('../controllers/productsController');
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get('/', authMiddleware, roleMiddleware("admin"), getProducts);
router.post('/', authMiddleware, roleMiddleware("admin"), validateProduct, createProduct);
router.put('/:id', authMiddleware, roleMiddleware("admin"), validateProduct, updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware("admin"), deleteProduct);

module.exports = router;