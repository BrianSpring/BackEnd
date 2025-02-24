const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const USERS_FILE = path.resolve(__dirname, '..', 'data', 'users.json');
const router = express.Router();

// Funciones auxiliares
const readUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
const saveUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// Obtener todos los usuarios
router.get('/', (req, res) => {
    const users = readUsers();
    res.json(users);
});

// Crear un usuario nuevo
router.post('/', (req, res) => {
    const users = readUsers();
    const newUser = { id: uuidv4(), ...req.body };
    users.push(newUser);
    saveUsers(users);
    res.status(201).json(newUser);
});

module.exports = router;