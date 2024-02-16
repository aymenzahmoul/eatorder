const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const { checkClient, checkOwner, checkManager } = require("../middlewares/authMiddleware.js");
const Store = require("../models/store.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config.js");
const GroupeOption = require("../models/optionGroupe.js");
const order = require("../models/order.js");
const multer = require("multer");
const path = require("path");
const Option = require("../models/productOption.js");
const Menu = require("../models/menu.js");
const Product = require("../models/product.js");
const Category = require("../models/category.js");
const Company = require("../models/company.js");
const mongoose = require("mongoose");
const Tax = require("../models/tax.js");
const fs = require("fs");
const ConsumationMode = require("../models/mode");
const cors = require("cors");
const passport = require("passport");
const { sendWelcomeEmail } = require("../emailService.js");
const Mail = require("nodemailer/lib/mailer/index.js");
const { sendForgetpasswordclient } = require("../emailService.js");
const { sendVerificationClient } = require("../emailService.js");
const optionGroupe = require("../models/optionGroupe.js");
const ProductOption = require("../models/productOption.js");
const schedule = require("node-schedule");
require("../middlewares/passportSetup");

const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const handlebars = require('handlebars');  // Add this line to explicitly require handlebars

const transporter = nodemailer.createTransport({
  host: 'stone.o2switch.net',
  port: 465,
  auth: {
    type: 'custom',
    user: 'techsupport@eatorder.fr',
    pass: '&ofT+tW[i{}c',
  },
});

const handlebarOptions = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: path.resolve('./email-templates'),
    defaultLayout: false,
  },
  viewPath: path.resolve('./email-templates'),
  extName: ".handlebars",
};

transporter.use('compile', hbs(handlebarOptions));


router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;
  if (email) {
    await User.findOne({ email }).then(resp => {
      if (!resp) {
        return res.status(404).json({
          message: "Email not found."
        });
      }
      const token = jwt.sign(
        { id: resp._id, role: resp.role },
        config.secret
      );
      const mailOptions = {
        from: 'techsupport@eatorder.fr',
        to: email,
        subject: 'Reset Password',
        template: 'resetPassword',
        context: {
          title: 'Reset Password',
          text: `https://redirect.eatorder.fr?id=${resp._id}&token=${token}`
        }
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({
            message: "Error in sending e-mail."
          });
        } else {
          return res.status(200).json({
            message: "Email sent successfully."
          });
        }
      });

    }).catch(err => {
      return res.status(500).json({
        message: err?.message
      });
    })
  } else {
    return res.status(400).json({
      message:
        "No data found. Failed to send email",
    });
  }
})

router.put('/resetpassword', checkManager, async (req, res) => {
  const { password, id } = req.body;
  const saltRounds = 10;

  if (password && id) {
    await User.findById(id).then(async (resp) => {
      if (!resp) {
        return res.status(404).json({
          message: "User not found."
        });
      }
      const passwordMatches = await bcrypt.compare(password, resp.password);
      if (passwordMatches) {
        return res.status(400).json({
          message: "Password already used."
        });
      }

      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      resp.password = hashedPassword;
      await resp.save();
      return res.status(200).json({ message: 'Password updated successfully.' });
    }).catch(err => {
      return res.status(500).json({
        message: err?.message
      });
    })
  } else {
    return res.status(400).json({
      message:
        "No data found. Failed to reset password",
    });

  }
})


// get stores name by user id
router.get("/getstoresnameandidbyuserid/:id", checkManager, async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById({ _id: userId }).populate("stores");
    const menus = await Promise.all(
      user.stores.map(async (store) => {
        const resp = await Menu.findOne({ store: store._id });
        return { currency: resp.currency };
      })
    );

    res.status(200).json({
      currencies: menus,
      stores: user.stores
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err?.message });
  }
});

