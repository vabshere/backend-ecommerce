var mongoose = require('mongoose');

module.exports = mongoose.model('Seller', {
  name: { type: String, default: '' },
  phone: { type: Number, default: '' },
  address: { type: String, default: '' },
  email: { type: String, default: '' },
  gstin: { type: String, default: '' },
  pan: { type: String, default: '' },
  product_category: { type: String, default: '' },
  attr1: { type: String, default: '' },
  attr2: { type: String, default: '' },
  attr3: { type: String, default: '' },
  gst_img: { type: String, data: Buffer },
  pan_img: { type: String, data: Buffer }
});
