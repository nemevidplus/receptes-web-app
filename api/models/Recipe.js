const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema( 
    { title: { type: String, required: true, unique: true, }, 
    photo: { type: String, }, 
    mealType: { type: String, 
        enum: ["reggeli", "ebéd", "vacsora", "uzsi", "nem ezek, köszi!", ""], required: false, }, 
    ingredients: { type: [String], required: true, }, 
    instructions: { type: String, required: false, }, 
    tags: { type: [String], required: false, }, 
    prepTime: { type: Number, required: false, }, 
    // servings: { type: Number, },
    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    isPublic: {
        type: Boolean,
        default: false,
    },
    }, 
    { timestamps: true } ); 
    
    module.exports = mongoose.model("Recipe", RecipeSchema);