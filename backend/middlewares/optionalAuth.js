import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

/**
 * Optional authentication middleware:
 * If a token is provided in cookies or header, verifies and attaches req.user and req.id.
 * If no token or invalid, simply passes through without failing.
 */
export const optionalAuth = async (req, res, next) => {
    try {
        let token = req.cookies?.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (token) {
            try {
                const decode = jwt.verify(token, process.env.SECRET_KEY);
                if (decode && decode.userId) {
                    const user = await User.findById(decode.userId).select("-password");
                    if (user && !user.isBlocked) {
                        req.id = user._id.toString();
                        req.user = user;
                    }
                }
            } catch (innerErr) {
                // Ignore token decode error for optional auth
            }
        }
    } catch (err) {
        // Continue regardless
    }
    next();
};

export default optionalAuth;