//login
router.post("/login-", (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(404).json({ message: "Incorrect password." });
          }
          const token = jwt.sign(
            { id: user._id, role: user.role },
            config.secret
          );
          return res.status(200).json({
            message: "Login success",
            token,
            user,
          });
        })
        .catch((error) => {
          console.error("Error comparing passwords:", error);
          return res.status(500).json({ message: err?.message });
        });
    })
    .catch((error) => {
      console.error("Error finding user by email:", error);
      return res.status(500).json({ message: err?.message });
    });
});
// update status of order by id (from restaurant's owner)
// router.put("/order/updatestatus", checkOwner, async (req, res) => {
//   try {
//     const { status, _id, preparationTime } = req.body;
//     if (status && _id) {
//       let data = preparationTime
//         ? {
//           status,
//           updatedAt: Date.now(),
//           preparedAt: new Date(Date.now() + preparationTime * 60000),
//         }
//         : { status, updatedAt: Date.now() };
//       const updateStatus = await order.findOneAndUpdate({ _id: _id }, data, {
//         new: true,
//       });
//       if (!updateStatus) {
//         return res.status(404).json({
//           message: "Order not found.",
//         });
//       }
//       return res.status(200).json({
//         message: "Status does update successfully.",
//         order: updateStatus,
//       });
//     }
//     return res.status(400).json({
//       message: "No data found. Failed to update order's status.",
//     });
//   } catch (err) {
//     return res.status(500).json({
//       message: err?.message,
//     });
//   }
// })

//get all orders by store
router.get("/order/allorders/:storeSelected/:page/:frombegining", checkManager, async (req, res) => {
  const perPage = 12;
  const page = parseInt(req.params.page); // Convert page to an integer

  const totalOrders = await order.countDocuments({ storeId: req.params.storeSelected });

  const skipCount = (page - 1) * perPage;

  if (req.params.frombegining.toString() === "true") {
    await order
      .find({ storeId: req.params.storeSelected })
      .sort({ _id: -1 })
      .limit(perPage * req.params.page)
      .populate({
        path: 'promo.promoId',
        model: 'Promo'
      })
      .exec()
      .then((response) => {
        return res.status(200).json({
          message: "All orders retrieved successfully.",
          orders: response,
          isLastPage: perPage * req.params.page >= totalOrders ? true : false
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err?.message,
        });
      });
  } else {
    await order
      .find({ storeId: req.params.storeSelected })
      .sort({ _id: -1 })
      .skip(skipCount)
      .limit(perPage)
      .populate({
        path: 'promo.promoId',
        model: 'Promo'
      })
      .exec()
      .then((response) => {
        return res.status(200).json({
          message: "All orders retrieved successfully.",
          orders: response,
          isLastPage: skipCount + perPage >= totalOrders ? true : false
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err?.message,
        });
      });
  }
});

//get accepted orders by store
router.get("/order/acceptedorders/:storeSelected/:page/:frombegining", checkManager, async (req, res) => {
  const perPage = 12;
  const page = parseInt(req.params.page); // Convert page to an integer

  const totalOrders = await order.countDocuments({ storeId: req.params.storeSelected, status: "accepted" });

  const skipCount = (page - 1) * perPage;

  if (req.params.frombegining.toString() === "true") {
    await order
      .find({ storeId: req.params.storeSelected, status: "accepted" })
      .sort({ _id: -1 })
      .limit(perPage * req.params.page)
      .populate({
        path: 'promo.promoId',
        model: 'Promo'
      })
      .exec()
      .then((response) => {
        return res.status(200).json({
          message: "All orders retrieved successfully.",
          orders: response,
          isLastPage: perPage * req.params.page >= totalOrders ? true : false
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err?.message,
        });
      });
  } else {
    await order
      .find({ storeId: req.params.storeSelected, status: "accepted" })
      .sort({ _id: -1 })
      .skip(skipCount)
      .limit(perPage)
      .populate({
        path: 'promo.promoId',
        model: 'Promo'
      })
      .exec()
      .then((response) => {
        return res.status(200).json({
          message: "All orders retrieved successfully.",
          orders: response,
          isLastPage: skipCount + perPage >= totalOrders ? true : false
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err?.message,
        });
      });
  }
});

