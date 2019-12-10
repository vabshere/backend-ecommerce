var mongoose = require('mongoose');

module.exports = mongoose.model('ProductCategory', {
  name: { type: String, default: '' },
  brief: { type: String, default: '' },
  image: { type: String, data: Buffer }
});
