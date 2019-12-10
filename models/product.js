var mongoose = require('mongoose');

module.exports = mongoose.model('Product', {
  name: { type: String, default: '' },
  category: mongoose.Schema.Types.ObjectId,
  brief: { type: String, default: '' },
  colors: [String],
  sizes: [String],
  quantity: mongoose.Schema.Types.Mixed,
  image: { type: String, data: Buffer },
  price: Number
});
