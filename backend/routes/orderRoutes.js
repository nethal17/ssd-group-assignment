import express from 'express';
import { addOrder, getOrdersByUserId, getOrderIdByUserId} from '../controllers/orderController.js';

const router = express.Router();

// Add a new order
router.post('/add', addOrder);

// Get all orders for a specific user
router.get('/userOrder/:userId', getOrdersByUserId);

router.get('/orderId/:userId', getOrderIdByUserId);

export default router;