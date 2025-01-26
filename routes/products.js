const express = require('express');
const fs = require('fs');
const { faker } = require('@faker-js/faker');
const router = express.Router();

const PRODUCTS_FILE = './data/products.json';

// Función para leer productos
const readProducts = () => JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));

// Función para guardar productos
const saveProducts = (products) => fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));

// Generar productos con Faker.js
router.get('/generate', (req, res) => {
    const products = Array.from({ length: 10 }).map(() => ({
        id: faker.datatype.uuid(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        code: faker.random.alphaNumeric(6),
        price: parseFloat(faker.commerce.price()),
        status: faker.datatype.boolean(),
        stock: faker.datatype.number({ min: 10, max: 100 }),
        category: faker.commerce.department(),
        thumbnails: [faker.image.imageUrl()],
    }));
    saveProducts(products);
    res.json({ message: 'Productos generados', products });
});

// Ruta GET / (Listar todos los productos)
router.get('/', (req, res) => {
    const products = readProducts();
    res.json(products);
});

// Ruta GET /:pid (Obtener producto por ID)
router.get('/:pid', (req, res) => {
    const products = readProducts();
    const product = products.find((p) => p.id === req.params.pid);
    if (product) res.json(product);
    else res.status(404).json({ error: 'Producto no encontrado' });
});

// Ruta POST / (Agregar nuevo producto)
router.post('/', (req, res) => {
    const products = readProducts();
    const newProduct = {
        id: faker.datatype.uuid(),
        ...req.body,
    };
    products.push(newProduct);
    saveProducts(products);
    res.status(201).json(newProduct);
});

// Ruta PUT /:pid (Actualizar producto)
router.put('/:pid', (req, res) => {
    const products = readProducts();
    const index = products.findIndex((p) => p.id === req.params.pid);
    if (index !== -1) {
        products[index] = { ...products[index], ...req.body };
        saveProducts(products);
        res.json(products[index]);
    } else res.status(404).json({ error: 'Producto no encontrado' });
});

// Ruta DELETE /:pid (Eliminar producto)
router.delete('/:pid', (req, res) => {
    let products = readProducts();
    const index = products.findIndex((p) => p.id === req.params.pid);
    if (index !== -1) {
        products = products.filter((p) => p.id !== req.params.pid);
        saveProducts(products);
        res.json({ message: 'Producto eliminado' });
    } else res.status(404).json({ error: 'Producto no encontrado' });
});

module.exports = router;
