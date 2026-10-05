import "./mykitchen.css";
import "../../components/mealplan/mealplan.css"
import Header from "../../components/header/Header";
import bgVideo from "../../assets/mykitchen-video.mp4";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../../components/header/header.css"
import bg from "../../assets/mealplan17.jpg";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../../context/Context";
import defaultImg from "../../assets/food-default.jpg"
import { generateShoppingListFromItems } from "../../utils/shoppingList";

export default function MyKitchen() {


    const [plan, setPlan] = useState(null);
    const [pastPlans, setPastPlans] = useState([]);
    const [showTopBtn, setShowTopBtn] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [allRecipes, setAllRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [showShoppingModal, setShowShoppingModal] = useState(false);
    const [mobileActiveId, setMobileActiveId] = useState(null);
  
    const currentNoteRef = useRef(null);
    const pastNoteRefs = useRef([]);
  
  
    const { user } = useContext(Context);
    const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  
 // MyKitchen.jsx - useEffect csere:
useEffect(() => {
    const fetchPlan = async () => {
      if (!user?._id) return;
  
      try {
        // 1. Saját aktuális terv (vagy fallback adminéra a backend logika szerint)
        const currentRes = await axios.get(`${process.env.REACT_APP_API_URL}/mealplans/current?userId=${user._id}`);
        setPlan(currentRes.data);
  
        // 2. KIZÁRÓLAG a saját korábbi terveim
        const pastRes = await axios.get(`${process.env.REACT_APP_API_URL}/mealplans?userId=${user._id}`);
        
        const past = (pastRes.data || []).filter((p) => !p.isActive);
        setPastPlans(past); 
      } catch (err) {
        console.log("Hiba a saját konyha adatoknál:", err);
      }
    };
    fetchPlan();
  }, [user]);
  
    useEffect(() => {
      const handleScroll = () => {
        if (window.scrollY > 600) {
          setShowTopBtn(true);
        } else {
          setShowTopBtn(false);
        }
      };
    
      window.addEventListener("scroll", handleScroll);
    
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);
  
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if ( entry.isIntersecting) {
              entry.target.classList.add("show");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.2,
        }
      );
      if(currentNoteRef.current) {
        observer.observe(currentNoteRef.current);
      }
      pastNoteRefs.current.forEach((note) => {
        if (note) observer.observe(note);
      });
  
      return () => observer.disconnect();
    }, [plan, pastPlans]);
  
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };
  
    const handleRemoveItem = async (itemId) => {
      try {
        const res = await axios.delete(`${process.env.REACT_APP_API_URL}/mealplans/${plan._id}/items/${itemId}`);
        setPlan(res.data);
      } catch (err) {
        console.log("Remove failed:", err?.response?.data || err.message);
      }
    };
    const handleDayUpdate = async (itemId, newDay) => {
      try {
        const res = await axios.put(`${process.env.REACT_APP_API_URL}/mealplans/${plan._id}/items/${itemId}`, {
          day: newDay
        });
        setPlan(res.data); // Frissítjük a nézetet az új adattal
      } catch (err) {
        console.log("Hiba a nap frissítésekor:", err);
      }
    };
  
    const handleAddRecipe = async (recipeId) => {
      try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/mealplans/${plan._id}/items`, {
          recipeId: recipeId,
          day: "Választott",
          slot: "Vacsora"
        });
        setPlan(res.data); // Frissíti a tervet a kijelzőn
        setShowModal(false); // Bezárja a modalt
        setSearchTerm(""); // Kiüríti a keresőt a következő alkalomra
      } catch (err) {
        console.log("Hozzáadás hiba:", err);
      }
    };
  
  

  
    useEffect(() => {
      if(showModal) {
        const fetchAll = async () => {
          try {
  
            const url = user 
            ?  process.env.REACT_APP_API_URL + `/recipes?userId=${user._id}`
            : process.env.REACT_APP_API_URL + "/recipes";
            
            const res = await axios.get(url);
            setAllRecipes(res.data);
          }catch(err){
            console.log("Hiba a receptek betöltésénél:", err);
          }
        };
        fetchAll();    }
    }, [showModal, user]);
  
  
    const filteredRecipes = allRecipes.filter((r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()));
  
    const generateGoogleCalendarLink = (item, weekStart) => {
      const days = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];
      const dayIndex = days.indexOf(item.day);
      
      if (dayIndex === -1 || !weekStart) return null;
    
      const ws = new Date(weekStart);
      const currentDay = ws.getDay(); // 0=Vasárnap, 1=Hétfő... 5=Péntek
      
      // Ha péntek (5) vagy szombat (6) vagy vasárnap (0) van, 
      // akkor valószínűleg a KÖVETKEZŐ hétre tervezünk.
      let distanceToMonday;
      if (currentDay === 0) distanceToMonday = 1; // Vasárnapról 1 nap hétfőig
      else if (currentDay >= 5) distanceToMonday = 8 - currentDay; // Péntekről 3, Szombatról 2 nap
      else distanceToMonday = 1 - currentDay; // Hétközben pedig simán vissza hétfőre
    
      const monday = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + distanceToMonday, 12, 0, 0);
      
      const eventDate = new Date(monday);
      eventDate.setDate(eventDate.getDate() + dayIndex);
    
      const y = eventDate.getFullYear();
      const m = String(eventDate.getMonth() + 1).padStart(2, '0');
      const d = String(eventDate.getDate()).padStart(2, '0');
      const dateStr = `${y}${m}${d}`;
    
      const title = encodeURIComponent(`Vacsora: ${item.recipeId.title}`);
      return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${dateStr}`;
    };
    const toggleItemSelection = (itemId) => {
      setSelectedItems((prev) =>
        prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId]
      );
    };
    
  //   const generateShoppingList = () => {
  //     const ingredientsMap = {};
  //     const itemsToProcess = plan?.items?.filter(item => selectedItems.includes(item._id));
    
  //     itemsToProcess?.forEach((item) => {
  //       const recipeIngs = item.recipeId?.ingredients || [];
        
  //       recipeIngs.forEach((ing) => {
  //         if (!ing) return;
    
  //         let name, amount = 0, unit = "";
    
  //         // Ha a hozzávaló egy sima szöveg (mint nálad: "tonhalkonzerv")
  //         if (typeof ing === 'string') {
  //           name = ing;
  //         } 
  //         // Ha a hozzávaló egy objektum ({name: "hagyma", amount: 2...})
  //         else if (typeof ing === 'object') {
  //           name = ing.name;
  //           amount = parseFloat(ing.amount) || 0;
  //           unit = ing.unit || "";
  //         }
    
  //         if (!name) return;
    
  //         const key = name.toLowerCase().trim();
    
  //         if (ingredientsMap[key]) {
  //           // Csak akkor adunk hozzá, ha van értelmezhető mennyiség
  //           if (amount > 0) ingredientsMap[key].amount += amount;
  //         } else {
  //           ingredientsMap[key] = {
  //             name: name,
  //             amount: amount,
  //             unit: unit
  //           };
  //         }
  //       });
  //     });
    
  //     return Object.values(ingredientsMap);
  //   };
  
  //   const sendEmailList = () => {
  //     const list = generateShoppingList();
  //     if (list.length === 0) return;
    
  //     // Lista szöveges formátumba alakítása
  //     const listText = list
  //       .map(ing => `- ${ing.amount > 0 ? ing.amount : ""} ${ing.unit} ${ing.name}`)
  //       .join('%0D%0A'); // Ez a kód felel az újsorért az e-mailben
    
  //     const subject = encodeURIComponent("Heti bevásárlólista");
  //     const body = encodeURIComponent("Szia! Itt a heti bevásárlólista:\n\n") + listText;
  //   // Megnyitja az alapértelmezett levelezőt
  //   window.location.href = `mailto:?subject=${subject}&body=${body}`;
  // };

  const shoppingList = generateShoppingListFromItems(plan?.items, selectedItems);

  const sendEmailList = () => {
    if (shoppingList.length === 0) return;

    const listText = shoppingList
      .map((ing) => `- ${ing.displayString}`)
      .join("%0D%0A");

    const subject = encodeURIComponent("Heti bevásárlólista");
    const body = encodeURIComponent("Szia! Itt a heti bevásárlólista:\n\n") + listText;

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const mealPlanDelete = async (planIdToDelete, isAdminPlan) => {
    // Biztonsági gát: Ha a terv egy Admin terv, egy sima user ne tudja törölni!
    if (isAdminPlan && user?.role !== "admin") {
      alert("Ez a központi adminisztrátori terv, ezt nem törölheted ki! Csak a saját magad által módosított menüt törölheted.");
      return;
    }
  
    if (!window.confirm("Biztosan törölni szeretnéd ezt a heti menüt?")) return;
  
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/mealplans/${planIdToDelete}`);
      
      // Ha az aktuális tervet töröltük ki
      if (planIdToDelete === plan?._id) {
        // Újratöltjük a /current-et, hogy a fallback admin terv visszajöjjön a kijelzőre
        const currentRes = await axios.get(`${process.env.REACT_APP_API_URL}/mealplans/current?userId=${user._id}`);
        setPlan(currentRes.data);
      } else {
        // Ha egy korábbi tervet töröltünk, kiszedjük a pastPlans state-ből
        setPastPlans((prev) => prev.filter((p) => p._id !== planIdToDelete));
      }
      
      alert("Menü sikeresen törölve");
    } catch (err) {
      console.log("Remove failed:", err?.response?.data || err.message);
      alert("Hiba történt a törlés során.");
    }
  };


    return(
      <div >
<Header 
title={`${user.username} vacsiterve`}
bgImage={bg}
bgVideo={bgVideo} 
style={{ backgroundPosition:"center 67%" }}/>
            
          {/* ✅ Heti note blokk */}
          {plan && plan.noteTitle  && (
           
           
          <div ref={currentNoteRef} className="mealplanContainer revealOnScroll">
          <div className="mealplanNote">

            <div className="mealplanNoteInfo">
              <h1 className="mealplanNoteTitle">
                {plan.noteTitle }
              </h1>

            </div>
          </div>
          </div>
      
        )}

       
 
    {/* 🍽️ Recept grid */}
    <div className="mealplanContent">
    <div className="mealplanGrid">
                      {plan?.items?.map((item) => {
                      
                        if (!item.recipeId) {
                          return (
                            <div key={item._id} className="mealCard missingRecipe">
                              <div className="mealCardBody">
                                <p>⚠️ Ez a recept már nem elérhető</p>
                                <button
                                  className="mealRemoveBtn"
                                  onClick={() => handleRemoveItem(item._id)}
                                >
                                  Kiveszem
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={item._id}
                            to={`/recipe/${item.recipeId._id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <div className="myKitchenMealCard">
                              <img
                                src={item.recipeId.photo? PF + item.recipeId.photo :defaultImg}
                                alt=""
                              />
                              <button 
    className="mealCardMenuBtn"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      setMobileActiveId(mobileActiveId === item._id ? null : item._id);
    }}
  >
    ⋮
  </button>

  
  {mobileActiveId === item._id && (
    <div 
      className="mealCardOverlay"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setMobileActiveId(null);
      }}
    >
      <input 
        type="checkbox"
        className="itemSelector"
        checked={selectedItems.includes(item._id)}
        onChange={() => toggleItemSelection(item._id)}
        onClick={(e) => e.stopPropagation()} 
      />

     
        <a 
          href={generateGoogleCalendarLink(item, plan.weekStart)} 
          target="_blank" 
          rel="noreferrer"
          className="calendarBtn"
          title="Google Naptár"
          onClick={(e) => e.stopPropagation()}
        >
          🗓️
        </a>
      

      {user && (
        <button
          className="mealRemoveBtn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRemoveItem(item._id);
          }}
        >
          🗑️
        </button>
      )}
    </div>
  )}
                            
                                <div className="mealCardBodyMyKitchen">


                                {/* <span className="mealDay">
                                  {item.day ? `${item.day} - ` : ""} {item.slot}
                                </span> */}
                                <div className="mealCardTopRow">
                                <input 
                                      type="checkbox"
                                      className="itemSelector"
                                      checked={selectedItems.includes(item._id)}
                                      onChange={() => toggleItemSelection(item._id)}
                                      onClick={(e) => e.stopPropagation()} 
                                    />
                                <span className="mealDay">
                               
                                <select 
                                  className="mealDaySelect"
                                  value={item.day || "Választott"} 
                                
                                  onClick={(e) => e.preventDefault()} 
                                  onMouseDown={(e) => e.stopPropagation()} 
                                  onChange={(e) => {
                                    e.stopPropagation(); 
                                    handleDayUpdate(item._id, e.target.value);
                                  }}
                                >
                                      <option value="Választott">Mikorra?</option>
                                      <option value="Hétfő">Hétfő</option>
                                      <option value="Kedd">Kedd</option>
                                      <option value="Szerda">Szerda</option>
                                      <option value="Csütörtök">Csütörtök</option>
                                      <option value="Péntek">Péntek</option>
                                      <option value="Szombat">Szombat</option>
                                      <option value="Vasárnap">Vasárnap</option>
                                    </select>
                              
                                  </span>
                                  {item.day && item.day !== "Választott" && (
                                      <a 
                                        href={generateGoogleCalendarLink(item, plan.weekStart)} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="calendarBtn"
                                        title="Hozzáadás a Google Naptárhoz"
                                        onClick={(e) => e.stopPropagation()} // Hogy ne vigyen a recept oldalra
                                      >
                                        🗓️
                                      </a>
                                )}
                                </div>

                                                    <h3>{item.recipeId.title}</h3>

                                  

                                      {user && ( <button
                                        className="mealRemoveBtn"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleRemoveItem(item._id);
                                        }}
                                      >
                                        Kiveszem
                                      </button> )}
                                    </div>
                                  </div>
                                  
                                </Link>
                              );
                            })}
                            </div>



