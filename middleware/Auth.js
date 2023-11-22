const jwt = require('jsonwebtoken');
const sec_key = "secretkey";

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({ success: false, msg: "Bearer token is required for verification." });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, sec_key);
        req.user = decoded;
        return next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, msg: "Invalid token." });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, msg: "Token has expired." });
        } else {
            return res.status(500).json({ success: false, msg: "Internal server error." });
        }
    }
};

module.exports = verifyToken;


