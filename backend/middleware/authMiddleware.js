
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        console.log(
            "AUTH HEADER:",
            authHeader ? "TOKEN RECEIVED" : "TOKEN MISSING"
        );

        // Check whether JWT secret exists
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing in .env");

            return res.status(500).json({
                message: "JWT_SECRET is not configured in backend .env"
            });
        }

        // Check authorization header
        if (!authHeader) {
            return res.status(401).json({
                message: "No authorization token provided"
            });
        }

        // Check Bearer format
        const parts = authHeader.split(" ");

        if (
            parts.length !== 2 ||
            parts[0].toLowerCase() !== "bearer" ||
            !parts[1]
        ) {
            return res.status(401).json({
                message: "Invalid authorization format. Use Bearer token"
            });
        }

        const token = parts[1];

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store authenticated user
        req.user = decoded;

        console.log("AUTH SUCCESS:", decoded);

        next();

    } catch (error) {
        console.error("AUTH ERROR:", error.message);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token expired. Please login again."
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "Invalid token. Please login again."
            });
        }

        return res.status(401).json({
            message: "Authentication failed"
        });
    }
};

module.exports = protect;
