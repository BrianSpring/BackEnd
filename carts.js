const express = require('express');
const fs = require('fs');
const { faker } = require('@faker-js/faker');
const router = express.Router();

const CARTS_FILE = './data/carts.json';

// Función para leer carritos
const readCarts = () => JSON.parse(fs.readFileSync(CARTS_FILE, 'utf-8'));

// Función para guardar carritos
const saveCarts = (carts) => fs.writeFileSync(CARTS_FILE, JSON.stringify(carts, null, 2));

// Ruta POST / (Crear un nuevo carrito)
router.post('/', (req, res) => {
    const carts = readCarts();
    const newCart = {
        id: faker.datatype.uuid(),
        products: [],
    };
    carts.push(newCart);
    saveCarts(carts);
    res.status(201).json(newCart);
});

// Ruta GET /:cid (Listar productos de un carrito por ID)
router.get('/:cid', (req, res) => {
    const carts = readCarts();
    const cart = carts.find((c) => c.id === req.params.cid);
    if (cart) res.json(cart.products);
    else res.status(404).json({ error: 'Carrito no encontrado' });
});

// Ruta POST /:cid/product/:pid (Agregar producto a un carrito)
router.post('/:cid/product/:pid', (req, res) => {
    const carts = readCarts();
    const cart = carts.find((c) => c.id === req.params.cid);

    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex((p) => p.product === req.params.pid);
    if (productIndex !== -1) {
        cart.products[productIndex].quantity++;
    } else {
        cart.products.push({ product: req.params.pid, quantity: 1 });
    }

    saveCarts(carts);
    res.status(200).json(cart);
});

module.exports = router;
