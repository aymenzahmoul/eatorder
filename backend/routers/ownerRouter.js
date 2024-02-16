const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const Store = require('../models/store.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config.js');
const { checkSuperAdmin,checkOwner } = require('../middlewares/authMiddleware.js');
const GroupeOption = require('../models/optionGroupe.js')
const multer = require('multer');
const path = require('path');
const Option = require('../models/productOption.js')
const Product = require('../models/product.js');
const Category = require('../models/category.js');
const mongoose = require('mongoose');
const Tax = require('../models/tax.js');
const fs = require('fs');
const fsPromises = require('fs/promises');
const ConsumationMode = require('../models/mode') 
const Order = require('../models/order.js');
const Menu = require('../models/menu.js');
const Promo = require('../models/promo.js');
const Coupon  = require('../models/coupon.js');
const voucherCode = require('voucher-code-generator');
const Company = require('../models/company.js');
const ProductOption = require('../models/productOption.js');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const date = new Date().toISOString().split('T')[0];
    const originalname = file.originalname;
    const extension = path.extname(originalname);
    const filename = originalname.split('.')[0];
    const uniqueSuffix = date + '-' + Date.now();
    const newFilename = filename + '-' + uniqueSuffix + extension;

    // Remove the "uploads/" prefix from the newFilename
    const filenameWithoutPrefix = newFilename.replace('uploads/', '');

    cb(null, filenameWithoutPrefix);
  }
});

// Create the multer upload instance
const upload = multer({ storage: storage });





// Service de connexion
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Vérifier si le mot de passe est correct
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Générer un jeton JWT
    const token = jwt.sign({ id: user._id, role: user.role }, config.secret);

    // Envoyer le jeton JWT à l'utilisateur
    res.json({ token, user });
    // console.log(user);
  } catch (error) {
    next(error); // Passer l'erreur au middleware de capture des erreurs
  }
});

// Service pour créer un store
// router.post('/addStore', async (req, res) => {
//   try {
//     const { ownerId, name, address, phoneNumber, description } = req.body;
//     console.log("hi")
//     // Vérifier si le propriétaire existe
//     const owner = await User.findById(ownerId);
//     if (!owner) {
//       return res.status(404).json({ message: 'Propriétaire non trouvé' });
//     }

//     // Créer un nouveau store avec les détails fournis
//     const store = new Store({
//       owner: ownerId,
//       name,
//       description,
//       address,
//       phoneNumber
//     });

//     // Enregistrer le store dans la base de données
//     await store.save();

//     // Ajouter le store créé à la liste des stores de l'owner
//     owner.stores.push(store._id);
//     await owner.save();

//     res.status(201).json({ message: 'Store créé avec succès', store });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Une erreur est survenue lors de la création du store' });
//   }
// });


// Service pour récupérer tous les stores d'un owner
router.get('/stores/:ownerId',checkOwner, async (req, res) => {
  try {
    const ownerId = req.params.ownerId;

    // Vérifier si le propriétaire existe
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Propriétaire non trouvé' });
    }

    // Récupérer tous les stores de l'owner
    const stores = await Store.find({ owner: ownerId });

    res.json({ stores });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des stores' });
  }
});


router.post('/addCategory', upload.single('image'), async (req, res) => {
  try {

    
    const storeId = req.body.storeId;
    const name = req.body.name;
    const userId = req.body.userId;
    const description = req.body.description;
    const availabilitys = JSON.parse(req.body.availabilitys);

    const parentId = req.body.parentId;
    const image = req.file.filename;
// console.log(availabilitys);
// const userFolderPath = path.join('uploads', storeId); // Construire le chemin du dossier de l'utilisateur

//     // Vérifier si le dossier de l'utilisateur existe, sinon le créer
//     if (!fs.existsSync(userFolderPath)) {
//       fs.mkdirSync(userFolderPath);
//     }

//     if (req.file.size > 500 * 1024) {
//       // Taille de fichier supérieure à 500 Ko
//       return res.status(400).json({ error: 'La taille du fichier dépasse la limite autorisée.' });
//     }

//     const allowedMimeTypes = ['image/jpg', 'image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
//     if (!allowedMimeTypes.includes(req.file.mimetype)) {
//       // Type de fichier non autorisé
//       return res.status(400).json({ error: 'Seuls les fichiers PNG, JPEG, WebP, PDF et DOCX sont autorisés.' });
//     }

//     // Déplacer le fichier téléchargé dans le dossier de l'utilisateur
//     const destinationPath = path.join(userFolderPath, req.file.filename);
//     fs.renameSync(req.file.path, destinationPath);

    // Vérifier si la catégorie parente existe
    const parentCategory = parentId ? await Category.findById(parentId) : null;
    if (parentId && !parentCategory) {
      return res.status(404).json({ message: 'Catégorie parente non trouvée' });
    }

    // Vérifier si le magasin existe
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    // Créer une nouvelle catégorie avec la référence à la catégorie parente et au magasin
    const category = new Category({
      name,
      store: storeId,
      description,
      availabilitys,
      userId,
      image,
    });

    // Enregistrer la catégorie dans la base de données
    await category.save();

    // Ajouter la catégorie à la liste des sous-catégories de la catégorie parente (si elle existe)
    if (parentId) {
      parentCategory.subcategories.push(category._id);
      await parentCategory.save();
    }

    // Ajouter la catégorie au magasin
    store.categories.push(category._id);
    await store.save();

    // Ajouter la catégorie au menu
    const menu = await Menu.findOne({ store: storeId });
    if (menu) {
      menu.categorys.push(category._id);
      await menu.save();
    }

    // Récupérer l'ID de la catégorie parente
    const parentCategoryId = parentCategory ? parentCategory._id : null;
    await category.populate('availabilitys.mode');
    res.status(201).json({ message: 'Catégorie créée avec succès', category, parentCategoryId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la création de la catégorie' });
  }
});


// ...

router.post('/addOptionGroups', checkOwner, upload.single('image'), async (req, res) => {
  try {
    const { name, description ,storeId,force_max,force_min,allow_quantity  } = req.body;
    const ownerId = req.user.id; // Get the ownerId from the authenticated user
      // console.log(storeId);
    // Get the image file path from the request
  

    // Create a new option group with the provided details, image path, and ownerId
    const optionGroup = new GroupeOption({
      name,
      description,
      ownerId: ownerId,
      store:storeId,
      force_max: force_max,
      force_min:force_min,
      allow_quantity,
    });

    // Save the option group to the database
    await optionGroup.save();

    res.status(201).json({ message: 'Groupe d\'options créé avec succès', optionGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la création du groupe d\'options' });
  }
});

router.post('/addOptions', checkOwner, upload.single('image'), async (req, res) => {
  try {
    const { name, price, tax, isDefault, promoPercentage, unite } = req.body;
    const ownerId = req.user.id; // Get the ownerId from the authenticated user

    const parsedPromoPercentage = promoPercentage === "null" ? null : parseFloat(promoPercentage);

    // Get the image file path from the request
    const image = req.file.filename;

    // Create a new instance of the option
    const option = new Option({
      name,
      price,
      tax,
      isDefault,
      promoPercentage: parsedPromoPercentage,
      unite,
      image,// Save the image path to the option object
      ownerId 
    });

    // Save the option to the database
    await option.save();

    res.status(201).json({ message: 'Option créée avec succès', option });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la création de l\'option' });
  }
});




// Service pour affecter une option à un groupe d'options
router.post('/affectOptionToGroup/:groupId/options/:optionId', async (req, res) => {
  try {
    const groupId = req.params.groupId; // ID du groupe d'options
    const optionId = req.params.optionId; // ID de l'option à affecter
    const optionPrice = req.body.price; // Prix de l'option pour ce groupe
    const optionDefault = req.body.default;
    // Vérifier si le groupe d'options existe
    const group = await GroupeOption.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Groupe d\'options non trouvé' });
    }

    // Vérifier si l'option existe
    const option = await Option.findById(optionId);
    if (!option) {
      return res.status(404).json({ message: 'Option non trouvée' });
    }

    // Vérifier si l'option est déjà affectée au groupe
    const existingOption = group.options.find(opt => opt.option.equals(optionId));
    if (existingOption) {
      return res.status(400).json({ message: 'Option déjà affectée au groupe d\'options' });
    }

    // Extract the attributes from the option that you want to save to the group
    const { name, tax, unite, promoPercentage, image, isDefault } = option;

    // Ajouter l'option au groupe d'options avec le prix spécifique, l'ID du groupe et les autres attributs
    group.options.push({ 
      option: optionId, 
      price: optionPrice,
      name,
      tax,
      unite,
      promoPercentage,
      image,
      isDefault :optionDefault,
      // Add other attributes of the option that you want to save to the group
    });
    await group.save();

    // Ajouter l'ID du groupe d'options à l'option
    option.optionGroups.push(groupId);
    await option.save();

    res.status(200).json({ message: 'Option affectée au groupe d\'options avec succès', name,image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de l\'affectation de l\'option au groupe d\'options' });
  }
});







// router.get('/api/products/:productId', async (req, res) => {
//   try {
//     const productId = req.params.productId;

//     // Use the Product model to find a product by its _id and populate the related fields
//     const product = await Product.findById(productId)
//       .populate('category') // Replace 'category' with the actual field name for category
//       .populate({
//         path: 'size.optionGroups',
//         select: '-_id', // Exclude _id from optionGroups
//       })
//       .populate('taxes') // Replace 'taxes' with the actual field name for taxes
//       .exec();

//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     res.status(200).json(product);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

