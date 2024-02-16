const mongoose = require('mongoose');

const productOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',  
    required: false,
  },
  tax: {
    type: Number,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  unite: {
    type: String,
    required: false,
  },
  promoPercentage: {
    type: Number,
    default: 0,
    required: false, // Ajoutez cette ligne pour spécifier que le champ est facultatif

  },
  image: {
    type: String, // Assuming the image will be stored as a file path or URL
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  optionGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OptionGroup',
  }],
});

const ProductOption = mongoose.model('ProductOption', productOptionSchema);

module.exports = ProductOption;
