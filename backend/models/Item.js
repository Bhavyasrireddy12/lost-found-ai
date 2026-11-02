const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        type: {
            type: String,
            enum: ["lost", "found"],
            required: true
        },

        category: {
            type: String,
            required: true
        },

        title: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        image: {
            type: String,
            required: true
        },

        location: {
            type: String,
            required: true
        },

        date: {
            type: String,
            required: true
        },

        time: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["active", "matched", "claimed"],
            default: "active"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);