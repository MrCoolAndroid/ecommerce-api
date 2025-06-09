const User = require('../models/users');
const bcrypt = require('bcryptjs');
const generateToken = require('../services/generateToken');

const register = async (name, email, password, role) => {
    try {
        const userExists = await User.findOne({ email });
        if (userExists) throw new Error("E-mail already registered");
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            passwordHash: hashedPassword,
            role: role || 'user'
        });
        const token = generateToken(user);
        return { token, user: { id: user._id, username: user.username, role: user.role } };
    } catch (error) {
        throw new Error(error.message);
    }
}

const login = async (email, password) => {
    try {
        const user = await User.findOne({ email });
        if (!user) throw new Error("Invalid credentials");

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) throw new Error("Invalid credentials");

        const token = generateToken(user);
        return { token, user: { id: user._id, username: user.username, role: user.role } };
    }
    catch (error) {
        throw new Error(error.message);
    }
}

module.exports = { register, login };