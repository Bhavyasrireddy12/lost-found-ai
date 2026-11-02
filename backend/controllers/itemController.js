const Item = require("../models/Item");
const Match = require("../models/Match");
const path = require("path");
const fs = require("fs");


// =====================================================
// CREATE ITEM
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


        // ---------------------------------------------
        // Check image
        // ---------------------------------------------

        const image = req.file
            ? req.file.filename
            : null;


        if (!image) {
            return res.status(400).json({
                message: "Image is required"
            });
        }


        // ---------------------------------------------
        // Validate type
        // ---------------------------------------------

        if (
            !type ||
            !["lost", "found"].includes(type.toLowerCase())
        ) {
            return res.status(400).json({
                message: "Type must be either lost or found"
            });
        }


        // ---------------------------------------------
        // Validate category
        // ---------------------------------------------

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
            !allowedCategories.includes(
                category.toLowerCase()
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid category. Use backpack, bottle, laptop, phone, book, wallet, keys, earphones, id_card, or other"
            });
        }


        // ---------------------------------------------
        // Validate status
        // ---------------------------------------------

        const itemStatus = status
            ? status.toLowerCase()
            : "active";


        if (
            ![
                "active",
                "matched",
                "claimed"
            ].includes(itemStatus)
        ) {
            return res.status(400).json({
                message:
                    "Status must be active, matched, or claimed"
            });
        }


        // ---------------------------------------------
        // Create item
        // ---------------------------------------------

        const item = await Item.create({

            userId,

            type: type.toLowerCase(),

            category: category.toLowerCase(),

            title,

            description,

            image,

            location,

            date,

            time,

            status: itemStatus

        });


        // =================================================
        // AUTOMATIC AI MATCHING
        // =================================================

        let automaticMatches = [];


        if (
            type.toLowerCase() === "found" &&
            itemStatus === "active"
        ) {

            // Find active lost items
            // with the same category

            const lostItems = await Item.find({

                type: "lost",

                category: category.toLowerCase(),

                status: "active",

                image: {
                    $ne: null
                }

            });


            // ---------------------------------------------
            // Compare found item with each lost item
            // ---------------------------------------------

            for (const lostItem of lostItems) {

                try {

                    const lostImagePath = path.join(
                        __dirname,
                        "..",
                        "uploads",
                        lostItem.image
                    );


                    const foundImagePath = path.join(
                        __dirname,
                        "..",
                        "uploads",
                        item.image
                    );


                    // Skip if image files don't exist

                    if (
                        !fs.existsSync(
                            lostImagePath
                        )
                    ) {
                        continue;
                    }


                    if (
                        !fs.existsSync(
                            foundImagePath
                        )
                    ) {
                        continue;
                    }


                    // -------------------------------------
                    // Send request to Python AI
                    // -------------------------------------

                    const aiResponse = await fetch(
                        "http://127.0.0.1:8000/match",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                lost_image:
                                    lostImagePath,

                                found_image:
                                    foundImagePath,

                                lost_description:
                                    lostItem.description,

                                found_description:
                                    item.description,

                                lost_category:
                                    lostItem.category,

                                found_category:
                                    item.category

                            })
                        }
                    );


                    const aiResult =
                        await aiResponse.json();


                    if (!aiResponse.ok) {
                        continue;
                    }


                    // -------------------------------------
                    // Save match
                    // -------------------------------------

                    const match =
                        await Match.create({

                            lostItemId:
                                lostItem._id,

                            foundItemId:
                                item._id,

                            imageScore:
                                aiResult.imageScore,

                            textScore:
                                aiResult.textScore,

                            categoryScore:
                                aiResult.categoryScore,

                            finalScore:
                                aiResult.finalScore,

                            status:
                                "possible"

                        });


                    automaticMatches.push({

                        matchId:
                            match._id,

                        lostItemId:
                            lostItem._id,

                        foundItemId:
                            item._id,

                        imageScore:
                            aiResult.imageScore,

                        textScore:
                            aiResult.textScore,

                        categoryScore:
                            aiResult.categoryScore,

                        finalScore:
                            aiResult.finalScore,

                        result:
                            aiResult.result

                    });


                } catch (aiError) {

                    console.error(
                        "AI matching error:",
                        aiError.message
                    );

                }

            }

        }


        // ---------------------------------------------
        // Final response
        // ---------------------------------------------

        res.status(201).json({

            message:
                "Item created successfully",

            item,

            automaticMatches

        });


    } catch (error) {

        console.error(
            "Create Item Error:",
            error
        );

        res.status(500).json({
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


        let filter = {};


        if (type) {
            filter.type = type.toLowerCase();
        }


        if (category) {
            filter.category =
                category.toLowerCase();
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
            filter.status =
                status.toLowerCase();
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


        const items = await Item.find(
            filter
        ).sort({
            createdAt: -1
        });


        res.json(items);


    } catch (error) {

        res.status(500).json({
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


        res.json(items);


    } catch (error) {

        res.status(500).json({
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


        res.json(items);


    } catch (error) {

        res.status(500).json({
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