import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("Missing MongoDB URI. Set MONGODB_URI (or MONGO_URI) in .env");
  process.exit(1);
}

mongoose.set("strictQuery", false);

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB - WaterCane Database");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

await connectDB();


const vendorSchema = new mongoose.Schema(
  {
    vendorName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    Area: {
      type: String,
      required: true,
      trim: true,
    },
    Address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const brandSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    newTask: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    selectqty: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// ==================== MODELS ====================

const Vendor = mongoose.model("Vendor", vendorSchema);
const Brand = mongoose.model("Brand", brandSchema);
const Product = mongoose.model("Product", productSchema);

// ==================== VENDOR FUNCTIONS ====================

export const getVendors = async () => {
  try {
    console.log("Fetching vendors...");
    const vendors = await Vendor.find({}).sort({ createdAt: -1 });
    console.log(`Found ${vendors.length} vendors`);
    return vendors;
  } catch (error) {
    console.error("Error getting vendors:", error);
    throw error;
  }
};

export const getVendor = async (id) => {
  try {
    const vendor = await Vendor.findById(id);
    return vendor;
  } catch (error) {
    console.error("Error getting vendor:", error);
    throw error;
  }
};

export const createVendor = async (vendorName, Area, Address) => {
  try {
    const vendor = new Vendor({ vendorName, Area, Address });
    const savedVendor = await vendor.save();
    console.log("Vendor created:", savedVendor.vendorName);
    return savedVendor;
  } catch (error) {
    console.error("Error creating vendor:", error);
    throw error;
  }
};

export const updateVendor = async (id, vendorName, Area, Address) => {
  try {
    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
      { vendorName, Area, Address },
      { new: true }
    );
    console.log("Vendor updated:", updatedVendor?.vendorName);
    return updatedVendor;
  } catch (error) {
    console.error("Error updating vendor:", error);
    throw error;
  }
};

export const deleteVendor = async (id) => {
  try {
    const vendor = await Vendor.findById(id);
    if (!vendor) return false;

    console.log("Deleting vendor:", vendor.vendorName);

    await Vendor.findByIdAndDelete(id);

    const deletedBrands = await Brand.deleteMany({ vendorId: id });
    console.log(`Deleted ${deletedBrands.deletedCount} brands`);

    const deletedProducts = await Product.deleteMany({ vendorId: id });
    console.log(`Deleted ${deletedProducts.deletedCount} products`);

    return true;
  } catch (error) {
    console.error("Error deleting vendor:", error);
    throw error;
  }
};


export const getBrands = async () => {
  try {
    console.log("Fetching brands...");
    const brands = await Brand.find({})
      .populate("vendorId", "vendorName")
      .sort({ createdAt: -1 });
    console.log(`Found ${brands.length} brands`);
    return brands;
  } catch (error) {
    console.error("Error getting brands:", error);
    throw error;
  }
};

export const getBrandsByVendorId = async (vendorId) => {
  try {
    const brands = await Brand.find({ vendorId })
      .populate("vendorId", "vendorName")
      .sort({ createdAt: -1 });
    return brands;
  } catch (error) {
    console.error("Error getting brands by vendor:", error);
    throw error;
  }
};

export const createBrand = async (vendorId, newTask) => {
  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new Error("Vendor not found");
    }

    const brand = new Brand({ vendorId, newTask });
    const savedBrand = await brand.save();

    await savedBrand.populate("vendorId", "vendorName");

    console.log("Brand created:", savedBrand.newTask, "for vendor:", vendor.vendorName);
    return savedBrand;
  } catch (error) {
    console.error("Error creating brand:", error);
    throw error;
  }
};

export const updateBrand = async (id, vendorId, newTask) => {
  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new Error("Vendor not found");
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { vendorId, newTask },
      { new: true }
    ).populate("vendorId", "vendorName");

    console.log("Brand updated:", updatedBrand?.newTask);
    return updatedBrand;
  } catch (error) {
    console.error("Error updating brand:", error);
    throw error;
  }
};

export const deleteBrand = async (id) => {
  try {
    const brand = await Brand.findById(id);
    if (!brand) return false;

    const brandName = brand.newTask;
    console.log("Deleting brand:", brandName);

    await Brand.findByIdAndDelete(id);

    const deletedProducts = await Product.deleteMany({ brandId: id });
    console.log(`Deleted ${deletedProducts.deletedCount} products`);

    return true;
  } catch (error) {
    console.error("Error deleting brand:", error);
    throw error;
  }
};


export const getProducts = async () => {
  try {
    console.log("Fetching products...");
    const products = await Product.find({})
      .populate("vendorId", "vendorName")
      .populate("brandId", "newTask")
      .sort({ createdAt: -1 });
    console.log(`Found ${products.length} products`);
    return products;
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

export const getProductsByVendorId = async (vendorId) => {
  try {
    const products = await Product.find({ vendorId })
      .populate("vendorId", "vendorName")
      .populate("brandId", "newTask")
      .sort({ createdAt: -1 });
    return products;
  } catch (error) {
    console.error("Error getting products by vendor:", error);
    throw error;
  }
};

export const createProduct = async (vendorId, brandId, selectqty) => {
  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new Error("Vendor not found");
    }

    const brand = await Brand.findById(brandId);
    if (!brand) {
      throw new Error("Brand not found");
    }

    if (brand.vendorId.toString() !== vendorId) {
      throw new Error("Brand does not belong to the selected vendor");
    }

    const product = new Product({ vendorId, brandId, selectqty });
    const savedProduct = await product.save();

    // Populate vendor and brand info for response
    await savedProduct.populate("vendorId", "vendorName");
    await savedProduct.populate("brandId", "newTask");

    console.log(
      "Product created:",
      brand.newTask,
      selectqty,
      "for vendor:",
      vendor.vendorName
    );
    return savedProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id, vendorId, brandId, selectqty) => {
  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new Error("Vendor not found");
    }

    const brand = await Brand.findById(brandId);
    if (!brand) {
      throw new Error("Brand not found");
    }

    if (brand.vendorId.toString() !== vendorId) {
      throw new Error("Brand does not belong to the selected vendor");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { vendorId, brandId, selectqty },
      { new: true }
    )
      .populate("vendorId", "vendorName")
      .populate("brandId", "newTask");

    console.log("Product updated:", updatedProduct?.brandId?.newTask);
    return updatedProduct;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const result = await Product.findByIdAndDelete(id);
    console.log("Product deleted");
    return result !== null;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};