const express = require("express");

const {
    registerUser,
    loginUser
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/protected", protect, (req, res) => {
    res.json({
        message: "Protected route accessed successfully",
        user: req.user
    });
});

module.exports = router;