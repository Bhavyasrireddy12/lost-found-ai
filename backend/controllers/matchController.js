
const Match = require("../models/Match");
const Item = require("../models/Item");
const path = require("path");
const fs = require("fs");

// =====================================================
// CREATE MANUAL MATCH
// =====================================================

const createMatch = async (req, res) => {
    try {
        const {
            lostItemId,
            foundItemId,
            imageScore,
            textScore,
            categoryScore,
            locationScore,
            timeScore,
            finalScore
        } = req.body;

        if (!lostItemId || !foundItemId) {
            return res.status(400).json({
                message: "Lost Item ID and Found Item ID are required"
            });
        }

        const lostItem = await Item.findById(lostItemId);
        const foundItem = await Item.findById(foundItemId);

        if (!lostItem || !foundItem) {
            return res.status(404).json({
                message: "Lost or Found item not found"
            });
        }

        if (lostItem.type !== "lost" || foundItem.type !== "found") {
            return res.status(400).json({
                message: "Please select one Lost item and one Found item"
            });
        }

        const existingMatch = await Match.findOne({
            lostItemId: lostItem._id,
            foundItemId: foundItem._id
        });

        if (existingMatch) {
            const populatedMatch = await Match.findById(existingMatch._id)
                .populate("lostItemId")
                .populate("foundItemId");

            return res.status(200).json({
                message: "Match already exists",
                match: populatedMatch
            });
        }

        const match = await Match.create({
            lostItemId: lostItem._id,
            foundItemId: foundItem._id,
            imageScore: imageScore ?? 0,
            textScore: textScore ?? 0,
            categoryScore: categoryScore ?? 0,
            locationScore: locationScore ?? 0,
            timeScore: timeScore ?? 0,
            finalScore: finalScore ?? 0,
            status: "possible"
        });

        const populatedMatch = await Match.findById(match._id)
            .populate("lostItemId")
            .populate("foundItemId");

        return res.status(201).json({
            message: "Match created successfully",
            match: populatedMatch
        });

    } catch (error) {
        console.error("Create Match Error:", error);

        return res.status(500).json({
            message: error.message
        });
    }
};


// =====================================================
// AUTOMATIC AI MATCHING
// =====================================================

