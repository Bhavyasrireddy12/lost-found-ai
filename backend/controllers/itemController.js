
const Item = require("../models/Item");
const Match = require("../models/Match");
const upload = require("../middleware/uploadMiddleware");

// =====================================================
// CREATE ITEM + CLOUDINARY + AUTOMATIC AI MATCHING
// =====================================================

const createItem = async (req, res) => {
    try {
        const {
            userId,
            type,
            category,
            title,
            description,
            location,
            date,
            time,
            status
        } = req.body;

        // Check image
        if (!req.file) {
            return res.status(400).json({
                message: "Image is required"
            });
        }

        // Validate type
        if (!type || !["lost", "found"].includes(type.toLowerCase())) {
            return res.status(400).json({
                message: "Type must be either lost or found"
            });
        }

        // Validate category
        const allowedCategories = [
            "backpack",
            "bottle",
            "laptop",
            "phone",
            "book",
            "wallet",
            "keys",
            "earphones",
            "id_card",
            "other"
        ];

        if (
            !category ||
            !allowedCategories.includes(category.toLowerCase())
        ) {
            return res.status(400).json({
                message: "Invalid category"
            });
        }

        // Validate status
        const itemStatus = status
            ? status.toLowerCase()
            : "active";

        if (!["active", "matched", "claimed"].includes(itemStatus)) {
            return res.status(400).json({
                message: "Status must be active, matched, or claimed"
            });
        }

        // Upload image to Cloudinary
        const uploadedImage = await upload.uploadToCloudinary(req.file);

        // Save item in MongoDB
        const item = await Item.create({
            userId,
            type: type.toLowerCase(),
            category: category.toLowerCase(),
            title,
            description,
            image: uploadedImage.secure_url,
            location,
            date,
            time,
            status: itemStatus
        });

        // =================================================
        // AUTOMATIC AI MATCHING
        // =================================================

        let automaticMatches = [];

        if (type.toLowerCase() === "found" && itemStatus === "active") {

            // Find active lost items with valid images
            const lostItems = await Item.find({
                type: "lost",
                category: category.toLowerCase(),
                status: "active",
                image: {
                    $exists: true,
                    $nin: [null, ""]
                }
            });

            const aiApiUrl = process.env.AI_API_URL
                ?.trim()
                .replace(/\/+$/, "");

            if (!aiApiUrl) {
                console.warn(
                    "AI_API_URL is not configured. AI matching skipped."
                );
            } else {

                for (const lostItem of lostItems) {
                    try {
                        console.log(
                            "Comparing:",
                            lostItem.title,
                            "WITH",
                            item.title
                        );

                        // Send images and details to Python AI API
                        const aiResponse = await fetch(
                            `${aiApiUrl}/match`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    lost_image: lostItem.image,
                                    found_image: item.image,

                                    lost_description: lostItem.description,
                                    found_description: item.description,

                                    lost_category: lostItem.category,
                                    found_category: item.category,

                                    lost_location: lostItem.location,
                                    found_location: item.location,

                                    lost_time: `${lostItem.date} ${lostItem.time}`,
                                    found_time: `${item.date} ${item.time}`
                                }),
                                signal: AbortSignal.timeout(90000)
                            }
                        );

                        // Check API response
                        if (!aiResponse.ok) {
                            const errorBody = await aiResponse.text();

                            console.error(
                                "AI API returned status:",
                                aiResponse.status
                            );

                            console.error("AI API error body:", errorBody);

                            continue;
                        }

                        const aiResult = await aiResponse.json();

                        console.log("AI RESPONSE:", aiResult);

                        // Save possible matches
                        if (aiResult.result === "POSSIBLE MATCH") {

                            const match = await Match.create({
                                lostItemId: lostItem._id,
                                foundItemId: item._id,

                                imageScore: aiResult.image_score,
                                textScore: aiResult.text_score,
                                categoryScore: aiResult.category_score,
                                finalScore: aiResult.final_score,

                                status: "possible"
                            });

                            automaticMatches.push({
                                matchId: match._id,
                                lostItemId: lostItem._id,
                                foundItemId: item._id,

                                imageScore: aiResult.image_score,
                                textScore: aiResult.text_score,
                                categoryScore: aiResult.category_score,
                                finalScore: aiResult.final_score,

                                result: aiResult.result
                            });

                            console.log(
                                "POSSIBLE MATCH SAVED:",
                                match._id
                            );
                        } else {
                            console.log(
                                "No possible match:",
                                aiResult.result
                            );
                        }

                    } catch (aiError) {
                        console.error(
                            "AI MATCHING ERROR:",
                            aiError
                        );

                        console.error(
                            "ERROR MESSAGE:",
                            aiError.message
                        );

                        console.error(
                            "ERROR CAUSE:",
                            aiError.cause
                        );
                    }
                }
            }
        }

        // Final response
        return res.status(201).json({
            message: "Item created successfully",
            item,
            automaticMatches
        });

    } catch (error) {
        console.error("Create Item Error:", error);

        return res.status(500).json({
            message: error.message
        });
    }
};


// =====================================================
// GET ALL ITEMS + SEARCH / FILTER
// =====================================================

const getItems = async (req, res) => {
    try {
        const {
            type,
            category,
            location,
            date,
            status,
            search
        } = req.query;

        const filter = {};

        if (type) {
            filter.type = type.toLowerCase();
        }

        if (category) {
            filter.category = category.toLowerCase();
        }

        if (location) {
            filter.location = {
                $regex: location,
                $options: "i"
            };
        }

        if (date) {
            filter.date = date;
        }

        if (status) {
            filter.status = status.toLowerCase();
        }

        if (search) {
            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        const items = await Item.find(filter).sort({
            createdAt: -1
        });

        return res.json(items);

    } catch (error) {
        console.error("Get Items Error:", error);

        return res.status(500).json({
            message: error.message
        });
    }
};


// =====================================================
// GET LOST ITEMS
// =====================================================

const getLostItems = async (req, res) => {
    try {
        const items = await Item.find({
            type: "lost"
        }).sort({
            createdAt: -1
        });

        return res.json(items);

    } catch (error) {
        console.error("Get Lost Items Error:", error);

        return res.status(500).json({
            message: error.message
        });
    }
};


// =====================================================
// GET FOUND ITEMS
// =====================================================

const getFoundItems = async (req, res) => {
    try {
        const items = await Item.find({
            type: "found"
        }).sort({
            createdAt: -1
        });

        return res.json(items);

    } catch (error) {
        console.error("Get Found Items Error:", error);

        return res.status(500).json({
            message: error.message
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    createItem,
    getItems,
    getLostItems,
    getFoundItems
};
