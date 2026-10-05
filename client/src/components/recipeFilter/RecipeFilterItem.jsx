import "./recipeFilter.css";


const RecipeFilter = ( {title, active, onClick, className}) => {
  return (
  
      <li 
      className={`${className || ""} recipeFilterItem ${active ? "active" : ""}`}
      onClick={onClick}>
        {title}
      </li>
  
  )
}

export default RecipeFilter;
