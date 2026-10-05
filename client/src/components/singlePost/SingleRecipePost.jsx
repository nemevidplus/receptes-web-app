
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import "./singleRecipePost.css";
import { useContext } from "react";
import { Context } from "../../context/Context";
import {useNavigate} from "react-router";
import defaultImg from "../../assets/food-default.jpg"
import spoonForkSmall from "../../assets/spoon-and-fork.png";

export default function SingleRecipe() {

  const { id } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [tab, setTab] = useState("ingredients");

  // 🆕 MealPlan state-ek
  const [showAdd, setShowAdd] = useState(false);


  const { user } = useContext(Context);

  let navigate = useNavigate();

  
  useEffect(() => {
    const fetchRecipe = async () => {
      const res = await axios.get("/recipes/" + id);
      setRecipe(res.data);
    };
    fetchRecipe();
  }, [id]);

const handleDelete = async () => {
 if (window.confirm("Biztosan törölni akarod a receptet?")){
  try {

    await axios.delete(`/recipes/${recipe._id}`, {
      data: {userId: user._id}
      
    });
    navigate("/receptek");

  } catch (err) {
    console.error(err);
    alert("Hiba történt a törlés során! Ellenőrizd a konzolt a részletekért.");
  }}
}

  
  const handleAddToPlan = async () => {
    try {

      const isAdmin = user?.isAdmin || user?.role === "admin";
      const queryParam = isAdmin ? "?type=admin" : `?userId=${user?._id}`;

      const current = await axios.get(`/mealplans/current${queryParam}`);

      if (!current.data?._id) {
        alert("Nincs aktív heti menü!");
        return;
      }

      await axios.post(`/mealplans/${current.data._id}/items`, {
        
        recipeId: recipe._id,
      });

      alert("Hozzáadva a heti menühöz!");
      setShowAdd(false);

    } catch (err) {
      console.log("MealPlan add failed", err);
    }
  };

  if (!recipe) return null;

  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const imgSrc = recipe.photo ? PF + recipe.photo : defaultImg;

  return (
    <div className="singlePost">
      <div className="singlePostWrapper">

       
          <img
            src={imgSrc}
            alt=""
            className="singlePostImg"
          />
      

        <div className="singleRecipeWrap">
        <div className="singleRecipeTitleWrap">
        <img 
            src={spoonForkSmall} 
            className="stirringUtensil" 
            alt="spoon and fork icon" 
          />
          <h1 className="singlePostTitle">{recipe.title}</h1>
          </div>
          {user && recipe.createdBy === user._id && 
          (
            <div className="recipeOwnerActionBtns">
              <Link to={`/recipe/${recipe._id}/edit`} className="editRecipeBtn">
                Szerkesztés
              </Link>
              <button className="deleteRecipeBtn" onClick={handleDelete}>
                Törlés
              </button>
              </div>
          )}

       

          {/* 🆕 ADD TO PLAN GOMB */}
          {user && ( <button 
            className="addToPlanBtn"
            onClick={handleAddToPlan}
          >
            Hozzáadás a heti menühöz
          </button> )}

          
          {/* TAB NAV */}
          <ul className="recipeCardNav">
            <li>
              <h3
                className={tab === "ingredients" ? "active" : ""}
                onClick={() => setTab("ingredients")}
              >
                Hozzávalók
              </h3>
            </li>
            <li>
              <h3
                className={tab === "instructions" ? "active" : ""}
                onClick={() => setTab("instructions")}
              >
                Elkészítés
              </h3>
            </li>
          </ul>

          {/* TAB CONTENT */}
          {tab === "ingredients" ? (
            <ul className="recipeCardIngredients">
              {recipe.ingredients?.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
          ) : (
            <div className="recipeCardMethod">
              <p className="instructions">
                {recipe.instructions}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
