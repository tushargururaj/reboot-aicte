import { verifyToken } from '../utils/jwt.js';

const jwtAuthMiddleware = (req, res, next) => {
    if (!req.cookies.token) return res.status(401).json({ error: 'Unauthorised' });
    const token = req.cookies.token;
    console.log("Token from cookie:", token);
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({ error: 'Invalid Token' });
    }
};

export default jwtAuthMiddleware;