//get ready orders by store
router.get("/order/readydorders/:storeSelected/:page/:frombegining", checkManager, async (req, res) => {
  const perPage = 12;
  const page = parseInt(req.params.page); // Convert page to an integer

  const totalOrders = await order.countDocuments({ storeId: req.params.storeSelected, status: "ready" });

  const skipCount = (page - 1) * perPage;

  if (req.params.frombegining.toString() === "true") {
    await order
      .find({ storeId: req.params.storeSelected, status: "ready" })
      .sort({ _id: -1 })
      .limit(perPage * req.params.page)
      .populate({
        path: 'promo.promoId',
        model: 'Promo'
      })
      .exec()
      .then((response) => {
        return res.status(200).json({
          message: "All orders retrieved successfully.",
          orders: response,
          isLastPage: perPage * req.params.page >= totalOrders ? true : false
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err?.message,
        });
      });
  } else {
    await order
      .find({ storeId: req.params.storeSelected, status: "ready" })
      .sort({ _id: -1 })
      .skip(skipCount)
      .limit(perPage)
      .populate({
        path: 'promo.promoId',
        model: 'Promo'
      })
      .exec()
      .then((response) => {
        return res.status(200).json({
          message: "All orders retrieved successfully.",
          orders: response,
          isLastPage: skipCount + perPage >= totalOrders ? true : false
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err?.message,
        });
      });
  }
});

// active or disactive store
router.put("/store/changestatus", checkManager, async (req, res) => {
  const { _id, active } = req.body;
  console.log(active);
  try {
    if (_id && active !== undefined) {
      const updateStatus = await Store.findOneAndUpdate(
        { _id: _id },
        { active },
        { new: true }
      );
      if (!updateStatus) {
        return res.status(404).json({
          message: "Store not found.",
        });
      }
      return res.status(200).json({
        message: updateStatus.active ? "Store is active" : "Store is disactive",
        store: updateStatus,
      });
    }
    return res.status(400).json({
      message: "No data found. Failed to update store's status.",
    });
  } catch (err) {
    return res.status(500).json({
      message: err?.message,
    });
  }
});

/* -------------------------------new--------------------------------------------------------------------------------------------------------------*/

// get all categorie and mode by category
router.get(
  "/menu/getallcategoriesbystoreid/:storeSelected", checkManager,
  async (req, res) => {
    await Menu.findOne({ store: req.params.storeSelected })
      .populate({
        path: "categorys",
        populate: { path: "availabilitys.mode", model: "ConsumationMode" },
      })
      .then((response) => {
        return res.status(200).json({
          message: "Categories by store does got successfully.",
          categories: response.categorys,
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err?.message,
        });
      });
  }
);

