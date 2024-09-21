import express from "express";
import fs from "fs";

const router = express.Router();
const productsFilePath = "src/data/products.json";

const readProductsFromFile = () => {
    try {
        const data = fs.readFileSync(productsFilePath, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading products:", err);
        return [];
    }
};

const writeProductsToFile = (products) => {
    try {
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
    } catch (err) {
        console.error("Error writing products:", err);
    }
};

router.get("/", (req, res) => {
    const products = readProductsFromFile();

    if (products.length === 0) {
        return res
            .status(200)
            .json({ estado: "There are no products available yet" });
    }

    res.send(products);
});

router.get("/:id", (req, res) => {
    const products = readProductsFromFile();
    const id = +req.params.id;
    const product = products.find((p) => p.id === id);

    if (product) {
        res.send(product);
    } else {
        res.status(404).json({ error: "Product not found" });
    }
});

router.post("/add", (req, res) => {
    const products = readProductsFromFile();
    const { title, description, code, price, status, stock, category } = req.body;

    if (
        !title ||
        !description ||
        !code ||
        !price ||
        typeof status === "undefined" ||
        !stock ||
        !category
    ) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const newProduct = {
        id: products.length + 1,
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
    };

    products.push(newProduct);
    writeProductsToFile(products);

    res.status(200).json({ Operacion: "Made", ProductoAgregado: newProduct });
});

router.put("/change/:id", (req, res) => {
    const products = readProductsFromFile();
    const id = +req.params.id;
    const { title, description, code, price, status, stock, category } = req.body;

    const productIndex = products.findIndex((product) => product.id === id);

    if (productIndex === -1) {
        return res.status(400).json({ error: "The product does not exist" });
    }

    if (
        !title ||
        !description ||
        !code ||
        typeof price === "undefined" ||
        typeof status === "undefined" ||
        typeof stock === "undefined" ||
        !category
    ) {
        return res.status(400).json({ error: "TAll fields are required" });
    }

    const updatedProduct = {
        id,
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
    };

    products[productIndex] = updatedProduct;
    writeProductsToFile(products);

    res
        .status(200)
        .json({ Operacion: "Made", ProductoActualizadoA: updatedProduct });
});

router.delete("/delete/:id", (req, res) => {
    const products = readProductsFromFile();
    const id = +req.params.id;
    const productIndex = products.findIndex((product) => product.id === id);

    if (productIndex === -1) {
        return res.status(404).json({ error: "The product does not exist" });
    }

    const deletedProd = products.splice(productIndex, 1);
    writeProductsToFile(products);

    res
        .status(200)
        .json({ Operacion: "Made", ProductoEliminado: deletedProd[0] });
});

export default router;
