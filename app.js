import express from "express";
import cors from "cors";
import {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  getBrands,
  getBrandsByVendor,
  createBrand,
  updateBrand,
  deleteBrand,
  getProducts,
  getProductsByVendor,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./database.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/vendors", async (req, res) => {
  try {
    const vendors = await getVendors();
    res.json(vendors);
  } catch (error) {
    console.error("Error in GET /vendors:", error);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

app.get("/vendors/:id", async (req, res) => {
  try {
    const vendor = await getVendor(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json(vendor);
  } catch (error) {
    console.error("Error in GET /vendors/:id:", error);
    res.status(500).json({ error: "Failed to fetch vendor" });
  }
});

app.post("/vendors", async (req, res) => {
  try {
    const { vendorName, Area, Address } = req.body;

    if (!vendorName || !Area || !Address) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const vendor = await createVendor(vendorName, Area, Address);
    res.status(201).json(vendor);
  } catch (error) {
    console.error("Error in POST /vendors:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Vendor name already exists" });
    }
    res.status(500).json({ error: "Failed to create vendor" });
  }
});

app.put("/vendors/:id", async (req, res) => {
  try {
    const { vendorName, Area, Address } = req.body;

    if (!vendorName || !Area || !Address) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const vendor = await updateVendor(req.params.id, vendorName, Area, Address);

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json(vendor);
  } catch (error) {
    console.error("Error in PUT /vendors/:id:", error);
    res.status(500).json({ error: "Failed to update vendor" });
  }
});

app.delete("/vendors/:id", async (req, res) => {
  try {
    const deleted = await deleteVendor(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json({ message: "Vendor and associated data deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /vendors/:id:", error);
    res.status(500).json({ error: "Failed to delete vendor" });
  }
});

app.get("/brands", async (req, res) => {
  try {
    const brands = await getBrands();
    res.json(brands);
  } catch (error) {
    console.error("Error in GET /brands:", error);
    res.status(500).json({ error: "Failed to fetch brands" });
  }
});

app.get("/brands/vendor/:vendorName", async (req, res) => {
  try {
    const brands = await getBrandsByVendor(req.params.vendorName);
    res.json(brands);
  } catch (error) {
    console.error("Error in GET /brands/vendor/:vendorName:", error);
    res.status(500).json({ error: "Failed to fetch brands" });
  }
});

app.post("/brands", async (req, res) => {
  try {
    const { vendor, newTask } = req.body;

    if (!vendor || !newTask) {
      return res
        .status(400)
        .json({ error: "Vendor and brand name are required" });
    }

    const brand = await createBrand(vendor, newTask);
    res.status(201).json(brand);
  } catch (error) {
    console.error("Error in POST /brands:", error);
    res.status(500).json({ error: "Failed to create brand" });
  }
});

app.put("/brands/:id", async (req, res) => {
  try {
    const { vendor, newTask } = req.body;

    if (!vendor || !newTask) {
      return res
        .status(400)
        .json({ error: "Vendor and brand name are required" });
    }

    const brand = await updateBrand(req.params.id, vendor, newTask);

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    res.json(brand);
  } catch (error) {
    console.error("Error in PUT /brands/:id:", error);
    res.status(500).json({ error: "Failed to update brand" });
  }
});

app.delete("/brands/:id", async (req, res) => {
  try {
    const deleted = await deleteBrand(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Brand not found" });
    }

    res.json({ message: "Brand and associated products deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /brands/:id:", error);
    res.status(500).json({ error: "Failed to delete brand" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    console.error("Error in GET /products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/products/vendor/:vendorName", async (req, res) => {
  try {
    const products = await getProductsByVendor(req.params.vendorName);
    res.json(products);
  } catch (error) {
    console.error("Error in GET /products/vendor/:vendorName:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/products", async (req, res) => {
  try {
    const { vendor, selectBrand, selectqty } = req.body;

    if (!vendor || !selectBrand || !selectqty) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const product = await createProduct(vendor, selectBrand, selectqty);
    res.status(201).json(product);
  } catch (error) {
    console.error("Error in POST /products:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const { vendor, selectBrand, selectqty } = req.body;

    if (!vendor || !selectBrand || !selectqty) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const product = await updateProduct(
      req.params.id,
      vendor,
      selectBrand,
      selectqty
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error in PUT /products/:id:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const deleted = await deleteProduct(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /products/:id:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`WaterCane API running on http://localhost:${PORT}`);
});

export default app;