// update availability by mode
router.put("/category/updateavailabiltybymode", checkManager, async (req, res) => {
  const { idCategory, idMode, value, storeId } = req.body;
  try {
    if (
      idCategory &&
      idMode &&
      (value === false || value === true) &&
      storeId
    ) {
      const updateStatus = await Category.findOneAndUpdate(
        { _id: idCategory, store: storeId, "availabilitys.mode": idMode },
        { "availabilitys.$.availability": value },
        { new: true }
      );
      if (!updateStatus) {
        return res.status(404).json({
          message: "Category not found.",
        });
      } else {
        await Menu.findOne({ store: storeId })
          .populate({
            path: "categorys",
            populate: { path: "availabilitys.mode", model: "ConsumationMode" },
          })
          .then((response) => {
            return res.status(200).json({
              message: value
                ? "Category by mode is now availabale."
                : "Category by mode is now not available.",
              categories: response.categorys,
            });
          });
      }
    } else {
      return res.status(400).json({
        message: "No data found. Failed to update availability by mode.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err?.message,
    });
  }
});

// update availability in category
router.put("/category/updateavailabilty", checkManager, async (req, res) => {
  const { idCategory, value, storeId } = req.body;
  console.log(req.body);
  try {
    if (idCategory && (value === false || value === true) && storeId) {
      const updateStatus = await Category.findOneAndUpdate(
        { _id: idCategory, store: storeId },
        { availability: value },
        { new: true }
      );
      if (!updateStatus) {
        return res.status(404).json({
          message: "Category not found.",
        });
      } else {
        await Menu.findOne({ store: storeId })
          .populate({
            path: "categorys",
            populate: { path: "availabilitys.mode", model: "ConsumationMode" },
          })
          .then((response) => {
            return res.status(200).json({
              message: value
                ? "Category is now available."
                : "Category is not available.",
              categories: response.categorys,
            });
          });
      }
    } else {
      return res.status(400).json({
        message: "No data found. Failed to update category availability.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err?.message,
    });
  }
});

// get all categorie and mode by category
router.get(
  "/menu/getallproductsbycategorybystoreid/:storeSelected/:categoryId", checkManager,
  async (req, res) => {
    await Menu.findOne({ store: req.params.storeSelected })
      .populate({
        path: "categorys",
        match: { _id: req.params.categoryId },
        populate: {
          path: "products",
          model: "Product",
          populate: { path: "availabilitys.mode", model: "ConsumationMode" },
        },
      })
      .then((response) => {
        return res.status(200).json({
          message: "Products by Category by store does got successfully.",
          products: response.categorys[0].products,
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err?.message,
        });
      });
  }
);

// update availability by mode
router.put("/product/updateavailabiltybymode", checkManager, async (req, res) => {
  const { idCategory, idMode, value, storeId, idProduct } = req.body;
  try {
    if (
      idCategory &&
      idMode &&
      (value === false || value === true) &&
      storeId &&
      idProduct
    ) {
      const updateStatus = await Product.findOneAndUpdate(
        {
          _id: idProduct,
          storeId: storeId,
          category: idCategory,
          "availabilitys.mode": idMode,
        },
        { "availabilitys.$.availability": value },
        { new: true }
      );
      if (!updateStatus) {
        return res.status(404).json({
          message: "Product not found.",
        });
      } else {
        await Menu.findOne({ store: storeId })
          .populate({
            path: "categorys",
            match: { _id: idCategory },
            populate: {
              path: "products",
              model: "Product",
              populate: {
                path: "availabilitys.mode",
                model: "ConsumationMode",
              },
            },
          })
          .then((response) => {
            return res.status(200).json({
              message: value
                ? "Product by mode is now available."
                : "Product by mode is now not available.",
              products: response.categorys[0].products,
            });
          });
      }
    } else {
      return res.status(400).json({
        message:
          "No data found. Failed to update product availability by mode.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err?.message,
    });
  }
});

// update availability in product
router.put("/product/updateavailabilty", checkManager, async (req, res) => {
  const { idCategory, value, storeId, idProduct } = req.body;
  try {
    if (
      idCategory &&
      (value === false || value === true) &&
      storeId &&
      idProduct
    ) {
      const updateStatus = await Product.findOneAndUpdate(
        { _id: idProduct, category: idCategory, storeId: storeId },
        { availability: value },
        { new: true }
      );
      if (!updateStatus) {
        return res.status(404).json({
          message: "Product not found.",
        });
      } else {
        await Menu.findOne({ store: storeId })
          .populate({
            path: "categorys",
            match: { _id: idCategory },
            populate: {
              path: "products",
              model: "Product",
              populate: {
                path: "availabilitys.mode",
                model: "ConsumationMode",
              },
            },
          })
          .then((response) => {
            return res.status(200).json({
              message: value
                ? "Product is now available."
                : "Product is now not available.",
              products: response.categorys[0].products,
            });
          });
      }
    } else {
      return res.status(400).json({
        message: "No data found. Failed to update product availability.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err?.message,
    });
  }
});

/* -------------------------------new--------------------------------------------------------------------------------------------------------------*/

module.exports = router;
