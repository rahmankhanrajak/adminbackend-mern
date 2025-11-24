import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB - WaterCane Database");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

await connectDB();

const vendorSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: true,
    unique: true,
  },
  Area: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Vendor = mongoose.model("Vendor", vendorSchema);

const brandSchema = new mongoose.Schema({
  vendor: {
    type: String,
    required: true,
  },
  newTask: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Brand = mongoose.model("Brand", brandSchema);

const productSchema = new mongoose.Schema({
  vendor: {
    type: String,
    required: true,
  },
  selectBrand: {
    type: String,
    required: true,
  },
  selectqty: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

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

    const vendorName = vendor.vendorName;
    console.log("Deleting vendor:", vendorName);

    await Vendor.findByIdAndDelete(id);

    const deletedBrands = await Brand.deleteMany({ vendor: vendorName });
    console.log(`Deleted ${deletedBrands.deletedCount} brands`);

    const deletedProducts = await Product.deleteMany({ vendor: vendorName });
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
    const brands = await Brand.find({}).sort({ createdAt: -1 });
    console.log(`Found ${brands.length} brands`);
    return brands;
  } catch (error) {
    console.error("Error getting brands:", error);
    throw error;
  }
};

export const getBrandsByVendor = async (vendor) => {
  try {
    const brands = await Brand.find({ vendor }).sort({ createdAt: -1 });
    return brands;
  } catch (error) {
    console.error("Error getting brands by vendor:", error);
    throw error;
  }
};

export const createBrand = async (vendor, newTask) => {
  try {
    const brand = new Brand({ vendor, newTask });
    const savedBrand = await brand.save();
    console.log("Brand created:", savedBrand.newTask, "for vendor:", vendor);
    return savedBrand;
  } catch (error) {
    console.error("Error creating brand:", error);
    throw error;
  }
};

export const updateBrand = async (id, vendor, newTask) => {
  try {
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { vendor, newTask },
      { new: true }
    );
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

    const deletedProducts = await Product.deleteMany({
      selectBrand: brandName,
    });
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
    const products = await Product.find({}).sort({ createdAt: -1 });
    console.log(`Found ${products.length} products`);
    return products;
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

export const getProductsByVendor = async (vendor) => {
  try {
    const products = await Product.find({ vendor }).sort({ createdAt: -1 });
    return products;
  } catch (error) {
    console.error("Error getting products by vendor:", error);
    throw error;
  }
};

export const createProduct = async (vendor, selectBrand, selectqty) => {
  try {
    const product = new Product({ vendor, selectBrand, selectqty });
    const savedProduct = await product.save();
    console.log(
      "Product created:",
      selectBrand,
      selectqty,
      "for vendor:",
      vendor
    );
    return savedProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id, vendor, selectBrand, selectqty) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { vendor, selectBrand, selectqty },
      { new: true }
    );
    console.log("Product updated:", updatedProduct?.selectBrand);
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
