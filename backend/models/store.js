const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: true,
  },
  longitude: {
    type: Number,
    required: false,
  },
  latitude: {
    type: Number,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  rangeValue: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "suspended", "pending", "rejected"],
    default: "pending",
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  acceptedCurrencies: [
    {
      type: String,
      required: false,
    },
  ],
  banners: {
    type: String,
  },
  logo: {
    type: String,
  },
  consumationModes: [
    {
      mode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ConsumationMode", // You need to define this model
        required: true,
      },
      enabled: {
        type: Boolean,
        default: false, // Set to true if you want it to be enabled by default
      },
    },
  ],
  primairecolor: {
    type: String,
    required: false,
  },
  secondairecolor: {
    type: String,
    required: false,
  },
  defaultMode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConsumationMode",
  },
  menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
  },
  active: {
    type: Boolean,
    default: true,
    required: true,
  },
  openingdate: [
    {
      shifts: {
        start: { type: String },
        end: { type: String },
      },
      jour: {
        Monday: { isOpen: { type: Boolean } },
        Tuesday: { isOpen: { type: Boolean } },
        Wednesday: { isOpen: { type: Boolean } },
        Thursday: { isOpen: { type: Boolean } },
        Friday: { isOpen: { type: Boolean } },
        Saturday: { isOpen: { type: Boolean } },
        Sunday: { isOpen: { type: Boolean } },
      },
    },
  ],
});

module.exports = mongoose.model("Store", storeSchema);
