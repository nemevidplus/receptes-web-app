const mongoose = require("mongoose");

const MealPlanSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: false,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        isPublic: {
            type: Boolean,
            default: false,
        },
        isAdminPlan: {
            type: Boolean,
            default: false,
        },

        basedOn: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MealPlan",
            default: null,
        },

        noteTitle: { type: String, default: ""},
        noteText: { type: String, default: ""},
        notePhoto: {type: String, default: ""},
        weekStart: { type: Date, required: true },
        weekEnd: { type: Date, required: true },
        items: [
            {
                day: { type: String, default: "" },
                slot: String,
                recipeId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Recipe",
                }
            }
        ]
    },
   

    {timestamps: true}
);

module.exports = mongoose.model("MealPlan", MealPlanSchema);