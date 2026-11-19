import { Link } from "react-router-dom";
import "./recipeCard.css"
import defaultImg from "../../assets/food-default.jpg"

export default function RecipeCard({ recipe }) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const getImgSrc = (photo) => {
    if (!photo) return defaultImg;
    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      return photo;
    }
    return (PF || "") + photo;
  };

  const imgSrc = getImgSrc(recipe.photo);

  return (
    <div className="recipePost"> 
      
        
        <div className="recipeImgWrap">
        <Link to={`/recipe/${recipe._id}`} className="link">
      <img className="recipeImg" src={imgSrc} alt="" />
       <div className= "recipeOverlay "></div>
        <span className="recipeTitle" >{recipe.title}</span>
        </Link>
        </div>
       
    

      <div className="recipeInfo">
        <div className="recipeCats">
          <span className="recipeCat">{recipe.mealType}</span>
          {recipe.tags?.slice(0, 3).map((t, idx) => (
            <span key={idx} className="recipeCat">{t}</span>
          ))}
        </div>

        <Link to={`/recipe/${recipe._id}`} className="link">
         
        </Link>
      </div>
    </div>
  );
}