<div className="mealplanActions">

<button 
  className="shoppingListBtn" 
  onClick={() => setShowShoppingModal(true)}
  disabled={selectedItems.length === 0}
>
 <nobr> 🛒 &nbsp; Bevásárló lista generálása</nobr>   <br /> ({selectedItems.length} receptből)
</button>

    {user?.role === "user" && (
    
    <button className="addCard" onClick={()=> setShowModal(true)}>
      <div className="addIcon">+</div>
      Recept hozzáadása
    </button>
  )}


  {user && user.role === "user" && (
  
  <button className="deleteMyPlanBtn" onClick={() => mealPlanDelete (plan._id, plan.isAdminPlan)}>
  🗑️ &nbsp;  Heti menü törlése
  </button>

)}
  </div>

</div>
        

        <h2 className="mealplanOldTitle"> Korábbi hetek</h2>
       
       <div className="pastSections">
        {pastPlans.map((p, index) => (
          <div key={p._id} className="mealplanOldBlock">

          {/* <div className="mealplanOldHeader"> */}
        
          
          <div
              ref={(el) => (pastNoteRefs.current[index] = el)}
              className="mealplanContainer revealOnScroll"
            >
            <div className="mealplanNote">

          <h3 className="mealplanNoteTitle"> {p.noteTitle || p.title }</h3>
          {p.noteText && <p className="mealplanNoteText"> {p.noteText}</p>}
          </div>
        

          </div>
          <div className="mealplanContent">
          <div className="mealplanGrid">
          
            {p.items?.map((item, index) => (
              item.recipeId ? (


                <Link
                key={item._id}
                to={`/recipe/${item.recipeId._id}`}
                style={{textDecoration: "none", color: "inherit"}}
                >
                <div className="mealCard">
                <img
                src={item.recipeId.photo? PF + item.recipeId.photo :defaultImg}
                alt=""
                />
                <div className="mealCardBody">
                <span className="mealDay">
                  {item.day ? `${item.day} -` :""} {item.slot}
                </span>
               
                <h3> {item.recipeId.title}</h3>

                </div>

                </div>
                </Link>
           
              ) : null
            ))}
          </div>
          {user && user.role === "user" && (
  
          <button className="deleteMyPlanBtn"  
           onClick={()=> mealPlanDelete(p._id, p.isAdminPlan)}>
          🗑️ Heti menü törlése
          </button>

        )}
          </div>
          </div>

        ))}
        
        </div>

      
        {showTopBtn && (
    <button className="scrollTopBtn" onClick={scrollToTop}>
      ↑
    </button>
  )}
  


        {showModal && (
        <div className="modalOverlay" onClick={() => setShowModal(false)}>
          <div className="recipeModal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2>Válassz egy receptet</h2>
              <button className="closeBtn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <input
              type="text"
              placeholder="Keresés név alapján..."
              className="modalSearchInput"
              autoFocus
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="modalRecipeGrid">
              {filteredRecipes.map((r) => {
               
                const PF = process.env.REACT_APP_PUBLIC_FOLDER;
                const imgSrc = r.photo ? PF + r.photo : defaultImg;
                return (
                <div key={r._id} className="modalRecipeCard" onClick={() => handleAddRecipe(r._id)}>
                  <img src={imgSrc} alt="" />
                  <div className="modalRecipeInfo">
                    <h4>{r.title}</h4>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showShoppingModal && (
  <div className="modalOverlay" onClick={() => setShowShoppingModal(false)}>
    <div className="shoppingModal" onClick={(e) => e.stopPropagation()}>
      <div className="modalHeader">
        <h2>🛒 Bevásárlólista</h2>
        <button onClick={() => setShowShoppingModal(false)}>×</button>
      </div>
      
      {/* <div className="shoppingListContent">
        <ul>
          {generateShoppingList().map((ing, index) => (
            <li key={index} className="shoppingItem">
              <input type="checkbox" id={`ing-${index}`} />
              <label htmlFor={`ing-${index}`}>
                {ing.amount > 0 ? ing.amount : ""} {ing.unit} {ing.name}
              </label>
            </li>
          ))}
        </ul>
      </div> */}


      <div className="shoppingListContent">
  <ul>
    {shoppingList.map((ing, index) => (
      <li key={index} className="shoppingItem">
        <input type="checkbox" id={`ing-${index}`} />
        <label htmlFor={`ing-${index}`}>
          {ing.displayString}
        </label>
      </li>
    ))}
  </ul>
</div>

      <div className="modalFooter" style={{ display: 'flex', gap: '10px' }}>
  <button className="printBtn" onClick={() => window.print()}>
    🖨️ Nyomtatás / PDF
  </button>
  <button 
    className="emailBtn" 
    onClick={sendEmailList}
    style={{ 
      backgroundColor: "turquoise", 
      color: 'white', 
      border: 'none', 
      padding: '12px', 
      borderRadius: '8px', 
      fontWeight: 'bold', 
      cursor: 'pointer',
      flex: 1 
    }}
  >
    ✉️ Küldés e-mailben
  </button>
</div>
    </div>
  </div>
)}

      </div>
        
    )
}