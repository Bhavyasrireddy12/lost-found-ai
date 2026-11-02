const express = require("express");

const {
    createMatch,
    createAIMatch,
    getMatches,
    getMatchById,
    updateMatchStatus
} = require("../controllers/matchController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Manual match
router.post(
    "/",
    protect,
    createMatch
);


// AI match
router.post(
    "/ai",
    protect,
    createAIMatch
);


// Get all matches
router.get(
    "/",
    protect,
    getMatches
);


// Get match by ID
router.get(
    "/:id",
    protect,
    getMatchById
);


// Update match status
router.put(
    "/:id/status",
    protect,
    updateMatchStatus
);


module.exports = router;