const createAIMatch = async (req, res) => {
    try {
        const lostItems = await Item.find({
            type: "lost",
            status: "active"
        });

        const foundItems = await Item.find({
            type: "found",
            status: "active"
        });

        if (lostItems.length === 0 || foundItems.length === 0) {
            return res.status(200).json({
                message: "No active Lost or Found items available",
                totalLostItems: lostItems.length,
                totalFoundItems: foundItems.length,
                createdMatches: 0
            });
        }

        let createdMatches = 0;
        let skippedPairs = 0;
        const failedPairs = [];

        for (const lostItem of lostItems) {
            for (const foundItem of foundItems) {
                try {
                    if (!lostItem.image || !foundItem.image) {
                        skippedPairs++;
                        continue;
                    }

                    const existingMatch = await Match.findOne({
                        lostItemId: lostItem._id,
                        foundItemId: foundItem._id
                    });

                    if (existingMatch) {
                        skippedPairs++;
                        continue;
                    }

                    const lostImagePath = path.resolve(
                        __dirname,
                        "..",
                        "uploads",
                        path.basename(lostItem.image)
                    );

                    const foundImagePath = path.resolve(
                        __dirname,
                        "..",
                        "uploads",
                        path.basename(foundItem.image)
                    );

                    if (
                        !fs.existsSync(lostImagePath) ||
                        !fs.existsSync(foundImagePath)
                    ) {
                        skippedPairs++;
                        console.log("Image missing for pair:", {
                            lostItemId: lostItem._id,
                            foundItemId: foundItem._id
                        });
                        continue;
                    }

                    console.log(
                        "Comparing:",
                        lostItem.title,
                        "WITH",
                        foundItem.title
                    );

                    const aiResponse = await fetch(
                        "http://127.0.0.1:8000/match",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                lost_image: lostImagePath,
                                found_image: foundImagePath,
                                lost_description: lostItem.description || "",
                                found_description: foundItem.description || "",
                                lost_category: lostItem.category || "",
                                found_category: foundItem.category || "",
                                lost_location: lostItem.location || "",
                                found_location: foundItem.location || "",
                                lost_time: `${lostItem.date || ""} ${lostItem.time || ""}`,
                                found_time: `${foundItem.date || ""} ${foundItem.time || ""}`
                            })
                        }
                    );

                    if (!aiResponse.ok) {
                        throw new Error(
                            `Python AI service error: ${aiResponse.status}`
                        );
                    }

                    const aiResult = await aiResponse.json();

                    console.log("AI RESULT:", aiResult);

                    if (
                        aiResult.final_score === undefined ||
                        aiResult.final_score === null
                    ) {
                        throw new Error("AI final_score is missing");
                    }

                    if (aiResult.result === "POSSIBLE MATCH") {
                        const match = await Match.create({
                            lostItemId: lostItem._id,
                            foundItemId: foundItem._id,
                            imageScore: aiResult.image_score ?? 0,
                            textScore: aiResult.text_score ?? 0,
                            categoryScore: aiResult.category_score ?? 0,
                            locationScore: aiResult.location_score ?? 0,
                            timeScore: aiResult.time_score ?? 0,
                            finalScore: aiResult.final_score ?? 0,
                            status: "possible"
                        });

                        createdMatches++;

                        console.log("Match saved:", match._id);
                    } else {
                        skippedPairs++;
                    }

                } catch (pairError) {
                    console.error("Pair Matching Error:", pairError.message);

                    failedPairs.push({
                        lostItemId: lostItem._id,
                        foundItemId: foundItem._id,
                        error: pairError.message
                    });
                }
            }
        }

        return res.status(200).json({
            message: "Automatic AI matching completed",
            totalLostItems: lostItems.length,
            totalFoundItems: foundItems.length,
            createdMatches,
            skippedPairs,
            failedPairs
        });

    } catch (error) {
        console.error("Automatic AI Matching Error:", error);

        return res.status(500).json({
            message: error.message
        });
    }
};


// =====================================================
// GET ALL MATCHES
// =====================================================

const getMatches = async (req, res) => {
    try {
        const matches = await Match.find()
            .populate({
                path: "lostItemId",
                model: Item
            })
            .populate({
                path: "foundItemId",
                model: Item
            })
            .sort({ createdAt: -1 });

        console.log(
            "POPULATED MATCHES:",
            JSON.stringify(matches, null, 2)
        );

        return res.status(200).json(matches);

    } catch (error) {
        console.error("Get Matches Error:", error);

        return res.status(500).json({
            message: error.message
        });
    }
};


// =====================================================
// GET MATCH BY ID
// =====================================================

const getMatchById = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id)
            .populate("lostItemId")
            .populate("foundItemId");

        if (!match) {
            return res.status(404).json({
                message: "Match not found"
            });
        }

        return res.status(200).json(match);

    } catch (error) {
        console.error("Get Match By ID Error:", error);

        return res.status(500).json({
            message: error.message
        });
    }
};


// =====================================================
// UPDATE MATCH STATUS
// =====================================================

const updateMatchStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["possible", "confirmed", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Invalid match status"
            });
        }

        const match = await Match.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                new: true,
                runValidators: true
            }
        )
            .populate("lostItemId")
            .populate("foundItemId");

        if (!match) {
            return res.status(404).json({
                message: "Match not found"
            });
        }

        return res.status(200).json({
            message: "Match status updated successfully",
            match
        });

    } catch (error) {
        console.error("Update Match Status Error:", error);

        return res.status(500).json({
            message: error.message
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    createMatch,
    createAIMatch,
    getMatches,
    getMatchById,
    updateMatchStatus
};
