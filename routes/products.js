const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const PRODUCTS_FILE = path.resolve(__dirname, '..', 'data', 'products.json');
const router = express.Router();

// Funciones auxiliares
const readProducts = () => JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
const saveProducts = (products) => fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));

// Obtener todos los productos
router.get('/', (req, res) => {
    res.json(readProducts());
});

// Obtener un producto por ID
router.get('/:pid', (req, res) => {
    const product = readProducts().find(p => p.id === req.params.pid);
    product ? res.json(product) : res.status(404).json({ error: 'Producto no encontrado' });
});

// Crear un nuevo producto y notificar a WebSockets
router.post('/', (req, res) => {
    const products = readProducts();
    const newProduct = { id: uuidv4(), ...req.body };
    products.push(newProduct);
    saveProducts(products);

    req.io.emit('updateProducts', newProduct);
    res.status(201).json(newProduct);
});

// Actualizar un producto (sin modificar el ID)
router.put('/:pid', (req, res) => {
    const products = readProducts();
    const index = products.findIndex(p => p.id === req.params.pid);
    if (index !== -1) {
        products[index] = { ...products[index], ...req.body, id: products[index].id };
        saveProducts(products);
        res.json(products[index]);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

// Eliminar un producto
router.delete('/:pid', (req, res) => {
    const products = readProducts().filter(p => p.id !== req.params.pid);
    saveProducts(products);
    req.io.emit('updateProducts', { id: req.params.pid, deleted: true });
    res.json({ message: 'Producto eliminado' });
});

module.exports = router;
