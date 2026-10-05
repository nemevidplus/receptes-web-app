import RecipeCard from "../recipeCard/RecipeCard";
import "./recipes.css"

export default function Recipes({ recipes }) {
  return (
    <div className="recipes">
    <div className="recipesGrid">
      {recipes.map((r) => (
        <RecipeCard key={r._id} recipe={r} />
      ))}
    </div>
    </div>
  );
}
