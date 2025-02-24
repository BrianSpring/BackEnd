const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const usersRouter = require('./routes/users');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para WebSockets en rutas
app.use((req, res, next) => {
    req.io = io;
    next();
});

// WebSockets
io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.on('newProduct', (product) => {
        io.emit('updateProducts', product);
    });

    socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
    });
});

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/users', usersRouter);

// Iniciar servidor con WebSockets
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});