router.get('/api/products', async (req, res) => {
  try {
    // Use the Product model to find all products and populate the related fields
    const products = await Product.find()
      .populate('category') // Replace 'category' with the actual field name for category
      .populate({
        path: 'size.optionGroups',
        select: '-_id', // Exclude _id from optionGroups
      })
      .populate('taxes') // Replace 'taxes' with the actual field name for taxes
      .exec();

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post('/api/products', async (req, res) => {
  try {
    // Create a new product instance using the request body
    const newProduct = new Product(req.body);

    // Save the new product to the database
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getProductsByStore/:storeId', async (req, res) => {
  try {
    const storeId = req.params.storeId;

    const products = await Product.find({ storeId: storeId })
      .populate('category')
      
      .populate('taxes')
      .exec();

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});



router.get('/getProductByStore/:storeId', async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const page = parseInt(req.query.page) || 1; // Get the page number from query parameter, default to 1
    const pageSize = parseInt(req.query.pageSize) || 10; // Get the page size from query parameter, default to 10

    const skip = (page - 1) * pageSize;

    const products = await Product.find({ storeId: storeId })
      .populate('category')
      .populate('optionGroups')
      .populate('taxes')
      .skip(skip)
      .limit(pageSize)
      .exec();

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
router.get('/getProducts', checkOwner, async (req, res) => {
  try {
    const productId = req.params.productId;

    // Rechercher le produit par son ID et effectuer le "populate" pour charger les données associées
    const product = await Product.findById(productId)
      .populate('category', 'name') // Charger uniquement le champ 'name' de la catégorie
      .populate({
        path: 'optionGroups',
        populate: {
          path: 'options',
          model: 'ProductOption',
        },
      });

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération du produit' });
  }
});
router.post('/:productId/optionGroups/:optionGroupId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const optionGroupId = req.params.optionGroupId;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the option group
    const optionGroup = await GroupeOption.findById(optionGroupId);
    if (!optionGroup) {
      return res.status(404).json({ message: 'Option group not found' });
    }
        // Check if the option group already exists in the product's optionGroups array
        const optionGroupExists = product.optionGroups.some((group) => group.equals(optionGroupId));

        if (optionGroupExists) {
          return res.status(400).json({ message: 'Option group already exists in the product' });
        }

    // Add the option group to the product's optionGroups array
    product.optionGroups.push(optionGroup);
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete('/products/:productId/optionGroups/:optionGroupId', async (req, res) => {
  const { productId, optionGroupId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find the index of the option group to be removed
    const index = product.optionGroups.findIndex(
      (groupId) => groupId.toString() === optionGroupId
    );

    if (index === -1) {
      return res.status(404).json({ error: 'Option group not found' });
    }

    // Remove the option group from the array
    product.optionGroups.splice(index, 1);

    // Save the updated product
    await product.save();

    return res.json({ message: 'Option group removed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});
router.get('/getProducts/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;

    // Rechercher le produit par son ID et effectuer le "populate" pour charger les données associées
    const product = await Product.findById(productId)
      .populate('category', 'name') // Charger uniquement le champ 'name' de la catégorie
      .populate({
        path: 'optionGroups',
        populate: {
          path: 'options',
          model: 'ProductOption',
        },
      });

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération du produit' });
  }
});


// Service pour récupérer tous les détails des catégories par magasin avec sous-catégories imbriquées
router.get('/getCategoriesByStore/:storeId/details', async (req, res) => {
  try {
    const storeId = req.params.storeId;

    // Vérifier si le magasin existe
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    // Récupérer toutes les catégories associées à ce magasin avec les sous-catégories
    const categories = await Category.find({ store: storeId })
      .populate({
        path: 'subcategories',
        populate: {
          path: 'subcategories',
          populate: {
            path: 'subcategories',
            // Continuer la hiérarchie des sous-catégories imbriquées si nécessaire
          }
        }
      });

    // Récupérer les produits de chaque catégorie
    const categoriesWithProducts = await Promise.all(
      categories.map(async category => {
        const products = await Product.find({ category: category._id });
        return { category, products };
      })
    );

    res.json({ categories: categoriesWithProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des détails des catégories par magasin' });
  }
});
router.get('/getCategoriesByStoreOnly/:storeId', async (req, res) => {
  try {
    const storeId = req.params.storeId;

    // Vérifier si le magasin existe
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    // Récupérer toutes les catégories associées à ce magasin avec les sous-catégories
    const categories = await Category.find({ store: storeId }).populate({
      path: 'products',
      populate: {
        path: 'size.optionGroups optionGroups',
        model: 'OptionGroup',
      },
    });
    // Récupérer les produits de chaque catégorie


    res.json({ categories: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des détails des catégories par magasin' });
  }
});
// Service pour récupérer tous les groupes d'options
router.get('/getOptionGroups/:storeId',  async (req, res) => {
  try {
    const storeId = req.params.storeId;
  // console.log(storeId);
    // Récupérer tous les groupes d'options associés à l'ownerId spécifié
   // const optionGroups = await GroupeOption.find();
    const optionGroups = await GroupeOption.find({ store: storeId }).populate('options.option').populate('options.subOptionGroup').exec();
    res.json({ optionGroups });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des groupes d\'options', });
  }
});
// Service pour supprimer un groupe d'options
router.delete('/optionGroups/:groupId', checkOwner, async (req, res) => {
  try {
    const groupId = req.params.groupId; // ID du groupe d'options

    // Vérifier si le groupe d'options existe
    const group = await GroupeOption.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Groupe d\'options non trouvé' });
    }

    // Trouver toutes les options qui ont cet ID de groupe d'options dans leur tableau `optionGroups`
    const optionsToUpdate = await Option.find({ optionGroups: groupId });

    // Supprimer l'ID du groupe d'options de chaque option trouvée
    optionsToUpdate.forEach(async (option) => {
      option.optionGroups = option.optionGroups.filter(
        (groupOptionId) => groupOptionId.toString() !== groupId.toString()
      );
      await option.save();
    });

    // Supprimer le groupe d'options de la base de données
    await GroupeOption.findByIdAndRemove(groupId);

    res.status(200).json({ message: 'Groupe d\'options supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la suppression du groupe d\'options' });
  }
});
router.post('/product-options', upload.single('image'), async (req, res) => {
  try {
    // console.log('h');
    // console.log(req.body)
    // Extract data from the request body
    const { name, price, store, tax, isDefault, unite,  ownerId, optionGroups } = req.body;

    // Get the file path from the uploaded image
    const imagePath = req.file.filename;

    // Create a new ProductOption instance with the image path
    const newProductOption = new Option({
      name,
      price,
      store,
      tax,
      isDefault,
      unite,

      image: imagePath, // Save the image path
      ownerId,
      optionGroups,
    });

    // Save the new product option to the database
    const savedProductOption = await newProductOption.save();

    // Respond with the saved product option
    res.json(savedProductOption);
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/options/:storeId', async (req, res) => {
  try {
    const storeId = req.params.storeId;

    // Find options associated with the given store ID
    const options = await Option.find({ store: storeId });

    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/getOptions/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Find all options associated with the user
    const options = await Option.find({ ownerId: userId });

    res.json({ options });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des options' });
  }
});
router.get('/options/:optionId', checkOwner, async (req, res) => {
  try {
    const optionId = req.params.optionId;

    // Find the option by its ID
    const option = await Option.findById(optionId);

    if (!option) {
      return res.status(404).json({ message: 'Option not found' });
    }

    res.json({ option });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while retrieving the option' });
  }
});
// Service to delete an option
// router.delete('/deleteOptions/:optionId', checkOwner, async (req, res) => {
//   try {
//     const optionId = req.params.optionId;

//     // Find the option by its ID
//     const option = await Option.findById(optionId);
//     if (!option) {
//       return res.status(404).json({ message: 'Option not found' });
//     }

//     // Delete the option from the database
//     await Option.findByIdAndRemove(optionId);

//     res.status(200).json({ message: 'Option deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'An error occurred while deleting the option' });
//   }
// });
router.delete('/deleteOptions/:optionId', checkOwner, async (req, res) => {
  try {
    const optionId = req.params.optionId;

    // Find the option by its ID
    const option = await Option.findById(optionId);
    if (!option) {
      return res.status(404).json({ message: 'Option not found' });
    }

    // Delete the option from the database
    await Option.findByIdAndRemove(optionId);

    // Remove the option reference from optionGroups
    await GroupeOption.updateMany(
      { 'options.option': optionId },
      { $pull: { options: { option: optionId } } }
    );

    res.status(200).json({ message: 'Option deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while deleting the option' });
  }
});

// Service pour mettre à jour une option
// Service pour mettre à jour une option
router.put('/updateOption/:optionId', checkOwner, upload.single('image'), async (req, res) => {
  try {
    const optionId = req.params.optionId;
    
    const { name, price, tax, isDefault, promoPercentage, unite } = req.body;

    // Vérifier si l'option existe
    const option = await Option.findById(optionId);
    if (!option) {
      return res.status(404).json({ message: 'Option non trouvée' });
    }

    // Mettre à jour les propriétés de l'option avec les nouvelles valeurs
    option.name = name;
    option.price = price;
    option.tax = tax;
    option.isDefault = isDefault;
    option.promoPercentage = promoPercentage === 'null' ? null : parseFloat(promoPercentage);
    option.unite = unite;

    // Vérifier si une nouvelle image a été fournie
    if (req.file) {
      // Supprimer l'ancienne image du serveur
      const oldImagePath = path.join(__dirname, '../uploads', option.image);
      fs.unlinkSync(oldImagePath);

      // Enregistrer le nouveau chemin d'image dans l'option
      option.image = req.file.filename;
    }

    // Enregistrer les modifications dans la base de données
    await option.save();

    res.status(200).json({ message: 'Option mise à jour avec succès', option });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour de l\'option' });
  }
});
// Service pour récupérer un groupe d'options par son ID
router.get('/getOptionGroupById/:groupId', checkOwner, async (req, res) => {
  try {
    const groupId = req.params.groupId;

    // Rechercher le groupe d'options par son ID
    const optionGroup = await GroupeOption.findById(groupId);

    if (!optionGroup) {
      return res.status(404).json({ message: 'Groupe d\'options non trouvé' });
    }

    res.json({ optionGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération du groupe d\'options' });
  }
});
// Service to get the prices of options in an OptionGroup
router.get('/optionGroups/:groupId/optionPrices', checkOwner, async (req, res) => {
  try {
    const groupId = req.params.groupId;

    // Find the option group by its ID
    const optionGroup = await GroupeOption.findById(groupId);

    if (!optionGroup) {
      return res.status(404).json({ message: 'Option group not found' });
    }

    // Create an array to store the prices of each option
    const optionPrices = [];

    // Iterate through the options and extract their prices
    optionGroup.options.forEach(option => {
      const { option: optionId, price } = option;
      optionPrices.push({ optionId, price });
    });

    res.json({ optionPrices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while retrieving the option prices' });
  }
});
// Service pour désaffecter une option d'un groupe d'options
router.delete('/desaffecteroptionGroups/:groupId/options/:optionId', checkOwner, async (req, res) => {
  try {
    const groupId = req.params.groupId; // ID du groupe d'options
    const optionId = req.params.optionId; // ID de l'option à désaffecter

    // Vérifier si le groupe d'options existe
    const group = await GroupeOption.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Groupe d\'options non trouvé' });
    }

    // Vérifier si l'option existe
    const option = await Option.findById(optionId);
    if (!option) {
      return res.status(404).json({ message: 'Option non trouvée' });
    }

    // Vérifier si l'option est déjà désaffectée du groupe
    const existingOption = group.options.find(opt => opt.option.equals(optionId));
    if (!existingOption) {
      return res.status(400).json({ message: 'Option déjà désaffectée du groupe d\'options' });
    }

    // Supprimer l'option du groupe d'options
    group.options = group.options.filter(opt => !opt.option.equals(optionId));
    await group.save();

    // Supprimer l'ID du groupe d'options de l'option
   // Supprimer l'ID du groupe d'options de l'option
// Supprimer l'ID du groupe d'options de l'option
option.optionGroups = option.optionGroups.filter(groupOptionId => groupOptionId.toString() !== groupId.toString());
await option.save();

    res.status(200).json({ message: 'Option désaffectée du groupe d\'options avec succès', group });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la désaffectation de l\'option du groupe d\'options' });
  }
});

// Service to get an option within an option group
router.get('/optionGroups/:groupId/options/:optionId', checkOwner, async (req, res) => {
  try {
    const groupId = req.params.groupId; // ID of the option group
    const optionId = req.params.optionId; // ID of the option to retrieve

    // Find the option group by its ID
    const optionGroup = await GroupeOption.findById(groupId);

    if (!optionGroup) {
      return res.status(404).json({ message: 'Option group not found' });
    }

    // Find the option within the option group by its ID
    const option = optionGroup.options.find(opt => opt.option.equals(optionId));

    if (!option) {
      return res.status(404).json({ message: 'Option not found' });
    }

    res.json({ option });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while retrieving the option' });
  }
});

// Assuming you have already set up the required dependencies and middleware

// Service to update an option within an option group
router.put('/optionGroups/:groupId/options/:optionId', checkOwner, upload.single('image'), async (req, res) => {
  try {
    const groupId = req.params.groupId; // ID of the option group
    const optionId = req.params.optionId; // ID of the option to update

    // Find the option group by its ID
    const optionGroup = await GroupeOption.findById(groupId);

    if (!optionGroup) {
      return res.status(404).json({ message: 'Option group not found' });
    }

    // Find the option within the option group by its ID
    const option = optionGroup.options.find(opt => opt._id.equals(optionId));

    if (!option) {
      return res.status(404).json({ message: 'Option not found' });
    }
    option.name = req.body.name || option.name;
    option.price = req.body.price || option.price;
    option.tax = req.body.tax || option.tax;
    option.isDefault = req.body.isDefault || option.isDefault;
    option.unite = req.body.unite || option.unite;
    option.promoPercentage = req.body.promoPercentage || option.promoPercentage;
    // Update other properties as needed

    // Check if a new image has been provided
    if (req.file) {
      // Delete the old image from the server
      const oldImagePath = path.join(__dirname, '../uploads', option.image);
      fs.unlinkSync(oldImagePath);

      // Save the new image path to the option
      option.image = req.file.filename;
    }

    // Save the changes to the option group
    await optionGroup.save();

    res.status(200).json({ message: 'Option updated successfully', optionGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the option' });
  }
});

    // Update the properties of the option with the new values
    
    router.delete('/deleteproduct/:productId', async (req, res) => {
      const { productId } = req.params;
      try {
        // Find the product
        const product = await Product.findById(productId);
    
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }
    
        // Find the category
        const categoryId = product.category;
    
        const category = await Category.findById(categoryId);
    
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }
    
        // Find the index of the product in the products array
        const productIndex = category.products.indexOf(productId);
    
        if (productIndex === -1) {
          return res.status(404).json({ error: 'Product not found in the category' });
        }
    
        // Remove the product ID from the products array
        category.products.splice(productIndex, 1);
    
        // Save the updated category
        await category.save();
        const imagePath = path.join(__dirname, '../uploads', product.image);
        await fsPromises.unlink(imagePath);

      await Product.findByIdAndDelete(productId);

        res.json({ success: true, message: 'Product deleted from category' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
router.delete('/categories/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // Fetch the category details to get the image filename (if needed)
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete the category from the database
    await Category.findByIdAndDelete(categoryId);
  // Delete all products associated with the category
 // await Product.deleteMany({ category: categoryId });

    // Remove the image file from the server (if needed)
    const imagePath = "uploads/"+category.image; // Assuming the filename is stored in the 'image' field
    if (imagePath && imagePath !== 'images/default.png') {
      const fs = require('fs');
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image file:', err);
        }
      });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while deleting the category' });
  }
});
router.delete('/categoriesWithProduct/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // Fetch the category details to get the image filename (if needed)
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete the category from the database
    await Category.findByIdAndDelete(categoryId);
  // Delete all products associated with the category
  await Product.deleteMany({ category: categoryId });

    // Remove the image file from the server (if needed)
    const imagePath = "uploads/"+category.image; // Assuming the filename is stored in the 'image' field
    if (imagePath && imagePath !== 'images/default.png') {
      const fs = require('fs');
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image file:', err);
        }
      });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while deleting the category' });
  }
});
router.put('/updateProduct/:productId', checkOwner, async (req, res) => {
  try {
    // Retrieve the product ID from the request parameters
    const productId = req.params.productId;
// console.log(req.body);
    // Retrieve the existing product from the database
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If an image is uploaded, update the image
 
    // Update other product details if provided in the request body
    const { name, description, price, storeId, category, size  } = req.body;
    const sizeData = JSON.parse(req.body.size);

    if (name) product.name = name;
    if (description) product.description = description;
    if (!isNaN(parseFloat(price)) && isFinite(price)) {
      product.price = parseFloat(price);
    } else {
      // Handle the case where 'price' is not a valid number
      // For example, you can set a default value or skip updating the field
      // product.price = defaultPrice; // Set a default value
      // Or skip updating the field altogether
    }
    if (storeId) product.storeId = storeId;
    if (category) product.category = category;
    if (sizeData) product.size = sizeData;

    // Save the changes to the database
    await product.save();

    // Construct the response
    let response = { message: 'Product updated successfully' };

    if (req.file) {
      response.imageURL = req.file.filename;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the product' });
  }
});

// router.put('/updateProduct/:productId',checkOwner,upload.single('image'), async (req, res) => {
//   try {
//     // Récupérer l'ID de l'proudact à partir du token d'authentification
//     const productId = req.params.productId;
//     if(req.file.filename)
//     {
//     const image =req.file.filename;
//     console.log(image);
//     }
//     // Récupérer les nouvelles données du profil depuis le corps de la requête
//     const { name, description, price,storeId, category, size } = req.body;
//     const sizeData = JSON.parse(req.body.size);

//     // Récupérer l'admin à partir de la base de données en utilisant l'ID
//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     // Mettre à jour les propriétés du Product
//      if(req.file.filename)
//      {
//     product.name = name;
//     product.description = description;
//     product.price = price;
//     product.storeId = storeId;
//     product.category = category;
//     product.size=sizeData;
//     product.image=image
//   }

//     // Sauvegarder les modifications dans la base de données
//     await product.save();
//     const imageFilePath =req.file.filename;

//     // Return a response containing the image details
//     res.status(200).json({ imageURL: imageFilePath }); 
   
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'An error occurred while updating Product ' });
//   }
// });
// router.put('/updateCategory/:categoryId',  async (req, res) => {
//   try {
//     const categoryId = req.params.categoryId;
//     const name = req.body.name;
//     const description = req.body.description;
//     const storeId = req.body.storeId;
//       console.log(name);
//       console.log(description);
//     // Find the category by ID
//     const category = await Category.findById(categoryId);

//     // Check if the category exists
//     if (!category) {
//       return res.status(404).json({ message: 'Catégorie non trouvée' });
//     }

//     // Update the category properties
//     if (name) category.name = name;
//     if (description) category.description = description;

   

//     if (storeId) category.store = storeId;

//     // Save the updated category to the database
//     await category.save();

//     // Construct the response
//     let response = { message: 'Catégorie mise à jour avec succès', category };

//     if (req.file) {
//       response.imageURL = req.file.filename;
//     }

//     res.status(200).json(response);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour de la catégorie' });
//   }
// });
router.put('/updateCategory/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { name, description, storeId } = req.body;

    // Find the category by ID
    const category = await Category.findById(categoryId);

    // Check if the category exists
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    // Update the category properties
    if (name) category.name = name;
    if (description) category.description = description;
    if (storeId) category.store = storeId;

    // Save the updated category to the database
    await category.save();

    // Construct the response
    let response = { message: 'Catégorie mise à jour avec succès', category };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour de la catégorie' });
  }
});
// router.put('/updateCategory/:categoryId', upload.single('image'), async (req, res) => {
//   try {
//     const categoryId = req.params.categoryId;
//     const name = req.body.name;
//     const description = req.body.description;
//     const storeId = req.body.storeId;
//     const image = req.file.filename;

