import {useContext, useEffect, useState} from "react";
import "./recipesPage.css"
import Recipes from "../../components/recipes/Recipes";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/header/Header";
import bg from "../../assets/receptek.jpeg";
import axios from "axios"
import { useLocation } from "react-router-dom";
import { Context } from "../../context/Context";

import RecipeFilterItem from "../../components/recipeFilter/RecipeFilterItem";



export default function Home() {

const [recipes, setRecipes] = useState([]);
const {search} = useLocation();
const searchQuery = new URLSearchParams(search).get("search") || "";
const [selectedType, setSelectedType] = useState("all");
const [selectedTag, setSelectedTag] = useState(null);
const {user} = useContext(Context);
const [ recipeScope, setRecipeScope] = useState("all");


const tabs = [
  { id: "all", title: "Összes" },
  ...(user ? [{ id: "user-recipes", title: "Saját receptjeim", customClass:"recipesTab"}] : []),
  { id: "gyors", title: "Gyors!" },
  { id: "vega", title: "Vega" },
  { id: "gyerekbarat", title: "Válogatósoknak" },
  { id: "egyedeny", title: "Mosogatás barát" },
  { id: "krem", title: "Krémek" },
  { id: "mealprep", title: "Mealprep" },
];

useEffect(() => {
  const fetchData = async () => {
    let url = user ? `/recipes?userId=${user._id}` : "/recipes";
    if (user?.role === "admin" && recipeScope === "public") {
      url += "&scope=public";
    }
    const r = await axios.get(url);

    setRecipes(Array.isArray(r.data) ? r.data : (r.data?.recipes || []));
  };
  fetchData();
}, [search, user, recipeScope])

const scopeFilteredRecipes = (Array.isArray(recipes) ? recipes : []).filter((r) => {
  if (selectedType === "user-recipes") {
    return user && r.createdBy === user._id;
  } else {
    return r.isPublic === true;
  }
});

const allTags = Array.from(
  new Set(
    scopeFilteredRecipes
      .flatMap((r) => r.tags || [])
      .map((t) => t.trim())
      .filter(Boolean)
  )
).sort((a, b) => a.localeCompare(b, "hu"));

const filteredRecipes = scopeFilteredRecipes.filter((r) => {
  const tags = (r.tags || []).map((t) => t.toLowerCase());

 

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const titleMatches = r.title && r.title.toLowerCase().includes(query);
      const tagMatches = tags.some((t) => t.includes(query));
      
 
      if (!titleMatches && !tagMatches) return false;
    }


    if (selectedTag) {
    if (!tags.includes(selectedTag.toLowerCase())) return false;
  }


  if (selectedType === "all" || selectedType === "user-recipes") return true;

  if (selectedType === "gyors") {
    return r.prepTime && r.prepTime <= 30;
  }

  if (selectedType === "vega") {
    return tags?.includes("vega") || tags?.includes("vegetáriánus");
  }

  if (selectedType === "gyerekbarat") {
    return tags?.includes("gyerek");
  }

  if (selectedType === "egyedeny") {
    return tags?.includes("mosogatás") || tags?.includes("egyedény");
  }

  if (selectedType === "krem") {
    return tags?.includes("krem") || tags?.includes("krém");
  }

  if (selectedType === "mealprep") {
    return tags?.includes("mealprep") || tags?.includes("előző nap");
  }

  return true;
});



  return (
    <>
<Header title="Receptek" bgImage={bg}/>

 <div className="mobileTagCloud">
 <div className="sidebarItem">

 <div className="tagCloudHeader">
    {/* <img className="tagCloudIcon" src={spoonFork} alt="" /> */}
    <span className="sidebarTitle">CÍMKEFELHŐ</span>
  
  {/* <ul className="sidebarList"> */}
  {selectedTag && (
          <button className="tagClearBtn" onClick={() => setSelectedTag(null)}>
            Szűrés törlése: {selectedTag} ✕
          </button>
        )}

        <ul className="sidebarList">
          {allTags.map((t) => (
            <li
              key={t}
              className={`sidebarListItem ${selectedTag === t ? "activeTag" : ""}`}
              onClick={() => setSelectedTag(t)}
              role="button"
            
              
            >
              #{t}
            </li>
          ))}
        </ul>
        </div>
      </div>
</div>
 <div className="home">
        <div className="recipesPage">

          <ul className="recipeFilterNav">
            {tabs.map((t) => (
              <RecipeFilterItem
                className={`recipeTab ${t.customClass || ""}`}
                key={t.id}
                title={t.title}
                active={selectedType === t.id}
                onClick={() => setSelectedType(t.id)}
              />
            ))}
          </ul>

          <Recipes recipes={filteredRecipes} />
        </div>
        
        <Sidebar
          tags={allTags}
          selectedTag={selectedTag}
          onSelectTag={(tag) => setSelectedTag(tag)}
          onClearTag={() => setSelectedTag(null)}
        />
     </div>
    </>
    
  )
}
