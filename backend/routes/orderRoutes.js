const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/getorders-list', orderController.getOrdersList);
router.get('/dashboard-data', orderController.getDashboardData);

module.exports = router;