//     // Find the category by ID
//     const category = await Category.findById(categoryId);

//     // Check if the category exists
//     if (!category) {
//       return res.status(404).json({ message: 'Catégorie non trouvée' });
//     }

//     // Update the category properties
//     category.name = name;
//     category.description = description;
//     category.image = image;
//     category.store = storeId;


//     // Save the updated category to the database
//     await category.save();

//     res.status(200).json({ message: 'Catégorie mise à jour avec succès', category });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour de la catégorie' });
//   }
// });
router.post('/category/:categoryId/add-subcategory', async (req, res) => {
  const categoryId = req.params.categoryId;
  const { subcategoryId } = req.body;
if (!subcategoryId) {
    return res.status(400).json({ error: 'Subcategory is required.' });
  }
  if (categoryId === subcategoryId) {
    return res.status(400).json({ error: 'Subcategory cannot be the same as the Category.' });
  }
  try {
    // Find the parent category
    const parentCategory = await Category.findById(categoryId);

    // If the parent category doesn't exist, return an error
    if (!parentCategory) {
      return res.status(404).json({ error: 'Parent category not found.' });
    }
   // Check if the subcategory already exists in the parent category's subcategories array
   const isSubcategoryExists = parentCategory.subcategories.includes(subcategoryId);

   // If the subcategory already exists, return an error
   if (isSubcategoryExists) {
     return res.status(400).json({ error: 'Subcategory already exists in the parent category' });
   }
    // Add the subcategory ID to the parent category's subcategories array
    parentCategory.subcategories.push(subcategoryId);
    await parentCategory.save();

    res.status(201).json({ message: 'Subcategory added successfully', subcategory: subcategoryId  });
  } catch (error) {
    console.error('Error adding subcategory:', error);
    res.status(500).json({ error: 'Failed to add subcategory' , subcategory: subcategoryId });
  }
});
router.delete('/category/:categoryId/delete-subcategory/:subcategoryId', async (req, res) => {
  const categoryId = req.params.categoryId;
  const subcategoryId = req.params.subcategoryId;

  try {
    // Find the parent category
    const parentCategory = await Category.findById(categoryId);

    // If the parent category doesn't exist, return an error
    if (!parentCategory) {
      return res.status(404).json({ error: 'Parent category not found.' });
    }

    // Check if the subcategory exists in the parent category's subcategories array
    const subcategoryIndex = parentCategory.subcategories.indexOf(subcategoryId);

    // If the subcategory doesn't exist, return an error
    if (subcategoryIndex === -1) {
      return res.status(404).json({ error: 'Subcategory not found in the parent category' });
    }

    // Remove the subcategory ID from the parent category's subcategories array
    parentCategory.subcategories.splice(subcategoryIndex, 1);
    await parentCategory.save();

    res.status(200).json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ error: 'Failed to delete subcategory' });
  }
});
router.get('/category/:categoryId', async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    // Find the category by its ID
    const category = await Category.findById(categoryId).populate('subcategories').exec();

    // If the category doesn't exist, return an error
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error retrieving category:', error);
    res.status(500).json({ error: 'Failed to retrieve category' });
  }
});
router.post('/addTax', async (req, res) => {
  try {
    const { name, rate, storeId } = req.body;
// console.log(name);
// console.log(rate);
// console
    // Create the new tax with the provided details
    const tax = new Tax({
      name,
      rate,
      storeId,
    });

    // Save the tax to the database
    await tax.save();

    res.status(201).json({ tax });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while adding the tax' });
  }
});

