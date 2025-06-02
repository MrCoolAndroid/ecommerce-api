const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const payload = {
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    const secret = process.env.JWT_SECRET;

    const options = {
        expiresIn: '1h'
    };

    const token = jwt.sign(payload, secret, options);
    return token;
};

module.exports = generateToken;