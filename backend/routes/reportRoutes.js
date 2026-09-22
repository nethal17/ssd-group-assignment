// backend/routes/reportRoutes.js
import express from 'express';
import { getInventoryList, getInventoryValuation, exportInventoryExcel, exportInventoryCSV, exportInventoryPDF } from '../controllers/reportController.js';

const router = express.Router();

router.get('/inventory-list', getInventoryList);
router.get('/inventory-valuation', getInventoryValuation);
router.get('/export-excel', exportInventoryExcel);
router.get('/export-csv', exportInventoryCSV);
router.get('/export-pdf', exportInventoryPDF);

export default router;
