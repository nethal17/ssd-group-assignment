import ProductListing from '../models/ProductListing.js';
import exceljs from 'exceljs';

// Helper function to get approved listings
const getApprovedListings = async () => {
  return await ProductListing.find({ status: 'Approved' });
};

// 1. Inventory List (Approved products only)
export const getInventoryList = async (req, res) => {
  try {
    const listings = await getApprovedListings();
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory list.' });
  }
};

// 2. Inventory Valuation (detailed) - Approved products only
export const getInventoryValuation = async (req, res) => {
  try {
    const listings = await getApprovedListings();
    
    if (listings.length === 0) {
      return res.json({
        totalValue: 0,
        totalItems: 0,
        totalQuantity: 0,
        avgPrice: 0,
        mostValuable: null,
        soonestToExpire: null,
        message: 'No approved products found'
      });
    }

    const totalValue = listings.reduce((sum, prod) => sum + (prod.quantity * prod.price), 0);
    const totalItems = listings.length;
    const totalQuantity = listings.reduce((sum, prod) => sum + prod.quantity, 0);
    const avgPrice = totalItems > 0 ? (listings.reduce((sum, prod) => sum + prod.price, 0) / totalItems) : 0;
    const mostValuable = listings.reduce((max, prod) => 
      (prod.quantity * prod.price > (max?.quantity || 0) * (max?.price || 0)) ? prod : max
    );
    const soonestToExpire = listings.filter(l => l.expireDate)
      .sort((a, b) => new Date(a.expireDate) - new Date(b.expireDate))[0] || null;
    
    res.json({
      totalValue,
      totalItems,
      totalQuantity,
      avgPrice,
      mostValuable,
      soonestToExpire
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate inventory valuation.' });
  }
};

// 3. Export Approved Inventory as Excel
export const exportInventoryExcel = async (req, res) => {
  try {
    const listings = await getApprovedListings();
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Inventory');
    
    worksheet.columns = [
      { header: 'Waste Category', key: 'wasteCategory', width: 15 },
      { header: 'Waste Type', key: 'wasteType', width: 20 },
      { header: 'Waste Item', key: 'wasteItem', width: 20 },
      { header: 'Province', key: 'province', width: 15 },
      { header: 'District', key: 'district', width: 15 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Price', key: 'price', width: 10 },
      { header: 'Description', key: 'description', width: 25 },
      { header: 'Expire Date', key: 'expireDate', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Farmer ID', key: 'farmerId', width: 24 },
      { header: 'Bank Name', key: 'bankName', width: 15 },
      { header: 'Account Number', key: 'accountNumber', width: 18 },
      { header: 'Account Holder Name', key: 'accountHolderName', width: 20 },
      { header: 'Branch', key: 'branch', width: 15 },
    ];
    
    listings.forEach(listing => {
      worksheet.addRow({
        ...listing._doc,
        expireDate: listing.expireDate ? listing.expireDate.toISOString().slice(0, 10) : ''
      });
    });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=approved_inventory.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to export inventory as Excel.' });
  }
};

// 4. Export Approved Inventory as CSV
export const exportInventoryCSV = async (req, res) => {
  try {
    const listings = await getApprovedListings();
    const headers = [
      'Waste Category','Waste Type','Waste Item','Province','District','City',
      'Quantity','Price','Description','Expire Date','Status','Farmer ID',
      'Bank Name','Account Number','Account Holder Name','Branch'
    ];
    
    const rows = listings.map(l => [
      l.wasteCategory, l.wasteType, l.wasteItem, l.province, l.district, l.city, 
      l.quantity, l.price, l.description, 
      l.expireDate ? l.expireDate.toISOString().slice(0, 10) : '', 
      l.status, l.farmerId, l.bankName, l.accountNumber, l.accountHolderName, l.branch
    ]);
    
    let csv = headers.join(',') + '\n';
    csv += rows.map(r => r.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=approved_inventory.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export inventory as CSV.' });
  }
};

// 5. Export Approved Inventory as PDF
export const exportInventoryPDF = async (req, res) => {
  try {
    const listings = await getApprovedListings();
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({ margin: 20, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=approved_inventory.pdf');
    doc.pipe(res);
    
    doc.fontSize(18).text('Approved Inventory Report', { align: 'center' });
    doc.moveDown();
    
    if (listings.length === 0) {
      doc.fontSize(12).text('No approved products found.', { align: 'center' });
      doc.end();
      return;
    }
    
    const headers = ['Waste Category','Waste Type','Waste Item','Province','District',
                    'City','Quantity','Price','Expire Date','Status'];
    doc.fontSize(12);
    doc.text(headers.join(' | '));
    doc.moveDown(0.5);
    
    listings.forEach(l => {
      doc.text([
        l.wasteCategory, l.wasteType, l.wasteItem, l.province, l.district, l.city, 
        l.quantity, l.price, l.expireDate ? l.expireDate.toISOString().slice(0, 10) : '', 
        l.status
      ].join(' | '));
    });
    
    doc.end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to export inventory as PDF.' });
  }
};