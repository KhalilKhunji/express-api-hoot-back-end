const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({error:'Something went wrong! Try again.'});
        };
        const hashedPassword = bcrypt.hashSync(password, parseInt(process.env.SALT_ROUNDS));
        const user = await User.create({
            username,
            hashedPassword
        });
        const token = jwt.sign({ username: user.username, _id: user._id }, process.env.JWT_SECRET);
        return res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: 'Something went wrong! Try again.' });
    };
});

router.post('/signin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (user && bcrypt.compareSync(password, user.hashedPassword)) {
            const token = jwt.sign({ username: user.username, _id: user._id }, process.env.JWT_SECRET);
            res.status(200).json({ token });
        } else {
            res.status(401).json({ error: 'Something went wrong! Try again.' });
        }
    } catch (error) {
        res.status(400).json({ error: 'Something went wrong! Try again.' });
    };
});

module.exports = router;