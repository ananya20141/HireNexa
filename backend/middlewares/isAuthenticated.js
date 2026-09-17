import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const isAuthenticated = async (req, res, next) => {
    try {
        let token = req.cookies?.token;
        
        // Also support Bearer token in Authorization header
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "User not authenticated. Please log in.",
                success: false,
            });
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY);
        if (!decode || !decode.userId) {
            return res.status(401).json({
                message: "Invalid or expired token.",
                success: false
            });
        }

        const user = await User.findById(decode.userId).select("-password");
        if (!user) {
            return res.status(401).json({
                message: "Account not found.",
                success: false
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                message: "Your account has been suspended by the administrator.",
                success: false
            });
        }

        req.id = user._id.toString();
        req.user = user;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error?.message || error);
        return res.status(401).json({
            message: "Authentication failed. Invalid or expired session.",
            success: false
        });
    }
};

export default isAuthenticated;