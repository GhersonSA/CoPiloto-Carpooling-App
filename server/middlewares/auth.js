const jwt = require("jsonwebtoken");
const { SECRET_JWT_KEY } = require("../config.js");

module.exports = function auth(req, res, next) {
    const token = req.cookies?.access_token;
    if (!token) return res.status(401).send('Token requerido');

    try {
        const user = jwt.verify(token, SECRET_JWT_KEY);
        req.user = user;
        next();
    } catch (err) {
        res.status(401).send("Token inválido");
    }
};