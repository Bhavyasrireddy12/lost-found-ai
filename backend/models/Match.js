
const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
    {
        lostItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true
        },

        foundItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true
        },

        imageScore: {
            type: Number,
            default: 0
        },

        textScore: {
            type: Number,
            default: 0
        },

        categoryScore: {
            type: Number,
            default: 0
        },

        locationScore: {
            type: Number,
            default: 0
        },

        timeScore: {
            type: Number,
            default: 0
        },

        finalScore: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: ["possible", "confirmed", "rejected"],
            default: "possible"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Match", matchSchema);
