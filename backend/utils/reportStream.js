const fs = require('fs');
const zlib = require('zlib');
const { Readable } = require('stream');
const Product = require('../models/Product');
const Transport = require('../models/Transport');
const Warehouse = require('../models/Warehouse');
const Retail = require('../models/Retail');

// Create report as CSV stream and compress
const generateReportStream = async () => {
  const products = await Product.find().lean();
  const transports = await Transport.find().lean();
  const warehouses = await Warehouse.find().lean();
  const retails = await Retail.find().lean();

  const rows = [];
  rows.push('productId,product_name,farmer,quantity,quality');

  products.forEach(p => {
    rows.push(`${p._id},${p.product_name},${p.farmer},${p.quantity},${p.quality}`);
  });

  const source = Readable.from(rows.join('\n'));
  const gzip = zlib.createGzip();

  return source.pipe(gzip);   // stream + zlib
};

module.exports = { generateReportStream };
