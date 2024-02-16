const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  client_first_name: {
    type: String,
    require: true,
  },
  client_last_name: {
    type: String,
    require: true,
  },
  client_email: {
    type: String,
    require: true,
  },
  client_phone: {
    type: String,
    require: true,
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    require: true,
  },
  currency: {
    type: String,
    require: true,
  },
  type: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  source: {
    type: String,
    default: "Web",
  },
  price_total: {
    type: Number,
    require: true,
  },
  deliveryAdress: {
    type: String,
  },
  restaurantAdress: {
    type: String,
  },
  restaurant_phone: {
    type: String,
    require: true,
  },
  table: {
    type: Number,
    default: 0,
  },
  size: {
    type: String,
    default: "S"
  },
  paymentMethod: {
    type: String,
    require: true,
  },
  paymentStatus: {
    type: String,
    default: "pending"
  },

  promo: [
    {
      promoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Promo",
      },
      items: [
        {
          id: String,
          name: String,
          description: String,
          item_price_after_discount : Number,
          item_price: Number,
          subtotal : Number,

          quantity: Number,
          size: String,
          tax: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Tax",
            },
          ],
          options: [
            {
              id: String,
              name: String,
              optionGroupeId: String,
              optionGroupeName: String,
              price: Number,
              group_name: String,
              quantity: Number,
            },
          ],
        },
      ],
    },
  ],
  items: [
    {
      id: String,
      name: String,
      description: String,
      item_price:Number,
      price: Number,
      quantity: Number,
      size: String,
      tax: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tax",
        },
      ],
      options: [
        {
          id: String,
          name: String,
          optionGroupeId: String,
          optionGroupeName: String,
          price: Number,
          group_name: String,
          quantity: Number,
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  fulfillmentAt: {
    type: Date,
  },
  preparedAt: {
    type: Date
  },
});
module.exports = mongoose.model("Order", orderSchema);