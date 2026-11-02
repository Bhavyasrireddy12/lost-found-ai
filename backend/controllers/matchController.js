
const Match = require("../models/Match");
const Item = require("../models/Item");

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getImageUrl = (image) => {
    if (!image || typeof image !== "string") {
        return null;
    }

    const value = image.trim();

    // Cloudinary HTTPS URL or another complete image URL
    if (/^https?:\/\//i.test(value)) {
        try {
            const parsedUrl = new URL(value);

            if (
                parsedUrl.protocol === "https:" &&
                parsedUrl.hostname === "res.cloudinary.com"
            ) {
                return value;
            }
        } catch (error) {
            return null;
        }
    }

    // Old local filenames cannot be accessed by Render.
    return null;
};

const getNumericScore = (value) => {
    const score = Number(value);

    return Number.isFinite(score) ? score : 0;
};


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

        if (
            lostItem.type !== "lost" ||
            foundItem.type !== "found"
        ) {
            return res.status(400).json({
                message: "Please select one Lost item and one Found item"
            });
        }

        const existingMatch = await Match.findOne({
            lostItemId: lostItem._id,
            foundItemId: foundItem._id
        });

        if (existingMatch) {
            const populatedMatch = await Match.findById(
                existingMatch._id
            )
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
            imageScore: getNumericScore(imageScore),
            textScore: getNumericScore(textScore),
            categoryScore: getNumericScore(categoryScore),
            locationScore: getNumericScore(locationScore),
            timeScore: getNumericScore(timeScore),
            finalScore: getNumericScore(finalScore),
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
// AUTOMATIC AI MATCHING - CLOUDINARY + YOLO + CLIP
// =====================================================

const createAIMatch = async (req, res) => {
    try {
        console.log("======================================");
        console.log("AUTOMATIC AI MATCHING STARTED");
        console.log("======================================");

        // Get active Lost items
        const lostItems = await Item.find({
            type: "lost",
            status: "active"
        });

        // Get active Found items
        const foundItems = await Item.find({
            type: "found",
            status: "active"
        });

        console.log("Total Lost Items:", lostItems.length);
        console.log("Total Found Items:", foundItems.length);

        if (
            lostItems.length === 0 ||
            foundItems.length === 0
        ) {
            return res.status(200).json({
                message: "No active Lost or Found items available",
                totalLostItems: lostItems.length,
                totalFoundItems: foundItems.length,
                createdMatches: 0,
                skippedPairs: 0,
                failedPairs: []
            });
        }

        // Read Python AI server URL from Render environment
        const configuredAIUrl = process.env.AI_API_URL?.trim();

        if (!configuredAIUrl) {
            console.error("AI_API_URL is missing");

            return res.status(500).json({
                message: "AI_API_URL is missing in Render environment variables"
            });
        }

        let aiApiUrl;

        try {
            const parsedUrl = new URL(configuredAIUrl);

            if (
                parsedUrl.protocol !== "https:" &&
                parsedUrl.protocol !== "http:"
            ) {
                throw new Error("Invalid AI_API_URL protocol");
            }

            aiApiUrl = configuredAIUrl.replace(/\/+$/, "");

        } catch (error) {
            return res.status(500).json({
                message: "Invalid AI_API_URL. Check Render environment variables."
            });
        }

        const matchEndpoint = `${aiApiUrl}/match`;

        console.log("Python AI Endpoint:", matchEndpoint);

        let createdMatches = 0;
        let skippedPairs = 0;
        let processedPairs = 0;

        const failedPairs = [];

        // Compare every active Lost item with every active Found item
        for (const lostItem of lostItems) {

            for (const foundItem of foundItems) {

                try {

                    // -------------------------------------
                    // CHECK EXISTING MATCH
                    // -------------------------------------

                    const existingMatch = await Match.findOne({
                        lostItemId: lostItem._id,
                        foundItemId: foundItem._id
                    });

                    if (existingMatch) {
                        console.log(
                            "Existing match skipped:",
                            lostItem.title,
                            "WITH",
                            foundItem.title
                        );

                        skippedPairs++;
                        continue;
                    }

                    // -------------------------------------
                    // GET CLOUDINARY IMAGE URLS
                    // -------------------------------------

                    const lostImage = getImageUrl(lostItem.image);
                    const foundImage = getImageUrl(foundItem.image);

                    if (!lostImage || !foundImage) {

                        console.log(
                            "Skipping pair: Missing or invalid Cloudinary image URL",
                            {
                                lostItem: lostItem.title,
                                lostImage: lostItem.image,
                                foundItem: foundItem.title,
                                foundImage: foundItem.image
                            }
                        );

                        skippedPairs++;
                        continue;
                    }

                    // -------------------------------------
                    // START IMAGE COMPARISON
                    // -------------------------------------

                    console.log("--------------------------------------");

                    console.log(
                        "Comparing:",
                        lostItem.title,
                        "WITH",
                        foundItem.title
                    );

                    console.log("Lost Image:", lostImage);
                    console.log("Found Image:", foundImage);

                    // -------------------------------------
                    // SEND IMAGES TO PYTHON AI SERVER
                    // -------------------------------------

                    const aiResponse = await fetch(
                        matchEndpoint,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({

                                // Complete Cloudinary HTTPS URLs
                                lost_image: lostImage,
                                found_image: foundImage,

                                // Item descriptions
                                lost_description:
                                    lostItem.description || "",

                                found_description:
                                    foundItem.description || "",

                                // Item categories
                                lost_category:
                                    lostItem.category || "",

                                found_category:
                                    foundItem.category || "",

                                // Item locations
                                lost_location:
                                    lostItem.location || "",

                                found_location:
                                    foundItem.location || "",

                                // Dates and times
                                lost_time:
                                    `${lostItem.date || ""} ${lostItem.time || ""}`,

                                found_time:
                                    `${foundItem.date || ""} ${foundItem.time || ""}`
                            }),

                            // Allow enough time for CLIP and YOLO processing
                            signal: AbortSignal.timeout(90000)
                        }
                    );

                    // -------------------------------------
                    // READ PYTHON RESPONSE
                    // -------------------------------------

                    const responseText = await aiResponse.text();

                    let aiResult;

                    try {
                        aiResult = JSON.parse(responseText);
                    } catch (parseError) {
                        throw new Error(
                            `Python returned invalid JSON: ${responseText.slice(0, 500)}`
                        );
                    }

                    console.log("AI RESPONSE:", aiResult);

                    if (!aiResponse.ok) {
                        throw new Error(
                            aiResult.message ||
                            `Python AI returned HTTP ${aiResponse.status}`
                        );
                    }

                    if (aiResult.message && !aiResult.result) {
                        throw new Error(aiResult.message);
                    }

                    // -------------------------------------
                    // GET AI SCORES
                    // -------------------------------------

                    const finalScore =
                        aiResult.final_score ??
                        aiResult.finalScore;

                    if (
                        finalScore === undefined ||
                        finalScore === null ||
                        !Number.isFinite(Number(finalScore))
                    ) {
                        throw new Error(
                            "AI final score is missing or invalid"
                        );
                    }

                    processedPairs++;

                    const result =
                        String(aiResult.result || "").toUpperCase();

                    // -------------------------------------
                    // SAVE POSSIBLE MATCH
                    // -------------------------------------

                    if (result === "POSSIBLE MATCH") {

                        const match = await Match.create({

                            lostItemId: lostItem._id,

                            foundItemId: foundItem._id,

                            imageScore: getNumericScore(
                                aiResult.image_score ??
                                aiResult.imageScore
                            ),

                            textScore: getNumericScore(
                                aiResult.text_score ??
                                aiResult.textScore
                            ),

                            categoryScore: getNumericScore(
                                aiResult.category_score ??
                                aiResult.categoryScore
                            ),

                            locationScore: getNumericScore(
                                aiResult.location_score ??
                                aiResult.locationScore
                            ),

                            timeScore: getNumericScore(
                                aiResult.time_score ??
                                aiResult.timeScore
                            ),

                            finalScore: getNumericScore(finalScore),

                            status: "possible"
                        });

                        createdMatches++;

                        console.log(
                            "POSSIBLE MATCH SAVED:",
                            match._id
                        );

                    } else {

                        skippedPairs++;

                        console.log(
                            "No possible match:",
                            result || "Unknown result",
                            "Final Score:",
                            finalScore
                        );
                    }

                } catch (pairError) {

                    console.error("AI MATCHING ERROR:", pairError.message);

                    console.error(
                        "AI MATCHING ERROR CAUSE:",
                        pairError.cause
                    );

                    failedPairs.push({
                        lostItemId: lostItem._id,
                        foundItemId: foundItem._id,
                        lostTitle: lostItem.title,
                        foundTitle: foundItem.title,
                        error: pairError.message
                    });
                }
            }
        }

        // -------------------------------------
        // FINAL RESULT
        // -------------------------------------

        console.log("======================================");
        console.log("AI MATCHING COMPLETED");
        console.log("Processed Pairs:", processedPairs);
        console.log("Created Matches:", createdMatches);
        console.log("Skipped Pairs:", skippedPairs);
        console.log("Failed Pairs:", failedPairs.length);
        console.log("======================================");

        return res.status(200).json({

            message: "Automatic AI matching completed",

            totalLostItems: lostItems.length,

            totalFoundItems: foundItems.length,

            processedPairs,

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
            .sort({
                createdAt: -1
            });

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

        if (
            !["possible", "confirmed", "rejected"].includes(status)
        ) {

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
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
    createMatch,
    createAIMatch,
    getMatches,
    getMatchById,
    updateMatchStatus
};
