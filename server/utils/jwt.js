import jwt from 'jsonwebtoken';

export const verifyToken = (token) => {
    return jwt.verify(token, "hello");
};

export const generateToken = (payload) => {
    return jwt.sign(payload, "hello"); // {expiresIn:3600}
};