router.get('/getTax/:taxId', async (req, res) => {
  try {
    const taxId = req.params.taxId;

    // Find the tax by its ID
    const tax = await Tax.findById(taxId);
    if (!tax) {
      return res.status(404).json({ message: 'Tax not found' });
    }
    res.status(200).json({ taxes, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while getting all taxes' });
  }
});
router.get('/getTaxbystore/:store', async (req, res) => {
  try {
    const store=req.params.store
    

    const taxes = await Tax.find({storeId:store})
    
    res.status(200).json({ taxes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while getting all taxes' });
  }
});
router.get('/getAllTax/:store', async (req, res) => {
  try {
    const store=req.params.store
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalDocuments = await Tax.countDocuments();
    const totalPages = Math.ceil(totalDocuments / limit);

    const taxes = await Tax.find({storeId:store})
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ taxes, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while getting all taxes' });
  }
});
router.put('/updateTax/:taxId', async (req, res) => {
  try {
    const taxId = req.params.taxId;
    const { name, rate } = req.body;

    // Find the tax by its ID
    const existingTax = await Tax.findById(taxId);
    if (!existingTax) {
      return res.status(404).json({ message: 'Tax not found' });
    }

    // Update the tax properties
    existingTax.name = name || existingTax.name;
    existingTax.rate = rate || existingTax.rate;

    // Save the updated tax to the database
    const updatedTax = await existingTax.save();

    res.status(200).json(updatedTax);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the tax' });
  }
});

router.delete('/deleteTax/:taxId', async (req, res) => {
  try {
    const taxId = req.params.taxId;

    // Find the tax by its ID
    const existingTax = await Tax.findById(taxId);
    if (!existingTax) {
      return res.status(404).json({ message: 'Tax not found' });
    }

    // // Find and update the products that have this tax in their taxes array
    // await Product.updateMany(
    //   { taxes: taxId },
    //   { $pull: { taxes: taxId } }
    // );

    // Delete the tax from the database
    await existingTax.deleteOne();

    res.status(200).json({ message: 'Tax deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while deleting the tax' });
  }
});



router.post('/product/:productId/addTax/:taxId', async (req, res) => {
  try {
    const { productId, taxId } = req.params;

    // Find the product by productId
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the tax by taxId
    const tax = await Tax.findById(taxId);
    if (!tax) {
      return res.status(404).json({ message: 'Tax not found' });
    }

    // Add the tax to the product's taxes array if not already added
    if (!product.taxes.includes(taxId)) {
      product.taxes.push(taxId);
      await product.save();
      return res.status(200).json({ message: 'Tax added to the product', product });
    }

    return res.status(200).json({ message: 'Tax already added to the product', product });
                
  } catch (error) {
    console.error('Error adding tax to product:', error);
    res.status(500).json({ message: 'An error occurred while adding the tax to the product' });
  }
});
router.get("/getpoductwithdeatil",async(req,res)=>{
  try {
    const products = await Product.find().populate('modePrices.mode')
    if(!products)
    {
      return  res.status(404).json({message: "product not found "})
    
    }
    else 
    {
      return res.status(202).json(products)
    }
  } catch (error) {
    return res.status(504).json({message: "An error occurred "})
  }
  })
router.post('/addTaxToCategory/:categoryId/:taxId', async (req, res) => {
  try {
    const { categoryId, taxId } = req.params;

    // Find the category by its ID
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Find the tax by its ID
    const tax = await Tax.findById(taxId);
    if (!tax) {
      return res.status(404).json({ message: 'Tax not found' });
    }

    // Find all products in the category
    const productsInCategory = await Product.find({ category: categoryId });

    // Update the taxes array for each product
    for (const product of productsInCategory) {
      if (!product.taxes.includes(taxId)) {
        product.taxes.push(taxId);
        await product.save();
      }
    }

    res.status(200).json({ message: 'Tax added to products in the category' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while adding tax to the category' });
  }
});
router.delete('/product/:productId/tax/:taxId', async (req, res) => {
  try {
    const { productId, taxId } = req.params;

    // Find the product by its ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the tax by its ID
    const tax = await Tax.findById(taxId);
    if (!tax) {
      return res.status(404).json({ message: 'Tax not found' });
    }

    // Remove the tax from the product's taxes array
    product.taxes.pull(taxId);
    await product.save();

    res.status(200).json({ message: 'Tax removed from product' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while removing tax from product' });
  }
});
router.get('/products/category/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // Find products by category ID
    const products = await Product.find({ category: categoryId });

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products by category' });
  }
});
router.put('/update/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.availability = !product.availability; // Toggle the availability

    await product.save();

    res.json({ message: 'Product availability updated successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/addConsumationModes', async (req, res) => {
  try {
    const { name, description, frais, taux, applyTaux, applicationType, storeId,reduction,minOrder } = req.body;

    // Create and save the new consumation mode
    const newConsumationMode = new ConsumationMode({
      name,
      description,
      frais,
      taux,
      applyTaux,
      applicationType,
      store: storeId,
      reduction,
      minOrder,

    });
    await newConsumationMode.save();
// console.log(newConsumationMode);

    // Update the new consumation mode to the specified store with enabled set to false
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    store.consumationModes.push({ mode: newConsumationMode._id, enabled: false });
    await store.save();

    res.status(200).json({ message: 'Consumation mode added to the specified store with enabled set to false' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding consumation mode to the specified store', error });
  }
});


router.get('/getConsumationModes', async (req, res) => {
  try {
    const modes = await ConsumationMode.find();
    res.status(200).json(modes);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching consumption modes' });
  }
});
router.post('/:storeId/add-consumation-mode', async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const { modeId, enabled } = req.body; // Assuming you send modeId and enabled in the request body

    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    store.consumationModes.push({ mode: modeId, enabled: enabled });
    const updatedStore = await store.save();

    res.status(200).json(updatedStore);
  } catch (error) {
    res.status(500).json({ message: 'Error adding consumation mode to store', error });
  }
});
router.post('/add-consumation-mode', async (req, res) => {
  try {
    const { name, description } = req.body;

    // Add the new consumation mode to the ConsumationMode model
    const newConsumationMode = new ConsumationMode({ name, description });
    await newConsumationMode.save();

    // Update all stores' consumation modes with enabled set to false
    const stores = await Store.find({});

    if (!stores || stores.length === 0) {
      return res.status(404).json({ message: 'No stores found' });
    }

    const updatePromises = stores.map(async store => {
      store.consumationModes.push({ mode: newConsumationMode._id, enabled: false });
      await store.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({ message: 'Consumation mode added to all stores with enabled set to false' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding consumation mode to stores', error });
  }
});
router.get('/:storeId/consumation-modes', async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const store = await Store.findById(storeId).populate('consumationModes.mode');
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.status(200).json(store.consumationModes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching consumation modes for store', error });
  }
});
  router.get('/stores/:storeId/consumation-modes', async (req, res) => {
    try {
      const storeId = req.params.storeId;

      // Find the store by ID
      const store = await Store.findById(storeId).populate('consumationModes.mode');

      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }

      // Extract and send the consumationModes
      const consumationModes = store.consumationModes;
      res.json(consumationModes);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
// Update the enabled property of a consumationMode
router.put('/stores/:storeId/consumation-modes/:modeId/toggle', async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const modeId = req.params.modeId;

    // Find the store by ID
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Find the index of the mode in the consumationModes array
    const modeIndex = store.consumationModes.findIndex(mode => mode.mode.toString() === modeId);

    if (modeIndex === -1) {
      return res.status(404).json({ message: 'Consumation mode not found' });
    }

    // Toggle the enabled property
    store.consumationModes[modeIndex].enabled = !store.consumationModes[modeIndex].enabled;

    // Save the updated store
    await store.save();

    res.json({ message: 'Consumation mode toggled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/stores', async (req, res) => {
  try {
    const { owner, name, description, address, longitude, latitude, phoneNumber, status } = req.body;
    
  
  
    // Get all available consumationModes
    const allConsumationModes = await ConsumationMode.find();

    // Create store object with enabled false for each consumationMode
    const consumationModes = allConsumationModes.map(mode => ({
      mode: mode._id,
      enabled: false,
    }));

    // Create the new store
    const newStore = new Store({
      owner,
      name,
      description,
      address,
      longitude,
      latitude,
      phoneNumber,
      status,
      consumationModes,
    });

    // Save the new store
    const savedStore = await newStore.save();

    res.json(savedStore);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.delete('/consumation-modes/:modeId', async (req, res) => {
  try {
    const modeId = req.params.modeId;

    // Remove the mode from all stores' consumationModes arrays
    await Store.updateMany({}, { $pull: { consumationModes: { mode: modeId } } });

    // Delete the mode from the ConsumationMode collection
    await ConsumationMode.findByIdAndDelete(modeId);

    res.json({ message: 'Consumation mode deleted from all stores successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.post('/addprod',upload.single('image'), async (req, res) => {
  try {
    
    // Extract product data from request body
    //const { name, description, storeId, category, modePrices,optionGroups } = req.body;
    const name = req.body.name;
    const description = req.body.description;
    const storeId = req.body.storeId;
    const category = req.body.category;
    const modePrices = JSON.parse(req.body.modePrices);
    const optionGroups = req.body.optionGroups;
    const image = req.file.filename;
//     console.log(req.body.modePrices);
// console.log(name);
    // Create a new product
    const newProduct = new Product({
      name,
      description,
      storeId,
      category,
      modePrices,
      image,
      optionGroups
    });

    // Save the product to the database
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create product', error: error.message });
  }
});
router.post('/:productId/addModePrice', async (req, res) => {
  try {
    const productId = req.params.productId;
    const { mode, price } = req.body; // Assuming you send mode and price in the request body

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Add the new modePrice to the product's modePrices array
    product.modePrices.push({ mode, price });

    await product.save();

    return res.status(200).json({ message: 'ModePrice added successfully', product });
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});
router.get('/getProudectWithGroupOption/:storeId',async(req,res)=>
{
 try {
  const storeId= req.params.storeId;
  const product = await Product.findById(storeId)
  if(!product)
  {
    res.status(403).json({message:'product not found'})

  }
  else{
    res.status(202).json({product})
  }
 } catch (error) {
  res.status(504).json({message:'An error occurred'})
 }
}
);
router.get('/getProudectWithGroupOption/:storeId',async(req,res)=>{
  try {
    const storeId = req.params.storeId;
  const products = await Product.find({ storeId: storeId })
  .populate('optionGroups')
  if(!products)
  {
    res.status(404).json({message:'product not found'});

  }
  else
  {
    res.status(202).json({products})
  }
  } catch (error) {
    res.status(500).json({message:'An error occurred'})
  }
  
})
// router.put('/modifyOptionGroups/:id',async(req,res)=>
// {
//   try {
//     console.log(req.body)
//     const {name, description,force_max,force_min,allow_quantity} =req.body;
//    console.log(force_min);
//     const optionGroupId = req.params.id;
//     const optionGroup = await GroupeOption.findById(optionGroupId)
//     if(!optionGroup)
//     {
//       res.status(404).json({message:'Groupe d\'options non trouvé'})
//     }
//     optionGroup.name=name;
//     optionGroup.description=description;
//     optionGroup.force_max=force_max;
//     optionGroup.force_min=force_min;
//     optionGroup.allow_quantity=allow_quantity;
   
//     await optionGroup.save();
//     res.status(200).json({ message : 'groupe d\'option modifié avec succés', optionGroup })
//   } catch (error) {
//     res.status(500).json({ message: 'une erreur est survenue lors de la modification du groupe d\'option'})
//   }
// }
// );


router.put('/modifyOptionGroup/:id', upload.single('image'), async (req, res) => {
  try {
    // console.log(req.body);
    const {name, description,force_max,force_min,allow_quantity} =req.body;

    // Get the image file path from the request
    const image = req.file ? req.file.filename : undefined;

    // Find the option group by its ID
    const optionGroup = await GroupeOption.findById(req.params.id);

    // Check if the option group exists
    if (!optionGroup) {
      return res.status(404).json({ message: 'Groupe d\'options non trouvé' });
    }



    // Update the option group with the provided details, image path, and ownerId
    optionGroup.name = name;
    optionGroup.description = description;
    optionGroup.force_max=force_max;
    optionGroup.force_min=force_min;
    optionGroup.allow_quantity=allow_quantity;
    if (image) {
      optionGroup.image = image;
    }

    // Save the updated option group to the database
    await optionGroup.save();

    res.status(200).json({ message: 'Groupe d\'options modifié avec succès', optionGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la modification du groupe d\'options' });
  }
});
router.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({}).populate({
      path: 'size.optionGroups', // Populate the optionGroups field within each size
    });

    res.json(products);
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/api/products/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId).populate({
      path: 'size.optionGroups', // Populate the optionGroups field within each size
    }).populate('optionGroups')

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error retrieving product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/api/products/:productId/option-groups-with-sizes', async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId)
    .populate({
      path: 'size.optionGroups',
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product.size);
  } catch (error) {
    console.error('Error retrieving option groups with sizes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.post('/api/products/:productId/size/:sizeId/option-groups', async (req, res) => {
  const productId = req.params.productId;
  const sizeId = req.params.sizeId;
  const optionGroupId = req.body.optionGroupId; // Assuming option group ID is sent in the request body

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find the size within the product's size array by its ID
    const size = product.size.find((s) => s._id.toString() === sizeId);

    if (!size) {
      return res.status(404).json({ error: 'Size not found' });
    }

    // Ensure the optionGroups array exists in the size object
    if (!size.optionGroups) {
      size.optionGroups = [];
    }

    // Add the new option group ID to the size's optionGroups array
    if (!size.optionGroups.includes(optionGroupId)) {
      size.optionGroups.push(optionGroupId);
    }

    // Save the updated product
    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Error adding option group to size:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// router.post('/api/products/:productId/size/:sizeId/option-groups', async (req, res) => {
//   const productId = req.params.productId;
//   const sizeId = req.params.sizeId;
//   const optionGroupId = req.body.optionGroupId; // Assuming option group ID is sent in the request body

//   try {
//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     // Find the size within the product's size array by its ID
//     const size = product.size.find((s) => s._id.toString() === sizeId);

//     if (size) {
//       // If size exists, add the new option group ID to the size's optionGroups array
//       if (!size.optionGroups) {
//         size.optionGroups = [];
//       }

//       if (!size.optionGroups.includes(optionGroupId)) {
//         size.optionGroups.push(optionGroupId);
//       }
//     } else {
//       // If size does not exist, add the new option group ID to the product's optionGroups array
//       if (!product.optionGroups) {
//         product.optionGroups = [];
//       }

//       if (!product.optionGroups.includes(optionGroupId)) {
//         product.optionGroups.push(optionGroupId);
//       }
//     }

//     // Save the updated product
//     await product.save();

//     res.json(product);
//   } catch (error) {
//     console.error('Error adding option group:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
router.post('/addproduct', async (req, res) => {
  try {
    const productData = req.body;

    // Create a new product using the Product model
    const product = new Product(productData);

    // Save the product to the database
    await product.save();

    // Assuming productData contains the category ID
    const categoryId = productData.category;

    // Find the category by ID and update the products array
    await Category.findByIdAndUpdate(
      categoryId,
      { $push: { products: product._id } },
      { new: true }
    );

    // Populate the 'mode' field in the 'availabilitys' array
    await Product.populate(product, [
      { path: 'availabilitys.mode' },
      { path: 'optionGroups' },
    ]);
    res.status(201).json(product);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Error adding product' });
  }
});

router.post('/uploadImage', upload.single('image'), (req, res) => {
  // Check if an image file was uploaded
  console.warn(req.file)
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  // Get the file path where the uploaded image is stored
  const imageFilePath =req.file.filename;

  // Return a response containing the image details
  res.status(200).json({ imageURL: imageFilePath }); // You can customize the response structure
});
router.get('/ProductsByCategory/:categoryId', async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    // Use Mongoose to find products by the specified category ID
    const products = await Product.find({ category: categoryId }).populate({
      path: 'size.optionGroups', // Populate the optionGroups field within each size
    }).populate('optionGroups');

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching products.' });
  }
});
router.post('/addorders', (req, res) => {
  const newOrder = new Order(req.body);

  newOrder.save((err) => {
    if (err) {
      res.status(400).send('Unable to add the order');
    } else {
      res.status(201).json(newOrder);
    }
  });
});
router.get('/categories/:storeId', async (req, res) => {
  try {
    const storeId = req.params.storeId;
    // console.log('Requested storeId:', storeId);

    const categories = await Category.find({ store:storeId }).populate('products');
    // console.log('Categories found:', categories);

    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: 'Categories not found for the given store ID' });
    }

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.post('/duplicate/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;

    // Fetch the original product
    const originalProduct = await Product.findById(productId).exec();

    // Check if the original product exists
    if (!originalProduct) {
      return res.status(404).json({ success: false, message: 'Original product not found' });
    }

    // Convert the original product to a plain JavaScript object
    const originalProductObject = originalProduct.toObject();

    // Create a copy of the original product excluding the _id field
    const duplicatedProduct = new Product({
      ...originalProductObject,
      _id: new mongoose.Types.ObjectId(),
      name: `${originalProductObject.name} Copy`,
    });
    await duplicatedProduct.save();
    const originalImagePath = path.join(__dirname, '../uploads', originalProductObject.image);
    const newImageName = `copy_${Date.now()}_${path.basename(originalProductObject.image)}`;
    const newImagePath = path.join(__dirname, '../uploads', newImageName);

    // Use fs.promises.copyFile to ensure it returns a Promise
    await fsPromises.copyFile(originalImagePath, newImagePath);

    // Update the image property for the duplicated product
    duplicatedProduct.image = `${newImageName}`;

    // Save the duplicated product with the new image path
    await duplicatedProduct.save();
        // Add the duplicated product to the products array in the corresponding category

    await Category.findByIdAndUpdate(
      originalProduct.category,
      { $push: { products: duplicatedProduct._id } },
      { new: true }
    ).exec();
    const savedDuplicatedProduct = await Product.findById(duplicatedProduct._id).exec();

    // Define an array of paths to populate
    const pathsToPopulate = [
      { path: 'optionGroups', model: 'OptionGroup', select: '_id name' },
      { path: 'size.optionGroups', model: 'OptionGroup', select: '_id name' },
      { path: 'availabilitys.mode', model: 'ConsumationMode', select: '_id name' },
    ];
    
    // Use Mongoose's populate method to populate the specified paths
    await Product.populate(savedDuplicatedProduct, pathsToPopulate);
    
    return res.json({
      success: true,
      message: 'Product duplicated successfully',
      duplicatedProduct: savedDuplicatedProduct.toObject(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});
router.get("/orders/:storeId", async (req, res) => {
  try {
    const storeId = req.params.storeId;
    // Find orders for the given store ID
    const orders = await Order.find({ "storeId": storeId }).sort({ createdAt: -1 });
    if (!orders) {
      return res.status(404).json({ message: "No orders found for the given store ID" });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.delete('/products/:productId/size/:sizeId/optionGroup/:optionGroupId', async (req, res) => {
  const { productId, sizeId, optionGroupId } = req.params;

  try {
    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the size by ID
    const size = product.size.find(s => s._id.toString() === sizeId);

    if (!size) {
      return res.status(404).json({ message: 'Size not found' });
    }

    // Find the option group by ID in the size array
    const optionGroupIndex = size.optionGroups.indexOf(optionGroupId);

    if (optionGroupIndex === -1) {
      return res.status(404).json({ message: 'Option Group not found in the specified size' });
    }

    // Remove the option group from the size array
    size.optionGroups.splice(optionGroupIndex, 1);

    // Save the updated product
    await product.save();

    return res.status(200).json({ message: 'Option Group deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.post('/addOptionGroupToProudect/:productId/addOptionGroup/:optionGroupId', async (req, res) => {
  const { productId, optionGroupId } = req.params;
  const { optionGroupData } = req.body;

  try {
    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find the option group by ID
    const optionGroup = await GroupeOption.findById(optionGroupId);

    if (!optionGroup) {
      return res.status(404).json({ error: 'Option group not found' });
    }

    // Add the option group to the product's optionGroups array
    product.optionGroups.push(optionGroup._id);

    // Save the updated product
    await product.save();

    res.status(201).json({ success: true, optionGroup: optionGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.delete('/products/:productId/optionGroups/:optionGroupId', async (req, res) => {
  const { productId, optionGroupId } = req.params;

  try {
    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the index of the option group in the product's optionGroups array
    const optionGroupIndex = product.optionGroups.findIndex(
      (og) => og.toString() === optionGroupId
    );

    if (optionGroupIndex === -1) {
      return res.status(404).json({ message: 'Option group not found for this product' });
    }

    // Remove the option group from the array
    product.optionGroups.splice(optionGroupIndex, 1);

    // Save the updated product
    await product.save();

    res.json({ message: 'Option group deleted successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.post('/menu', async (req, res) => {
  try {
      const { name, store, currency, description, categorys } = req.body;

      const newMenu = new Menu({
          name,
          store,
          currency,
          description,
          categorys,
      });

      const savedMenu = await newMenu.save();
      res.status(201).json(savedMenu);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/getMenuByStore/:storeId', async (req, res) => {
  try {
      const storeId = req.params.storeId;

      const menu = await Menu.find({ "store": storeId })
          .populate({
              path: 'categorys',
              populate: [
                  {
                      path: 'products',
                      model: 'Product',
                      populate: [
                          {
                              path: 'size.optionGroups',
                              model: 'OptionGroup',
                          },
                          {
                              path: 'optionGroups',
                              model: 'OptionGroup',
                          },
                          {
                              path: 'taxes',
                              model: 'Tax',
                          },
                          {
                            path: 'availabilitys.mode',
                            model: 'ConsumationMode',
                          }
                      ],
                  },
                  {
                    path: 'availabilitys.mode',
                    model: 'ConsumationMode',
                  },
              ],
          })
          .exec();

      res.json(menu);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.post('/stores/:storeId/menus/:menuId', async (req, res) => {
  const { storeId, menuId } = req.params;
  const { schedule } = req.body;

  try {
    // Find the store by ID
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Find the menu by ID
    const menu = await Menu.findById(menuId);

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    // Create a new menu with schedule
    const newMenuWithSchedule = {
      menu: menu._id,
      schedule,
    };

    // Add the new menu to the store's consumationModes
    store.consumationModes[0].Menus.push(newMenuWithSchedule);

    // Save the updated store
    await store.save();

    res.status(201).json({ success: true, menuWithSchedule: newMenuWithSchedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to add a banner with image upload
router.post('/stores/:storeId/banners', upload.single('image'), async (req, res) => {
  try {
    const { description, link } = req.body;
    const storeId = req.params.storeId;
    const imageUrl = req.file ? req.file.filename : null; // Save the image path

    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Add the new banner to the store's banners array
    store.banners.push({ imageUrl, description, link });

    // Save the updated store
    await store.save();

    res.status(201).json(store);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/stores/:storeId/banners/images', async (req, res) => {
  const storeId = req.params.storeId;

  try {
    // Find the store
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Get an array of banner image URLs
    const bannerImages = store.banners.map(banner => ({
      imageUrl: banner.imageUrl,
      description: banner.description,
      link: banner.link,
    })).filter(banner => banner.imageUrl);

    res.json({ bannerImages });
  } catch (error) {
    console.error('Error retrieving banner images:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.put('/menu/:menuId/changeCategoryIndex', async (req, res) => {
  const { menuId } = req.params;
  const { oldIndex, newIndex } = req.body;

  try {
      const menu = await Menu.findById(menuId);

      // Ensure that the oldIndex and newIndex are valid indices
      if (oldIndex < 0 || oldIndex >= menu.categorys.length || newIndex < 0 || newIndex >= menu.categorys.length) {
          return res.status(400).json({ message: 'Invalid index values' });
      }

      // Remove the element from the old index
      const [removedCategory] = menu.categorys.splice(oldIndex, 1);

      // Insert the element at the new index
      menu.categorys.splice(newIndex, 0, removedCategory);

      // Save the updated menu
      await menu.save();

      res.json({ message: 'Category index changed successfully', menu });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});
router.post('/addOptionGroupToOG/:optionGroupId/:parentOptionGroupId/:optionId', async (req, res) => {
  try {
    const optionGroupId = req.params.optionGroupId; // ID of the OptionGroup to add
    const parentOptionGroupId = req.params.parentOptionGroupId; // ID of the parent OptionGroup
    const optionId = req.params.optionId; // ID of the option to associate with the OptionGroup

    // Check if the parent OptionGroup exists
    const parentOptionGroup = parentOptionGroupId
      ? await GroupeOption.findById(parentOptionGroupId)
      : null;

    if (!parentOptionGroup) {
      return res.status(404).json({ message: 'Parent OptionGroup not found' });
    }

    // Find the index of the specified option within the options array
    const optionIndex = parentOptionGroup.options.findIndex((opt) => opt._id.equals(optionId));

    // If the option is found, add the ID of the OptionGroup to the oG array of that option
    if (optionIndex !== -1) {
      parentOptionGroup.options[optionIndex].subOptionGroup.push(optionGroupId);
      // Add any additional fields you need in the parent OptionGroup's options array
    }

    await parentOptionGroup.save();
    const updatedParentOptionGroup = await GroupeOption.findById(optionGroupId);
    res.status(201).json({ message: 'OptionGroup ID added successfully to oG array', updatedParentOptionGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while adding OptionGroup ID to oG array' });
  }
});

// Route to add a product
// router.post('/addProduct2', async (req, res) => {
//   try {
//     // Extract data from the request body
//     const { name, description, availability, storeId, category, modePrice, image, size, optionGroups, taxes } = req.body;

//     // Create a new product instance
//     const newProduct = new Product({
//       name,
//       description,
//       availability,
//       storeId,
//       category,
//       modePrice,
//       image,
//       size,
//       optionGroups,
//       taxes,
//     });

//     // Save the product to the database
//     const savedProduct = await newProduct.save();

//     res.json(savedProduct);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
// router.get('/product2/:productId/mode/:modeId', async (req, res) => {
//   try {
//     const productId = req.params.productId;
//     const modeId = req.params.modeId;

//     // Find the product by ID and use lean() to get a plain JavaScript object
//     const product = await Product.findById(productId).lean();

//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     // Check if the mode is present in the modePrice array
//     const modeDetails = product.modePrice.find((modePrice) => modePrice.mode.toString() === modeId);

//     if (modeDetails) {
//       const result = {
//         name: product.name,
//         description: product.description,
//         sizeModeDetails: [],
//       };
//       res.json(result);
//       return;
//     }

//     // If not found in modePrice, check the mode in the size array
//     const result = {
//       name: product.name,
//       description: product.description,

//       sizeModeDetails: [],
//     };

//     product.size.forEach((size) => {
//       const modeInSize = size.modePrice.find((sizeMode) => sizeMode.mode.toString() === modeId);
//       if (modeInSize) {
//         result.sizeModeDetails.push({
//           sizeName: size.name,
//           modeDetails: modeInSize,
//         });
//       }
//     });

//     if (result.sizeModeDetails.length > 0) {
//       res.json(result);
//     } else {
//       res.status(404).json({ message: 'Mode not found in product' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
router.post('/add-product2', async (req, res) => {
  try {
    // Extracting data from the request body
    const {
      name,
      description,
      availabilitys,
      storeId,
      category,
      price,
      image,
      size,
      optionGroups,
      taxes,
    } = req.body;

    // Creating a new product instance
    const newProduct = new Product({
      name,
      description,
      availabilitys,
      storeId,
      category,
      price,
      image,
      size,
      optionGroups,
      taxes,
    });

    // Saving the new product to the database
    const savedProduct = await newProduct.save();

    // Sending the saved product as a response
    res.json(savedProduct);
  } catch (error) {
    // Handling errors
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/product-details/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find the product by ID
    const product = await Product.findById(productId)
      .populate({
        path: 'taxes',
        model: Tax,
        populate: {
          path: 'mode',
          model: ConsumationMode,
        },
      })
      .populate({
        path: 'availabilitys.mode',
        model: ConsumationMode,
      })
      .exec();

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})


// API endpoint to get product details with specific tax and availability modes based on a single mode ID
router.get('/product-details/:productId/:modeId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const modeId = req.params.modeId;

    const product = await Product.findById(productId)
      .populate({
        path: 'taxes',
        match: { 'mode': modeId },
 
      })
      .populate({
        path: 'availabilitys',
        match: { 'mode': modeId },
      })
      .exec();

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { _id, name, description, availabilitys, storeId, category, price, image, taxes } = product;

    // Extract only relevant details for the specified mode ID
    const filteredProduct = {
      _id,
      name,
      description,
      availabilitys: availabilitys.filter(avail => avail.mode.toString() === modeId),
      storeId,
      category,
      price,
      image,
      taxes: taxes.filter(tax => tax.mode.toString() === modeId),
    };

    res.json(filteredProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/products-by-category/:categoryId/:modeId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const modeId = req.params.modeId;

    const products = await Product.find({ category: categoryId }).populate({
      path: 'size.optionGroups', // Populate the optionGroups field within each size
    }).populate('optionGroups')
      .populate({
        path: 'taxes',
        match: { 'mode': modeId },
        select: 'mode',
       
      })
      .populate({
        path: 'availabilitys',
        match: { 'mode': modeId },
        select: 'mode',
      })
      .exec();

    // Filter products based on the specified mode ID
    const filteredProducts = products.map(product => {
      const { _id, name, description, availabilitys,size,optionGroups, storeId, category, price, image, taxes } = product;

      return {
        _id,
        name,
        description,
        availabilitys: availabilitys.filter(avail => avail.mode.toString() === modeId),
        size,
        optionGroups,
        storeId,
        category,

        price,
        image,
        taxes: taxes.filter(tax => tax.mod === modeId),
      };
    });

    res.json(filteredProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//get product By Category
router.get("/productByCategory/:categoryId", async (req, res) => {
  const categoryId = req.params.categoryId;
  if (!categoryId) {
    return res.status(400).json({
      message: "category ID Not found .",
    });
  }
  const product = await Product.find({ category: categoryId }).populate({
    path: 'size.optionGroups', // Populate the optionGroups field within each size
  }).populate('optionGroups');

  if (!product) {
    return res.status(404).json({
      message: "Product not found.",
    });
  }
  return res.json(product);
});
router.get('/products-by-store/:storeId/:modeId', async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const modeId = req.params.modeId;

    const products = await Product.find({ storeId: storeId }).populate({
      path: 'size.optionGroups',
    }).populate('optionGroups')
      .populate({
        path: 'taxes',
        match: { 'mode': modeId },
        select: 'mode',
      })
      .populate({
        path: 'availabilitys',
        match: { 'mode': modeId },
        select: 'mode',
      })
      .exec();

    // Filter products based on the specified mode ID
    const filteredProducts = products.map(product => {
      const { _id, name, description, availabilitys, size, optionGroups, storeId, category, price, image, taxes } = product;

      return {
        _id,
        name,
        description,
        availabilitys: availabilitys.filter(avail => avail.mode.toString() === modeId),
        size,
        optionGroups,
        storeId,
        category,
        price,
        image,
        taxes: taxes.filter(tax => tax.mode.toString() === modeId),
      };
    });

    res.json(filteredProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.put('/products/:productId/mode/:modeId/toggle-availability', async (req, res) => {
  try {
    const productId = req.params.productId;
    const modeId = req.params.modeId;

    // Find the product by ID
    const product = await Product.findById(productId);

    // Find the mode within the product's availabilitys array
    const mode = product.availabilitys.find((item) => item.mode.equals(modeId));

    if (!mode) {
      return res.status(404).json({ message: 'Mode not found in product availabilitys' });
    }

    // Toggle the availability
    mode.availability = !mode.availability;
    const etat =mode.availability

    // Save the updated product
    await product.save();

    res.json({ message: 'Availability toggled successfully', etat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.put('/category/:categoryId/mode/:modeId/toggle-availability', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const modeId = req.params.modeId;

    // Find the product by ID
    const category = await Category.findById(categoryId);

    // Find the mode within the product's availabilitys array
    const mode = category.availabilitys.find((item) => item.mode.equals(modeId));

    if (!mode) {
      return res.status(404).json({ message: 'Mode not found in product availabilitys' });
    }

    // Toggle the availability
    mode.availability = !mode.availability;
    const etat =mode.availability

    // Save the updated product
    await category.save();

    res.json({ message: 'Availability toggled successfully', etat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.put('/products/:productId/toggle-availability', async (req, res) => {
  const { productId } = req.params;

  try {
    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Toggle the availability
    product.availability = !product.availability;

    // Save the updated product
    const updatedProduct = await product.save();

    // Respond with the updated product
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.put('/categorys/:categoryId/toggle-availability', async (req, res) => {
  const { categoryId } = req.params;

  try {
    // Find the product by ID
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Toggle the availability
    category.availability = !category.availability;

    // Save the updated product
    const updatedCategory = await category.save();

    // Respond with the updated product
    res.json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//deleteStores
router.delete('/deleteStores/:storeId', checkOwner, async (req, res) => {
  try { const storeId = req.params.storeId;
    const store = await Store.findById(storeId);
    if (!store) {  return res.status(404).json({ message: 'Magasin non trouvé' }); }
    await Store.findByIdAndRemove(storeId);
    await ConsumationMode.deleteMany({ store: storeId });
    await Menu.deleteMany({ store: storeId });
    await User.updateOne({ _id: store.owner }, { $pull: { stores: storeId } });
    await Company.updateMany({}, { $pull: { stores: storeId } });
// console.log(Company)
    res.json({ message: 'Magasin et les modes de consommation associés ont été supprimés avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la suppression du magasin et de ses modes de consommation' });
  }
});
//getstoresById
router.get('/getStoresById/:id', checkOwner, async (req, res) => {
  try {
    const storesId = req.params.id;
    // Retrieve the owner from the database based on the provided ID
    const stores = await Store.findById(storesId);
    if (!stores) {
      return res.status(404).json({ message: 'stores not found' });
    }
    res.json(stores);
    // console.log(stores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while retrieving the stores' });
  }
});
//addStores
router.post('/addStores', upload.single('image'), async (req, res) => {
  try {
    const { ownerId, name, description, address, phoneNumber, latitude, longitude, rangeValue ,primairecolor,secondairecolor,companyId} = req.body;
    const owner = await User.findById(ownerId);
    const image = req.file ? req.file.filename : '';
    const campany = await Company.findById(companyId);
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    const store = new Store({
      owner: ownerId,
      name,
      description,
      address,
      phoneNumber,
      latitude,
      longitude,
      rangeValue,
      logo: image,
      primairecolor,
      secondairecolor,
      companyId
    });
    // Save the store to the database
    await store.save();
    // Add the created store to the owner's list of stores
    owner.stores.push(store._id);
    await owner.save();
     // Add the created store to the owner's list of stores
     campany.stores.push(store._id);
     await campany.save();
// console.log("campany",campany)
    res.status(201).json({ message: 'Store created successfully', store });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating the store' });
  }
});
// update Stores
router.put('/updateStores/:storesId', upload.single('logo'), async (req, res) => {
  const { ownerId, name, description, address, phoneNumber, latitude, longitude, rangeValue,primairecolor,secondairecolor } = req.body;
  const storesId = req.params.storesId;
  const image = req.file ? req.file.filename : '';
  try {
    const store = await Store.findById(storesId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    if (req.file) {
      store.logo = req.file.filename;
    }
    store.owner = ownerId.toString();
    store.name = name;
    store.description = description;
    store.address = address;
    store.phoneNumber = phoneNumber;
    store.latitude = latitude;
    store.longitude = longitude;
    store.rangeValue = rangeValue;
    store.primairecolor = primairecolor;
    store.secondairecolor = secondairecolor;
   await store.save();
    res.json({ message: 'Store information updated successfully', store });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.post('/api/products/:productId/availability', async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If the request contains 'availability', update the product's overall availability
    if (req.body.hasOwnProperty('availability')) {
      product.availability = req.body.availability;
    }

    // If the request contains 'availabilitys', add new availabilities only if they are not already present
    if (req.body.hasOwnProperty('availabilitys')) {
      const newAvailabilities = req.body.availabilitys.map((availability) => ({
        availability: availability.availability,
        mode: availability.mode,
      }));

      for (const newAvailability of newAvailabilities) {
        const isDuplicate = product.availabilitys.some(
          (existingAvailability) =>
            existingAvailability.mode.toString() === newAvailability.mode.toString()
        );

        if (!isDuplicate) {
          product.availabilitys.push(newAvailability);
        }
      }
    }

    const savedProduct = await product.save();
    res.json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/api/categorys/:categoryId/availability', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'category not found' });
    }

    // If the request contains 'availability', update the product's overall availability
    if (req.body.hasOwnProperty('availability')) {
      category.availability = req.body.availability;
    }

    // If the request contains 'availabilitys', add new availabilities only if they are not already present
    if (req.body.hasOwnProperty('availabilitys')) {
      const newAvailabilities = req.body.availabilitys.map((availability) => ({
        availability: availability.availability,
        mode: availability.mode,
      }));

      for (const newAvailability of newAvailabilities) {
        const isDuplicate = category.availabilitys.some(
          (existingAvailability) =>
            existingAvailability.mode.toString() === newAvailability.mode.toString()
        );

        if (!isDuplicate) {
          category.availabilitys.push(newAvailability);
        }
      }
    }

    const savedCategory = await category.save();
    res.json(savedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
//getcompanybyouners
router.get('/getcompanyByouners/:ownersId', async (req, res) => {
  const ownersId = req.params.ownersId;
  try {
    const owner = await User.findById(ownersId);
    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    const company = await Company.findOne({ owners: ownersId });
    if (!company) {
      return res.status(404).json({ error: 'Company not found for the given owner' });
    }
    res.status(200).json({ companyId: company._id });
  } catch (error) {
    console.error('Error retrieving company:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//Company
// AddCompany
router.post('/addCompany', upload.single('image'), async (req, res) => {
  try {
    const { ownerId, name, legalstatus, duns, address, phone, email, website } = req.body;
    // Handle the case where req.file is undefined
    const image = req.file ? req.file.filename : '';
    // console.log(image);
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    const store = new Store({
      owner: ownerId,
      name: 'Default Store',
      description: 'Default Store Description',
      address: 'Default Store Address',
      phoneNumber: '1234567890',
      latitude: 0,
      longitude: 0,
      rangeValue: 25,
      primairecolor: '#000000',
      secondairecolor: '#000000',
    });
    await store.save();
    owner.stores.push(store._id);
    await owner.save();
    const defaultModes = [
      { name: 'Delivery', description: 'Mode Livraison' },
      { name: 'Takeaway', description: 'Mode Takeaway' },
      { name: 'Dine-in', description: 'Mode Dine-in' },
    ];
    for (const modeData of defaultModes) {
      const mode = new ConsumationMode({
        name: modeData.name,
        description: modeData.description,
        frais: 0,
        taux: 0,
        applyTaux: false,
        applicationType: 'product',
        reduction: 0,
        store: store._id,
      });
      await mode.save();
      store.consumationModes.push({
        mode: mode._id,
        enabled: true,
      });
    }
    await store.save();
    const menu = new Menu({
      store: store._id,  // Use store._id as the owner of the menu
      name: 'Menu Item',
      description: 'Menu Item',
      currency: 'USD',
    });
    await menu.save();
    const company = new Company({
      owners: ownerId,
      name,
      legalstatus,
      duns,
      address,
      phone,
      email,
      website,
      stores: [store._id],
      CompanyLogo: image,
    });
    await company.save();
    store.companyId = company._id;
    await store.save();
    owner.company = company._id;
    await owner.save();
    res.status(201).json({ message: 'Company created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating the Company' });
  }
});
//addcolor
router.post('/stores/:storeId/colors', async (req, res) => {
  try {
    const   primairecolor = req.body.primairecolor;
    const   secondairecolor = req.body.secondairecolor;
    const storeId = req.params.storeId;
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    store.primairecolor=primairecolor,
    store.secondairecolor=secondairecolor;
    // Save the updated store
    await store.save();
    res.status(201).json(store);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Get Color
router.get('/stores/:storeId/colors', async (req, res) => {
  const storeId = req.params.storeId;
  try {
    //const storeId = req.params.storeId;
    // console.log('Requested storeId:', storeId);
    const store = await Store.findById(storeId);
    // console.log('Retrieved store:', store);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.status(200).json({
      primairecolor: store.primairecolor,
      secondairecolor: store.secondairecolor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}); 



//orders
router.get("/orders/:storeId", async (req, res) => {
  try {
    const storeId = req.params.storeId;
    // console.log(storeId);
    // Find orders for the given store ID
    const orders = await Order.find({ "storeId": storeId });
    // console.log(orders);
    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for the given store ID" });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
//getorderbyid
router.get('/getOrdersById/:id', checkOwner, async (req, res) => {
  try {
    const orderId = req.params.id;
    // Retrieve the owner from the database based on the provided ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'stores not found' });
    }
    res.json(order);
    // console.log(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while retrieving the stores' });
  }
});
//update orders  status
// update Orders
router.put('/updateOrders/:storesId', async (req, res) => {
  const orderId = req.params.storesId;
  const status = req.body.Data;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Extract the status from the request body
// console.log(status)
    // Update the order status
    order.status = status;
    await order.save();
    res.json({ message: 'Order information updated successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.delete('/option-groups/:groupId/options/:optionId',async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const optionId = req.params.optionId;

    // Find the option group by ID
    const optionGroup = await GroupeOption.findById(groupId);

    if (!optionGroup) {
      return res.status(404).json({ error: 'Option group not found' });
    }

    // Find the index of the option to be deleted
    const optionIndex = optionGroup.options.findIndex(opt => opt._id.toString() === optionId);

    if (optionIndex === -1) {
      return res.status(404).json({ error: 'Option not found in the option group' });
    }

    // Remove the option from the options array
    optionGroup.options.splice(optionIndex, 1);

    // Save the updated option group
    await optionGroup.save();

    return res.status(200).json({ message: 'Option deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.put('/option/:groupId/:optionId', async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const optionId = req.params.optionId;

    // Assuming req.body contains the updated properties (price, isDefault)
    const { price, isDefault } = req.body;

    // Find the OptionGroup by groupId
    const optionGroup = await GroupeOption.findById(groupId);
    if (!optionGroup) {
      return res.status(404).json({ message: 'OptionGroup not found' });
    }

    // Find the index of the option within the options array
    const optionIndex = optionGroup.options.findIndex(
      (opt) => opt._id.toString() === optionId
    );

    if (optionIndex === -1) {
      return res.status(404).json({ message: 'Option not found within OptionGroup' });
    }

    // Update the properties
    if (price !== undefined) {
      optionGroup.options[optionIndex].price = price;
    }

    if (isDefault !== undefined) {
      optionGroup.options[optionIndex].isDefault = isDefault;
    }

    // Save the updated OptionGroup
    await optionGroup.save();

    res.json({ message: 'Option updated successfully', optionGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.delete('/:optionGroupId/options/:optionId/subOptionGroups/:subOptionGroupId', async (req, res) => {
  const { optionGroupId, optionId, subOptionGroupId } = req.params;

  try {
    // Find the parent optionGroup by ID
    const optionGroup = await GroupeOption.findById(optionGroupId);

    // Check if the optionGroup exists
    if (!optionGroup) {
      return res.status(404).json({ error: 'OptionGroup not found' });
    }

    // Find the specified option within the optionGroup
    const option = optionGroup.options.find(opt => opt._id == optionId);

    // Check if the option exists
    if (!option) {
      return res.status(404).json({ error: 'Option not found' });
    }

    // Find the index of the subOptionGroup to be deleted within the specified option
    const subOptionGroupIndex = option.subOptionGroup.indexOf(subOptionGroupId);

    // Check if the subOptionGroup exists
    if (subOptionGroupIndex === -1) {
      return res.status(404).json({ error: 'SubOptionGroup not found' });
    }

    // Remove the subOptionGroup from the array within the specified option
    option.subOptionGroup.splice(subOptionGroupIndex, 1);

    // Save the updated optionGroup
    await optionGroup.save();

    res.json({ message: 'SubOptionGroup deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.put('/products/:productId/changeOptionGroupIndex', async (req, res) => {
  const { productId } = req.params;
  const { oldIndex, newIndex } = req.body;

  try {
    const product = await Product.findById(productId);

    // Ensure that the oldIndex and newIndex are valid indices
    if (oldIndex < 0 || oldIndex >= product.optionGroups.length || newIndex < 0 || newIndex >= product.optionGroups.length) {
      return res.status(400).json({ message: 'Invalid index values' });
    }

    // Remove the element from the old index
    const [removedOptionGroup] = product.optionGroups.splice(oldIndex, 1);

    // Insert the element at the new index
    product.optionGroups.splice(newIndex, 0, removedOptionGroup);

    // Save the updated product
    await product.save();

    res.json({ message: 'OptionGroup index changed successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.post('/addOptionGroupsWithCategory/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // Retrieve the category
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get the option group ObjectId to add
    const optionGroupIdToAdd = req.body.optionGroup; // Make sure you provide the optionGroup as a single ObjectId in the request body

    if (!optionGroupIdToAdd) {
      return res.status(400).json({ message: 'OptionGroup must be a valid ObjectId' });
    }

    // Update all products of the category with the new option group ObjectId
    await Product.updateMany({ category: categoryId }, { $addToSet: { optionGroups: optionGroupIdToAdd } });

    res.json({ message: 'Option group added to all products of the category' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.put('/products/:productId/changeSizeOptionGroupIndex', async (req, res) => {
  const { productId } = req.params;
  const { sizeIndex, oldIndex, newIndex } = req.body;
  
  try {
    const product = await Product.findById(productId);

    // Ensure that the sizeIndex, oldIndex, and newIndex are valid indices
   

    // Remove the element from the old index
    const [removedOptionGroup] = product.size[sizeIndex].optionGroups.splice(oldIndex, 1);

    // Insert the element at the new index
    product.size[sizeIndex].optionGroups.splice(newIndex, 0, removedOptionGroup);

    // Save the updated product
    await product.save();

    res.json({ message: 'OptionGroup index changed successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



//nesrine 
//Api openingHours
router.get('/opening-hours', async (req, res) => {
  try {
    const store = await Store.findById('storeId');
    const openingHours = store.openingdate.map(day => ({
      isOpen: day.isOpen,
      shifts: day.shifts
    }));
    res.json({ openingHours });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.post('/update-opening-hours/:storeId', async (req, res) => {
  try {
    const storeId = req.params.storeId;
    // console.log('Received storeId:', storeId);
    // console.log('Received data:', req.body);
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    let currentOpeningDates = store.openingdate || [];
    if (currentOpeningDates.length >= 2) {
      currentOpeningDates.shift(); // Remplacez cette ligne pour une autre logique si nécessaire
    }
    const newOpeningDate = req.body;
    const filteredDays = Object.entries(newOpeningDate.jour)
      .filter(([day, details]) => details.isOpen)
      .reduce((acc, [day, details]) => {
        acc[day] = details;
        return acc;
      }, {});
    currentOpeningDates.push({
      shifts: newOpeningDate.shifts,
      jour: filteredDays,
    });
    store.openingdate = currentOpeningDates;
    await store.save();
    res.json({ message: 'Opening hours updated successfully for selected days', store });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/get-opening-hours/:storeId', async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.json({ openingHours: store.openingdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.delete('/deletehours/:storeId/:idHours', async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const idHours = req.params.idHours;
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store non trouvé' });
    }
    const openingDateIndex = store.openingdate.findIndex(date => date._id == idHours);
    if (openingDateIndex === -1) {
      return res.status(404).json({ message: 'Opening date non trouvé' });
    }
    store.openingdate.splice(openingDateIndex, 1);
    await store.save();
    res.json({ message: 'hours supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la suppression du magasin' });
  }
});
router.get('/gethoursbyid/:storeId/:idHours', async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const idHours = req.params.idHours;
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    const foundHours = store.openingdate.find(hour => hour._id.toString() === idHours);
    if (!foundHours) {
      return res.status(404).json({ error: 'Opening hours not found' });
    }
    res.json({ openingHours: foundHours });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.put('/updatehoraire/:storeId/:idHours', async (req, res) => {
  const storeId = req.params.storeId;
  const idHours = req.params.idHours;
  try {
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store non trouvé' });
    }
    const heure = store.openingdate.find(item => item._id.toString() === idHours);
    if (!heure) {
      return res.status(404).json({ message: 'Horaire non trouvé' });
    }
    const filteredDays = {};
    Object.keys(req.body.jour).forEach(day => {
      if (req.body.jour[day].isOpen) {
        filteredDays[day] = req.body.jour[day];
      }
    });
    if (req.body.shifts && req.body.shifts.start && req.body.shifts.end) {
      heure.shifts.start = req.body.shifts.start;
      heure.shifts.end = req.body.shifts.end;
    } else {
      return res.status(400).json({ message: 'Données de shift invalides' });
    }
    heure.jour = filteredDays;
    await store.save();
    res.json({ message: 'Horaire mis à jour avec succès', store });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne du serveur', error });
  }
});
//finHours
//updatemode
router.put('/updateConsommation/:modeId', async (req, res) => {
  const modeId = req.params.modeId;
  try {
    const mode = await ConsumationMode.findById(modeId);
    if (!mode) {
      return res.status(404).json({ message: 'Mode not found' });
    }
    // Mise à jour des propriétés du mode
    mode.name = req.body.name;
    mode.description = req.body.description;
    mode.frais = req.body.frais;
    mode.taux = req.body.taux;
    mode.applyTaux = req.body.applyTaux;
    mode.applicationType = req.body.applicationType;
    mode.reduction = req.body.reduction;
    // Sauvegarde de l'instance mode
    await mode.save();
    res.json({ message: 'Mode information updated successfully', mode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//update Mode consommation
router.get('/getConsommation/:id', checkOwner, async (req, res) => {
  try {
    const modeId = req.params.id;
    // Retrieve the owner from the database based on the provided ID
    const mode = await ConsumationMode.findById(modeId);
    if (!mode) {
      return res.status(404).json({ message: 'mode not found' });
    }
    res.json(mode);
    // console.log(mode);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while retrieving the stores' });
  }
});
router.put('/categories/:categoryId/update-image', upload.single('image'), async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    // Find the category by ID
    const category = await Category.findById(categoryId);

    // If the category doesn't exist, return an error
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const oldImageFilename = category.image;

    category.image = req.file.filename;


    // Save the updated category
    const updatedCategory = await category.save();
    const imagePath = path.join(__dirname, '../uploads', oldImageFilename);
    await fsPromises.unlink(imagePath);
    // Return the updated category as the response
    res.json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.put('/products/:productId/update-image', upload.single('image'), async (req, res) => {
  const productId = req.params.productId;

  try {
    // Find the product by ID
    const product = await Product.findById(productId);

    // If the product doesn't exist, return an error
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const oldImageFilename = product.image;
    // Update the product's image
    product.image = req.file.filename;

    // Save the updated product
    const updatedProduct = await product.save();
    const imagePath = path.join(__dirname, '../uploads', oldImageFilename);
    await fsPromises.unlink(imagePath);
    // Return the updated product as the response
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.put('/options/:optionId/update-image', upload.single('image'), async (req, res) => {
  const optionId = req.params.optionId;

  try {
    // Find the product by ID
    const option = await ProductOption.findById(optionId);

    // If the product doesn't exist, return an error
    if (!option) {
      return res.status(404).json({ error: 'option not found' });
    }
    const oldImageFilename = option.image;
    // Update the product's image
    option.image = req.file.filename;

    // Save the updated product
    const updatedOption = await option.save();
    const imagePath = path.join(__dirname, '../uploads', oldImageFilename);
    await fsPromises.unlink(imagePath);
    // Return the updated product as the response
    res.json(updatedOption);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//fin mode
//Api Promo
//addPromo
router.post('/promo', upload.single('image'), async (req, res) => {
  try {
    const { storeId, name, numberGroup, number2, discount, availability } = req.body;
    const image = req.file ? req.file.filename : '';
    const promos = JSON.parse(req.body.promos);
    const availabilitys = JSON.parse(req.body.availabilitys);
    const existingStore = await Store.findById(storeId);
    if (!existingStore) {
      return res.status(404).json({ message: 'Associated store not found' });
    }
    const promo = new Promo({
      storeId,
      name,
      numberGroup,
      number2,
      image: image,
      promos: promos,
      discount,
      availability,
      availabilitys: availabilitys,
    });
    const savedPromo = await promo.save();
    const menu = await Menu.findOne({ store: storeId });
    if (!menu) {
      console.error('Menu not found for the store ID:', storeId);
      return res.status(404).json({ message: 'Menu not found for the store' });
    }
  
    menu.promos = menu.promos || [];
    menu.promos.push(savedPromo._id);
    await menu.save();
    res.status(201).json({ message: 'Promo created successfully', promo: savedPromo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating the promo' });
  }
});
router.get('/getpromos/:storeId', async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const promos = await Promo.find({ storeId: storeId });
    if (!promos) {
      return res.status(404).json({ error: 'Promos not found for the specified storeId' });
    }
    res.json(promos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//deletePromo
router.delete('/deletePromo/:prompId', checkOwner, async (req, res) => {
  try {
    const prompId = req.params.prompId;
    // Find the promo to be deleted
    const promo = await Promo.findById(prompId);
    if (!promo) {
      return res.status(404).json({ message: 'Promo not found' });
    }
    // Remove the promo from the menu
    await Menu.updateOne({ promos: prompId }, { $pull: { promos: prompId } });
    // Delete the promo
    await Promo.findByIdAndRemove(prompId);
    res.json({ message: 'Promo deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while deleting the promo' });
  }
});
// update Promo
router.put('/updatePromoAvailability/:prompId', async (req, res) => {
  const prompId = req.params.prompId;
  try {
    const promo = await Promo.findById(prompId);
    if (!promo) {
      return res.status(404).json({ message: 'Promo not found' });
    }
    promo.availability = req.body.availability;
    await promo.save();
    res.json({ message: 'Promo availability updated successfully', promo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.get('/getPromoById/:promoId', checkOwner, async (req, res) => {
  try {
    const promoId = req.params.promoId;
    const promo = await Promo.findById(promoId);
    if (!promo) {
      return res.status(404).json({ message: 'promo not found' });
    }
    res.json(promo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while retrieving the promo' });
  }
});
router.get('/getcategorieById/:Id', checkOwner, async (req, res) => {
  try {
    const Id = req.params.Id;
    const categorie = await Category.findById(Id);
    if (!categorie) {
      return res.status(404).json({ message: 'categorie not found' });
    }
    res.json(categorie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while retrieving the promo' });
  }
});
router.put('/updatePromo/:promoId', upload.single('image'), async (req, res) => {
  try {
    const { storeId, name, numberGroup, number2, discount, availability } = req.body;
    const image = req.file ? req.file.filename : '';
    const promos = JSON.parse(req.body.promos);
    const availabilitys = JSON.parse(req.body.availabilitys);
    const existingPromo = await Promo.findById(req.params.promoId);
    if (!existingPromo) {
      return res.status(404).json({ message: 'Promo not found' });
    }
    if (req.file) {
      existingPromo.image = req.file.filename;
    }
    existingPromo.storeId = storeId;
    existingPromo.name = name;
    existingPromo.numberGroup = numberGroup;
    existingPromo.number2 = number2;
    existingPromo.discount = discount;
    existingPromo.availability = availability;
    existingPromo.promos = promos;
    existingPromo.availabilitys = availabilitys;
    const updatedPromo = await existingPromo.save();
    res.json({ message: 'Promo information updated successfully', updatedPromo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.delete('/promo/:promoId/object/:objectId', async (req, res) => {
  try {
    const { promoId, objectId } = req.params;
    const promo = await Promo.findById(promoId);
    if (!promo) {
      return res.status(404).json({ message: 'Promo not found' });
    }
    let currentNumberGroup = promo.numberGroup || 0;
    await promo.updateOne({ $pull: { promos: { _id: objectId } }, $set: { numberGroup: currentNumberGroup - 1 } }).exec();
    res.status(200).json({ message: 'Object deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.post('/AddGrouppromo', async (req, res) => {
  // console.log(req.body);
  try {
    const { promoid, selectedData2 } = req.body;
    const existingPromo = await Promo.findByIdAndUpdate(
      promoid,
      {$push: {
          promos: {
            products: selectedData2.products,
            category: selectedData2.categoryId,
            order: selectedData2.order
          } },  $inc: {  numberGroup: 1 }
      },  { new: true }
    );
    if (!existingPromo) {
      return res.status(404).json({ message: 'Promo not found' });
    }
    res.status(201).json({ message: 'Promos added successfully', promo: existingPromo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while adding promos' });
  }
});
router.put('/promogroup', async (req, res) => {
  try {
    // console.log(req.body);
    const { promos } = req.body; // Supposons que le corps de la requête contient les nouvelles données de promotion
    // Mettre à jour chaque promotion avec les nouvelles données et les nouveaux ordres
    for (let i = 0; i < promos.length; i++) {
      const promoId = promos[i]._id;
      const newOrder = promos[i].order; // Utilisez promos[i].order au lieu de promos.order
      // console.log(promoId,newOrder)
      await Promo.updateOne({ 'promos._id': promoId }, { $set: { 'promos.$.order': newOrder } });
    }
    res.status(200).json({ message: 'Promotions updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.put('/orderPromo', async (req, res) => {
  try {
    const orderUpdates = req.body; // Assurez-vous que req.body est un tableau d'objets
    const promises = orderUpdates.map(async ({ promoId, newOrder }) => {
      const existingPromo = await Promo.findOneAndUpdate(
        { 'promos._id': promoId },
        { $set: { 'promos.$.order': newOrder } },
        { new: true } // Utiliser l'option { new: true } pour obtenir le document mis à jour après la modification
      );
      if (!existingPromo) {
        return { promoId, success: false };
      }
      // Mettre à jour les ordres des autres promos
      await Promo.updateMany(
        { _id: existingPromo._id, 'promos.order': { $gt: existingPromo.promos.length } },
        { $inc: { 'promos.$.order': 1 } }
      );
      return { promoId, success: true };
    });
    // Attendre toutes les mises à jour avant de répondre
    await Promise.all(promises);
    res.status(200).json({ message: 'Promos updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating promos' });
  }
});

//fin Api Promo
// active or disactive store
router.put("/store/changestatus", async (req, res) => {
  const { _id, active } = req.body;
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
router.post('/addcoupons', async (req, res) => {
  try {
    const { discount, storeId,prefix, startDate, endDate } = req.body;

    // Validate discount value
    if (typeof discount !== 'number' || discount <= 0 || discount > 100) {
      return res.status(400).json({ error: 'Invalid discount value' });
    }

    // Validate storeId
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({ error: 'Invalid storeId' });
    }

    // Validate start and end dates
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: 'Invalid date range' });
    }

    // Generate a new coupon code using voucher-code-generator
    const newCouponCode = voucherCode.generate({
      length: 8,
      count: 1,
      prefix: prefix+"-",
    })[0];

    // Create a new coupon
    const newCoupon = new Coupon({
      code: newCouponCode,
      discount,
      storeId,
      startDate,
      endDate,
    });

    await newCoupon.save();

    res.status(201).json({  newCoupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/coupons/:storeId', async (req, res) => {
  try {
    const storeId = req.params.storeId;

    // Validate storeId
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({ error: 'Invalid storeId' });
    }

    // Retrieve coupons for the specified store
    const coupons = await Coupon.find({ storeId });

    res.status(200).json(coupons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/coupons/:couponId', async (req, res) => {
  try {
    const couponId = req.params.couponId;

    // Validate couponId
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      return res.status(400).json({ error: 'Invalid couponId' });
    }

    // Delete the coupon by its ObjectId
    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

    if (!deletedCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.post('/coupons/use/:couponCode', async (req, res) => {
  try {
    const couponCode = req.params.couponCode;

    // Validate couponCode
    if (typeof couponCode !== 'string' || couponCode.trim() === '') {
      return res.status(400).json({ error: 'Invalid couponCode' });
    }

    // Find the coupon by its code
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    // Check if the current date is within the coupon's validity interval
    const currentDate = new Date();
    if (coupon.startDate && currentDate < new Date(coupon.startDate)) {
      return res.status(400).json({ error: 'Coupon is not yet valid' });
    }

    if (coupon.endDate && currentDate > new Date(coupon.endDate)) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    // Increment the numberOfUses attribute
    coupon.numberOfUses += 1;

    // Save the updated coupon
    await coupon.save();

    res.status(200).json({ message: 'Coupon used successfully', numberOfUses: coupon.numberOfUses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/total-customers/:storeId/", async (req, res) => {
  let storeid = req.params.storeId;
  try {
    storeid = storeid.trim();
    // console.log("Received storeId:", storeid);

    // Check if storeId is a valid string
    if (typeof storeid !== 'string') {
      // console.log("Invalid storeId");
      return res.status(400).json({ error: "Invalid storeId" });
    }

    const result = await Order.aggregate([
      {
        $match: {
          storeId: new mongoose.Types.ObjectId(storeid)
        },
      },
      {
        $group: {
          _id: "$client_email",
        },
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
        },
      },
    ]);

    // console.log("Aggregation Result:", result);

    if (result.length > 0) {
      res.json({ totalCustomers: result[0].totalCustomers });
    } else {
      res.json({ totalCustomers: 0 });
    }
  } catch (error) {
    console.error("Error getting total customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }

});
router.get('/getpromos/:storeId/:idMode', async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const idMode = req.params.idMode;
    const promos = await Promo.find({
      storeId: storeId,
    })

      .exec();
      // const filteredAvailabilitys = promos.availabilitys.filter((item) => item.mode.toString() === idMode.toString());
    res.status(200).json({
      message: 'Promos retrieved successfully.',
      promos: promos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error?.message });
  }
});
router.get("/promos-by-store/:storeId/:modeId", async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const modeId = req.params.modeId;
    
    // Find promos based on storeId and filter by modeId
    const promos = await Promo.find({ storeId: storeId })

    // Filter promos based on the specified mode ID in availabilitys
    const filteredPromos = promos.map((promo) => {
      const {
        _id,
        name,
        numberGroup,
        number2,
        image,
        promos,
        category,
        order,
        discount,
        availability,
        availabilitys,
      } = promo;

      const filteredAvailabilitys = availabilitys.filter(
        (avail) => avail.mode.toString() === modeId
      );

      return {
        _id,
        name,
        numberGroup,
        number2,
        image,
        promos,
        category,
        order,
        discount,
        availability,
        availabilitys: filteredAvailabilitys,
      };
    });

    res.status(200).json(filteredPromos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;




