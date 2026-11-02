const express = require("express");

const {
    createItem,
    getItems,
    getLostItems,
    getFoundItems
} = require("../controllers/itemController");

const protect = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Get all items
router.get("/", getItems);

// Get lost items
router.get("/lost", getLostItems);

// Get found items
router.get("/found", getFoundItems);

// Create item - JWT + image required
router.post("/", protect, upload.single("image"), createItem);

module.exports = router;