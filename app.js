// app.js
import express from "express";
import cors from "cors";
import {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  getBrands,
  getBrandsByVendorId,
  createBrand,
  updateBrand,
  deleteBrand,
  getProducts,
  getProductsByVendorId,
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
    // Mongoose duplicate key error
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

// Brand routes
app.get("/brands", async (req, res) => {
  try {
    const brands = await getBrands();
    res.json(brands);
  } catch (error) {
    console.error("Error in GET /brands:", error);
    res.status(500).json({ error: "Failed to fetch brands" });
  }
});

app.get("/brands/vendor/:vendorId", async (req, res) => {
  try {
    const brands = await getBrandsByVendorId(req.params.vendorId);
    res.json(brands);
  } catch (error) {
    console.error("Error in GET /brands/vendor/:vendorId:", error);
    res.status(500).json({ error: "Failed to fetch brands" });
  }
});

app.post("/brands", async (req, res) => {
  try {
    const { vendorId, newTask } = req.body;

    if (!vendorId || !newTask) {
      return res
        .status(400)
        .json({ error: "Vendor ID and brand name are required" });
    }

    const brand = await createBrand(vendorId, newTask);
    res.status(201).json(brand);
  } catch (error) {
    console.error("Error in POST /brands:", error);
    if (error.message === "Vendor not found") {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.status(500).json({ error: "Failed to create brand" });
  }
});

app.put("/brands/:id", async (req, res) => {
  try {
    const { vendorId, newTask } = req.body;

    if (!vendorId || !newTask) {
      return res
        .status(400)
        .json({ error: "Vendor ID and brand name are required" });
    }

    const brand = await updateBrand(req.params.id, vendorId, newTask);

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    res.json(brand);
  } catch (error) {
    console.error("Error in PUT /brands/:id:", error);
    if (error.message === "Vendor not found") {
      return res.status(404).json({ error: "Vendor not found" });
    }
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

// Product routes
app.get("/products", async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    console.error("Error in GET /products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/products/vendor/:vendorId", async (req, res) => {
  try {
    const products = await getProductsByVendorId(req.params.vendorId);
    res.json(products);
  } catch (error) {
    console.error("Error in GET /products/vendor/:vendorId:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Create product - with validation + coercion to Number
// DEBUG: replace existing POST /products route with this
app.post("/products", async (req, res) => {
  try {
    console.log("---- DEBUG POST /products ----");
    console.log("Headers:", req.headers);
    // print body with util.inspect to show types and hidden properties
    import('util').then(util => {
      console.log("req.body (inspect):", util.inspect(req.body, {depth: 4, colors: false}));
    });

    const body = req.body ?? {};
    const { vendorId, brandId, selectqty } = body;

    console.log("vendorId:", vendorId, "brandId:", brandId, "selectqty:", selectqty);
    console.log("types -> vendorId:", typeof vendorId, "brandId:", typeof brandId, "selectqty:", typeof selectqty);

    if (!vendorId || !brandId || (selectqty === undefined || selectqty === null)) {
      return res.status(400).json({
        error: "All fields are required",
        debug: {
          receivedBody: body,
          contentType: req.headers["content-type"] || null,
        },
      });
    }

    // try coerce
    const qtyNum = Number(selectqty);
    if (Number.isNaN(qtyNum)) {
      return res.status(400).json({ error: "selectqty must be a number", debug: { selectqty } });
    }

    const product = await createProduct(vendorId, brandId, qtyNum);
    return res.status(201).json(product);
  } catch (err) {
    console.error("Error in DEBUG POST /products:", err);
    return res.status(500).json({ error: err && err.message ? err.message : "Failed to create product" });
  }
});

// app.post("/products", async (req, res) => {
//   try {
//     console.log("POST /products body:", JSON.stringify(req.body));

//     let { vendorId, brandId, selectqty } = req.body;

//     if (!vendorId || !brandId || (selectqty === undefined || selectqty === null)) {
//       return res.status(400).json({ error: "All fields are required: vendorId, brandId, selectqty" });
//     }

//     const qtyNum = Number(selectqty);
//     if (Number.isNaN(qtyNum)) {
//       return res.status(400).json({ error: "selectqty must be a number" });
//     }

//     const product = await createProduct(vendorId, brandId, qtyNum);
//     return res.status(201).json(product);
//   } catch (error) {
//     console.error("Error in POST /products:", error);
//     const message = error && error.message ? error.message : "Failed to create product";
//     if (message === "Vendor not found" || message === "Brand not found") {
//       return res.status(404).json({ error: message });
//     }
//     if (message === "Brand does not belong to the selected vendor") {
//       return res.status(400).json({ error: message });
//     }
//     return res.status(500).json({ error: message });
//   }
// });

app.put("/products/:id", async (req, res) => {
  try {
    const { vendorId, brandId, selectqty } = req.body;

    if (!vendorId || !brandId || (selectqty === undefined || selectqty === null)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const qtyNum = Number(selectqty);
    if (Number.isNaN(qtyNum)) {
      return res.status(400).json({ error: "selectqty must be a number" });
    }

    const product = await updateProduct(
      req.params.id,
      vendorId,
      brandId,
      qtyNum
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error in PUT /products/:id:", error);
    const message = error && error.message ? error.message : "Failed to update product";
    if (message === "Vendor not found" || message === "Brand not found") {
      return res.status(404).json({ error: message });
    }
    if (message === "Brand does not belong to the selected vendor") {
      return res.status(400).json({ error: message });
    }
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`WaterCane API running on http://localhost:${PORT}`);
});

export default app;

// import express from "express";
// import cors from "cors";
// import {
//   getVendors,
//   getVendor,
//   createVendor,
//   updateVendor,
//   deleteVendor,
//   getBrands,
//   getBrandsByVendorId,
//   createBrand,
//   updateBrand,
//   deleteBrand,
//   getProducts,
//   getProductsByVendorId,
//   createProduct,
//   updateProduct,
//   deleteProduct,
// } from "./database.js";

// const app = express();

// app.use(express.json());
// app.use(cors());

// // Vendor routes
// app.get("/vendors", async (req, res) => {
//   try {
//     const vendors = await getVendors();
//     res.json(vendors);
//   } catch (error) {
//     console.error("Error in GET /vendors:", error);
//     res.status(500).json({ error: "Failed to fetch vendors" });
//   }
// });

// app.get("/vendors/:id", async (req, res) => {
//   try {
//     const vendor = await getVendor(req.params.id);
//     if (!vendor) {
//       return res.status(404).json({ error: "Vendor not found" });
//     }
//     res.json(vendor);
//   } catch (error) {
//     console.error("Error in GET /vendors/:id:", error);
//     res.status(500).json({ error: "Failed to fetch vendor" });
//   }
// });

// app.post("/vendors", async (req, res) => {
//   try {
//     const { vendorName, Area, Address } = req.body;

//     if (!vendorName || !Area || !Address) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     const vendor = await createVendor(vendorName, Area, Address);
//     res.status(201).json(vendor);
//   } catch (error) {
//     console.error("Error in POST /vendors:", error);
//     if (error.code === 11000) {
//       return res.status(400).json({ error: "Vendor name already exists" });
//     }
//     res.status(500).json({ error: "Failed to create vendor" });
//   }
// });

// app.put("/vendors/:id", async (req, res) => {
//   try {
//     const { vendorName, Area, Address } = req.body;

//     if (!vendorName || !Area || !Address) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     const vendor = await updateVendor(req.params.id, vendorName, Area, Address);

//     if (!vendor) {
//       return res.status(404).json({ error: "Vendor not found" });
//     }

//     res.json(vendor);
//   } catch (error) {
//     console.error("Error in PUT /vendors/:id:", error);
//     res.status(500).json({ error: "Failed to update vendor" });
//   }
// });

// app.delete("/vendors/:id", async (req, res) => {
//   try {
//     const deleted = await deleteVendor(req.params.id);

//     if (!deleted) {
//       return res.status(404).json({ error: "Vendor not found" });
//     }

//     res.json({ message: "Vendor and associated data deleted successfully" });
//   } catch (error) {
//     console.error("Error in DELETE /vendors/:id:", error);
//     res.status(500).json({ error: "Failed to delete vendor" });
//   }
// });

// // Brand routes
// app.get("/brands", async (req, res) => {
//   try {
//     const brands = await getBrands();
//     res.json(brands);
//   } catch (error) {
//     console.error("Error in GET /brands:", error);
//     res.status(500).json({ error: "Failed to fetch brands" });
//   }
// });

// app.get("/brands/vendor/:vendorId", async (req, res) => {
//   try {
//     const brands = await getBrandsByVendorId(req.params.vendorId);
//     res.json(brands);
//   } catch (error) {
//     console.error("Error in GET /brands/vendor/:vendorId:", error);
//     res.status(500).json({ error: "Failed to fetch brands" });
//   }
// });

// app.post("/brands", async (req, res) => {
//   try {
//     const { vendorId, newTask } = req.body;

//     if (!vendorId || !newTask) {
//       return res
//         .status(400)
//         .json({ error: "Vendor ID and brand name are required" });
//     }

//     const brand = await createBrand(vendorId, newTask);
//     res.status(201).json(brand);
//   } catch (error) {
//     console.error("Error in POST /brands:", error);
//     if (error.message === "Vendor not found") {
//       return res.status(404).json({ error: "Vendor not found" });
//     }
//     res.status(500).json({ error: "Failed to create brand" });
//   }
// });

// app.put("/brands/:id", async (req, res) => {
//   try {
//     const { vendorId, newTask } = req.body;

//     if (!vendorId || !newTask) {
//       return res
//         .status(400)
//         .json({ error: "Vendor ID and brand name are required" });
//     }

//     const brand = await updateBrand(req.params.id, vendorId, newTask);

//     if (!brand) {
//       return res.status(404).json({ error: "Brand not found" });
//     }

//     res.json(brand);
//   } catch (error) {
//     console.error("Error in PUT /brands/:id:", error);
//     if (error.message === "Vendor not found") {
//       return res.status(404).json({ error: "Vendor not found" });
//     }
//     res.status(500).json({ error: "Failed to update brand" });
//   }
// });

// app.delete("/brands/:id", async (req, res) => {
//   try {
//     const deleted = await deleteBrand(req.params.id);

//     if (!deleted) {
//       return res.status(404).json({ error: "Brand not found" });
//     }

//     res.json({ message: "Brand and associated products deleted successfully" });
//   } catch (error) {
//     console.error("Error in DELETE /brands/:id:", error);
//     res.status(500).json({ error: "Failed to delete brand" });
//   }
// });

// // Product routes
// app.get("/products", async (req, res) => {
//   try {
//     const products = await getProducts();
//     res.json(products);
//   } catch (error) {
//     console.error("Error in GET /products:", error);
//     res.status(500).json({ error: "Failed to fetch products" });
//   }
// });

// app.get("/products/vendor/:vendorId", async (req, res) => {
//   try {
//     const products = await getProductsByVendorId(req.params.vendorId);
//     res.json(products);
//   } catch (error) {
//     console.error("Error in GET /products/vendor/:vendorId:", error);
//     res.status(500).json({ error: "Failed to fetch products" });
//   }
// });

// app.post("/products", async (req, res) => {
//   try {
//     const { vendorId, selectBrand, selectqty } = req.body;

//     if (!vendorId || !selectBrand || !selectqty) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     const product = await createProduct(vendorId, selectBrand, selectqty);
//     res.status(201).json(product);
//   } catch (error) {
//     console.error("Error in POST /products:", error);
//     if (error.message === "Vendor not found") {
//       return res.status(404).json({ error: "Vendor not found" });
//     }
//     res.status(500).json({ error: "Failed to create product" });
//   }
// });

// app.put("/products/:id", async (req, res) => {
//   try {
//     const { vendorId, selectBrand, selectqty } = req.body;

//     if (!vendorId || !selectBrand || !selectqty) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     const product = await updateProduct(
//       req.params.id,
//       vendorId,
//       selectBrand,
//       selectqty
//     );

//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     res.json(product);
//   } catch (error) {
//     console.error("Error in PUT /products/:id:", error);
//     if (error.message === "Vendor not found") {
//       return res.status(404).json({ error: "Vendor not found" });
//     }
//     res.status(500).json({ error: "Failed to update product" });
//   }
// });

// app.delete("/products/:id", async (req, res) => {
//   try {
//     const deleted = await deleteProduct(req.params.id);

//     if (!deleted) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     res.json({ message: "Product deleted successfully" });
//   } catch (error) {
//     console.error("Error in DELETE /products/:id:", error);
//     res.status(500).json({ error: "Failed to delete product" });
//   }
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Unhandled error:", err.stack);
//   res.status(500).json({ error: "Something went wrong!" });
// });

// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`WaterCane API running on http://localhost:${PORT}`);
// });

// export default app;