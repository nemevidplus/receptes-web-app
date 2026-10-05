import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./writerecipe.css";
import defaultImg from "../../assets/food-default.jpg";

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [mealType, setMealType] = useState("reggeli");
  const [ingredientsText, setIngredientsText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [prepTime, setPrepTime] = useState("");
 

  const [file, setFile] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_API_URL + "/recipes/" + id);
        const r = res.data;

        setTitle(r.title || "");
        setMealType(r.mealType || "reggeli");
        setIngredientsText((r.ingredients || []).join("\n"));
        setInstructions(r.instructions || "");
        setTagsText((r.tags || []).join(", "));
        setPrepTime(r.prepTime ?? "");
       
        setCurrentPhoto(r.photo || "");
      } catch (err) {
        console.log("Load recipe failed:", err?.response?.data || err.message);
      }
    };
    load();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();

    const updatedRecipe = {
      title,
      mealType,
      ingredients: ingredientsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      instructions,
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      prepTime: prepTime === "" ? undefined : Number(prepTime),
      
    };

    Object.keys(updatedRecipe).forEach(
      (k) => updatedRecipe[k] === undefined && delete updatedRecipe[k]
    );

    // Ha új képet választottál, töltsd fel és írd be a photo mezőt
    if (file) {
      const data = new FormData();
      const filename = Date.now() + "_" + file.name;
      data.append("name", filename);
      data.append("file", file);

      try {
        await axios.post(process.env.REACT_APP_API_URL + "/upload", data);
        updatedRecipe.photo = filename;
      } catch (err) {
        console.log("Upload failed:", err?.response?.data || err.message);
        return;
      }
    }

    try {
      const res = await axios.put( process.env.REACT_APP_API_URL + "/recipes/" + id, updatedRecipe);
      alert("Mentve ✅");
      navigate("/recipe/" + res.data._id);
    } catch (err) {
      console.log("Update failed:", err?.response?.data || err.message);
    }
  };

  return (
    <div className="write">
      <div className="postImgWrapper">
        {/* előnézet: új file, különben a régi kép */}
        {file ? (
          <img className="writeImg" src={URL.createObjectURL(file)} alt="" />
        ) : currentPhoto ? (
          <img
            className="writeImg"
            src={process.env.REACT_APP_PUBLIC_FOLDER + currentPhoto}
            alt=""
          />
        ) : ( <img className="writeImg" src={defaultImg} alt="" />
        )}
      </div>

      <form className="writeForm" onSubmit={handleSave}>
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
            <option value="reggeli">Reggeli</option>
            <option value="ebéd">Ebéd</option>
            <option value="vacsora">Vacsora</option>
            <option value="uzsi">Uzsi</option>
          </select>
        </div>

        <div className="writeFormGroup">
          <textarea
            className="writeInput writeText"
            placeholder={"Hozzávalók (soronként egy)"}
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
          />
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
            placeholder="Tagek (vesszővel)"
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
          Mentés (szerkesztés)
        </button>
      </form>
    </div>
  );
}

