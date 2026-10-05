import { useContext, useState } from "react";
import {Context} from "../../context/Context";
import "./writerecipe.css";
import Header from "../../components/header/Header";
import axios from "axios";
import bg from "../../assets/mealplan16.jpg";
import bgVideo from "../../assets/fozz-video.mp4";

export default function WriteRecipe() {

  const [title, setTitle] = useState("");
  const [mealType, setMealType] = useState("");
  const [ingredients, setIngredients] = useState([
    { name:"", amount:"",  unit: "",}
  ]); 


  const [instructions, setInstructions] = useState("");
  const [tagsText, setTagsText] = useState(""); 
  const [prepTime, setPrepTime] = useState("");


  const [file, setFile] = useState(null);



const {user} = useContext (Context);


  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  
  const addIngredientRow = () => {
    setIngredients([...ingredients, { name:"", amount:"",  unit: ""}]);
  };


  const removeIngredientRow = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      console.log("nincs bejelentkezett felhasználó!");
      return;
    }

 
    const formattedIngredients = ingredients
      .filter((item) => item.name.trim() !== "")
      .map((item) => {
        const amt = item.amount ? item.amount.trim() + " " : "";
        const unt = item.unit ? item.unit + " " : "";
        return `${amt}${unt}${item.name.trim()}`.trim();
      });
    const newRecipe = {
      title,
      mealType,
      ingredients: formattedIngredients,
      tags: tagsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      instructions,
   
      prepTime: prepTime ? Number(prepTime) : undefined,
      createdBy: user._id,
    };

  

    if (file) {
      const data = new FormData();
      const filename = Date.now() + "_" + file.name;
      data.append("name", filename);
      data.append("file", file);
      newRecipe.photo = filename;

      try {
        await axios.post("/upload", data);
      } catch (err) {
        console.log("Upload failed", err);
      }
    }

    try {
      const res = await axios.post("/recipes", newRecipe);
      
      window.location.replace("/recipe/" + res.data._id);
    } catch (err) {
      console.log("Create post failed", err?.response?.data || err);
    }
  };

  return (
  <div className="writePage">
<Header 
title="Saját recepted" 
bgImage={bg}
bgVideo={bgVideo} 
className="writeRecipeHeader" style={{ backgroundPosition:"center 67%" }}/>
   
   
    <div className="write">


    <div className="postImgWrapper">

      </div>
      <form className="writeForm" onSubmit={handleSubmit}>
        <div className="writeFormGroup">
          <label htmlFor="fileInput">
            <i className="writeIcon fas fa-plus"></i>
          </label>

          <input
            id="fileInput"
            type="file"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])}
          />

          <input
            className="writeInput"
            placeholder="Recept neve"
            type="text"
            autoFocus={true}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="writeFormGroup">
        <select 
        className="writeInput"
        value={mealType}
        onChange={(e) => setMealType(e.target.value)}
        >
        <option value="" disabled>étkezés típusa</option>
        <option value="reggeli">reggeli</option>
        <option value="ebéd">ebéd</option>
        <option value="vacsora">vacsora</option>
        <option value="uzsi">uzsi</option>
        <option value="nem ezek, köszi!">nem ezek, köszi!</option>
        </select>
        </div>


        <div className="writeFormGroup ingredientsSection">
            <label style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>
              Hozzávalók
            </label>

            {ingredients.map((ing, index) => (
              <div key={index} className="ingredientRow">
               
               
                <input
                  type="text"
                  placeholder="Hozzávaló neve (pl. csirkemell)"
                  className="ingNameInput"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                />

                  <input
                  type="number"
                  placeholder="Mennyiség"
                  className="ingAmountInput"
                  value={ing.amount}
                  onChange={(e) => handleIngredientChange(index, "amount", e.target.value)}
                />

                  <select
                  className="ingUnitSelect"
                  value={ing.unit}
                  onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                >
                  <option value=""></option>
                  <option value="g">g</option>
                  {/* <option value="dkg">dkg</option>
                  <option value="kg">kg</option> */}
                  <option value="ml">ml</option>
                  {/* <option value="dl">dl</option>
                  <option value="l">l</option> */}
                  <option value="db">db</option>
                  <option value="ek">ek (evőkanál)</option>
                  <option value="tk">tk (teáskanál)</option>
                  <option value="csipet">csipet</option>
                  <option value="ízlés szerint">ízlés szerint</option>
                </select>

                {ingredients.length > 1 && (
                  <button 
                    type="button" 
                    className="removeIngBtn" 
                    onClick={() => removeIngredientRow(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button type="button" className="addIngBtn" onClick={addIngredientRow}>
              + Hozzávaló hozzáadása
            </button>
          </div>

  

        <div className="writeFormGroup">
          <textarea
            className="writeInput writeText"
            placeholder={"Elkészítés leírása..."}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>

        <div className="writeFormGroup">
          <input
            className="writeInput"
            placeholder="Tagek (vesszővel) pl.: gyors, gyerek, csirke"
            type="text"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
          />
        </div>

        <div className="writeFormGroup">
          <input
            className="writeInput"
            placeholder="Elkészítési idő (perc)"
            type="number"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
          />
          
        </div>

        <button className="writeSubmit" type="submit">
          Mentés
        </button>
      </form>
    </div>
    </div>
   
  );
}
