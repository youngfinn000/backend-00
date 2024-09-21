import express from "express";
import fs from "fs";

const router = express.Router();
const cartsFilePath = "src/data/cart.json";
const productsFilePath = "src/data/products.json";

const readCartsFromFile = () => {
    try {
        const data = fs.readFileSync(cartsFilePath, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading carts:", err);
        return [];
    }
};

const readProductsFromFile = () => {
    try {
        const data = fs.readFileSync(productsFilePath, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading products:", err);
        return [];
    }
};

const writeCartsToFile = (carts) => {
    try {
        fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
    } catch (err) {
        console.error("Error writing carts:", err);
    }
};

router.post("/", (req, res) => {
    const carts = readCartsFromFile();
    const { products } = req.body;

    if (!Array.isArray(products)) {
        return res
            .status(400)
            .json({ status: "error", message: "The field must be an array" });
    }

    const newCart = {
        id: carts.length + 1,
        products: products,
    };

    carts.push(newCart);
    writeCartsToFile(carts);

    res.status(200).json({ status: "Cart created successfully", Cart: newCart });
});

router.get("/:cid", (req, res) => {
    const carts = readCartsFromFile();
    const cartId = +req.params.cid;

    const cartIndex = carts.findIndex((cart) => cart.id === cartId);

    if (cartIndex === -1) {
        return res
            .status(400)
            .json({ Error: "The cart with that ID was not found" });
    }

    res.status(200).json({ Operacion: "Cart found", Carrito: carts[cartIndex] });
});

router.post("/:cid/product/:pid", (req, res) => {
    const carts = readCartsFromFile();
    const products = readProductsFromFile();

    const cartId = +req.params.cid;
    const prodId = +req.params.pid;

    const cartIndex = carts.findIndex((cart) => cart.id === cartId);
    const prodIndex = products.findIndex((prod) => prod.id === prodId);

    if (cartIndex === -1) {
        return res.status(404).json({ error: "Cart not found" });
    }

    if (prodIndex === -1) {
        return res.status(404).json({ error: "Product not found" });
    }

    const cart = carts[cartIndex];
    const productInCart = cart.products.find((p) => p.product === prodId);

    if (productInCart) {
        productInCart.quantity += 1;
    } else {
        cart.products.push({
            product: prodId,
            quantity: 1,
        });
    }

    writeCartsToFile(carts);

    res.status(200).json({ message: "Product added to cart", cart });
});

export default router;
