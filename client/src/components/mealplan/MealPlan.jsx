import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./mealplan.css"
import Header from "../header/Header";
import bg from "../../assets/mealplan19.jpg";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../../context/Context";
import defaultImg from "../../assets/food-default.jpg"
import { generateShoppingListFromItems } from "../../utils/shoppingList";

export default function MealPlan() {

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

  


useEffect(() => {
  const fetchPlan = async () => {
    try {
      // 1. Aktuális ADMIN terv mindenki számára
      const currentRes = await axios.get(`${process.env.REACT_APP_API_URL}/mealplans/current?type=admin`);
      setPlan(currentRes.data);

      // 2. Korábbi ADMIN tervek mindenki számára
      const pastRes = await axios.get(`${process.env.REACT_APP_API_URL}/mealplans?type=admin`);
      

      const pastData = Array.isArray(pastRes.data) ? pastRes.data : (pastRes.data?.mealplans || []);
      const past = pastData.filter((p) => !p.isActive);
      setPastPlans(past); 
    } catch (err) {
      console.log("Hiba a főoldali adatoknál:", err);
    }
  };
  fetchPlan();
}, [user]); // Frissüljön, ha be/kijelentkezik valaki


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
      setPlan(res.data); 
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
      setPlan(res.data); 
      setShowModal(false); 
      setSearchTerm(""); 
    } catch (err) {
      console.log("Hozzáadás hiba:", err);
    }
  };


  const handleActivatePlan = async (planId) => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/mealplans/${planId}/activate`);
      setPlan(res.data);
  
      const all = await axios.get(process.env.REACT_APP_API_URL + "/mealplans");
      const past = (all.data || []).filter((p) => !p.isActive);
      setPastPlans(past);
    } catch (err) {
      console.log("Activate failed:", err?.response?.data || err.message);
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


  const toggleItemSelection = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const generateGoogleCalendarLink = (item, weekStart) => {
    const days = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];
    const dayIndex = days.indexOf(item.day);
  
  
    let baseDate = weekStart ? new Date(weekStart) : new Date();
    if (baseDate < new Date().setHours(0,0,0,0)) {
      baseDate = new Date();
    }
  
    const currentDay = baseDate.getDay(); 
  
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  
    
    const monday = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + distanceToMonday, 12, 0, 0);
  

    const eventDate = new Date(monday);
    const offset = dayIndex !== -1 ? dayIndex : 0;
    eventDate.setDate(eventDate.getDate() + offset);
  
   
    const y = eventDate.getFullYear();
    const m = String(eventDate.getMonth() + 1).padStart(2, '0');
    const d = String(eventDate.getDate()).padStart(2, '0');
    const dateStr = `${y}${m}${d}`;
  
    const title = encodeURIComponent(`Vacsora: ${item.recipeId?.title || "Recept"}`);
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${dateStr}`;
  };
  
  // const generateShoppingList = () => {
  //   const ingredientsMap = {};
  //   const itemsToProcess = plan?.items?.filter(item => selectedItems.includes(item._id));
  
  //   itemsToProcess?.forEach((item) => {
  //     const recipeIngs = item.recipeId?.ingredients || [];
      
  //     recipeIngs.forEach((ing) => {
  //       if (!ing) return;
  
  //       let name, amount = 0, unit = "";
  
        
  //       if (typeof ing === 'string') {
  //         name = ing;
  //       } 
       
  //       else if (typeof ing === 'object') {
  //         name = ing.name;
  //         amount = parseFloat(ing.amount) || 0;
  //         unit = ing.unit || "";
  //       }
  
  //       if (!name) return;
  
  //       const key = name.toLowerCase().trim();
  
  //       if (ingredientsMap[key]) {
  //         // Csak akkor adunk hozzá, ha van értelmezhető mennyiség
  //         if (amount > 0) ingredientsMap[key].amount += amount;
  //       } else {
  //         ingredientsMap[key] = {
  //           name: name,
  //           amount: amount,
  //           unit: unit
  //         };
  //       }
  //     });
  //   });
  
  //   return Object.values(ingredientsMap);
  // };

  // const sendEmailList = () => {
  //   const list = generateShoppingList();
  //   if (list.length === 0) return;
  
  //   // Lista szöveges formátumba alakítása
  //   const listText = list
  //     .map(ing => `- ${ing.amount > 0 ? ing.amount : ""} ${ing.unit} ${ing.name}`)
  //     .join('%0D%0A'); // Ez a kód felel az újsorért az e-mailben
  
  //   const subject = encodeURIComponent("Heti bevásárlólista");
  //   const body = encodeURIComponent("Szia! Itt a heti bevásárlólista:\n\n") + listText;
  
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

  const handleCopyToMyPlan = async () => {
    try {
      // Elküldjük az admin tervét a usernek
      await axios.post(`${process.env.REACT_APP_API_URL}/mealplans/copy`, {
        adminPlanId: plan._id,
        userId: user._id
      });
      alert("Sikeresen átmásolva a saját konyhádba! Menj a 'Saját konyha' menüpontra a szerkesztéshez.");
    } catch (err) {
      console.log("Copy error:", err);
      alert("Hiba történt a másolás során.");
    }
  };


  const mealPlanDelete = async (planId) => {

    if (!window.confirm("Biztosan törölni szeretnéd ezt a heti menüt?")) return;
    try {

     await axios.delete (`${process.env.REACT_APP_API_URL}/mealplans/${planId}`)
      // setPlan(res.data);
      if (plan && plan._id === planId) {
        setPlan(null);
      }

      setPastPlans((prev) => prev.filter((p) => p._id !== planId));
      alert("Menü sikeresen törölve")
    } catch (err) {
      console.log("Remove failed:", err?.response?.data || err.message);
    }
  };


  return (

    <div>
    <Header title="Heti vacsoráink" title2="a realitás talaján" bgImage={bg} slogan="saját recepteid・bevásárlólista・naptár"/>
   
          
          {plan && (plan.noteTitle || plan?.noteText || plan?.notePhoto ) && (
           
           
          <div ref={currentNoteRef} className="mealplanContainer revealOnScroll">
          <div className="mealplanNote">
            {plan?.notePhoto && (
              <img
                className="mealplanNoteImg"
                src={process.env.REACT_APP_PUBLIC_FOLDER + plan.notePhoto}
                alt=""
              />
            )}

            <div className="mealplanNoteInfo">
              <h1 className="mealplanNoteTitle">
                {plan.noteTitle || (user?.role === "admin" ? "Írj ide egy üzenetet!" :"") }
              </h1>


              {plan?.noteText && <p className="mealplanNoteText">{plan.noteText}</p>}
            </div>
          </div>
          </div>
          
          )}

          {user?.role === "admin" && (   <button
        className="mealplanNewWeekBtn"
         onClick={async () => {
      try {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const res = await axios.post(`${process.env.REACT_APP_API_URL}/mealplans?userId=${user._id}`, {
          title: "Aktuális hét",
          weekStart,
          weekEnd,
          isActive: true,
          noteTitle: "",
          noteText: "",
          notePhoto: "",
          items: [],
        });
        console.log("NEW PLAN CREATED:", res.data);

        setPlan(res.data); 
        alert("Új hét létrehozva")
      } catch (err) {
        console.log("New week failed FULL:", err);
        console.log("New week failed response:", err?.response?.data);
         alert("Hiba: " + (err?.response?.data?.message || err.message));
      }
    }}
  >
    + Új hét létrehozása
  </button>
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
                    
                    {user?.role ==="admin" && (
                      <button
                      className="mealRemoveBtn"
                      onClick={() => handleRemoveItem(item._id)}
                    >
                      Kiveszem
                    </button>
                    )}
                  
                  </div>
                </div>
              );
            }

            return (
              <div  key={item._id} className="mealCard">

              <Link
               
                to={`/recipe/${item.recipeId._id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                
         
                  <img
                    src={item.recipeId.photo? PF + item.recipeId.photo :defaultImg}
                    alt=""
                  />
                  </Link>


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

                  {/* Felugró akciómenü mobilon, ha rákattintasz a 3 pöttyre */}
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
                        </div>
                       )}

                      {user?.role === "admin" && (
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


                  <div className="mealCardBody">
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

                    {/* {item.recipeId.prepTime && (
                      <p>{item.recipeId.prepTime} perc</p>
                    )} */}

                    {user?.role === "admin" && ( <button
                      className="mealRemoveBtn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveItem(item._id);
                      }}
                    >
                     Kiveszem
                    </button> 
                    )}
                  </div>
                </div>
             
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

               

                  {!user && (
    <>
     
      <button 
        className="copyToMyPlanBtn publicDisabledBtn" 
        onClick={() => alert("A funkció használatához be kell jelentkezni!")}
      >
        ✨ Ezt a heti menüt kérem a saját konyhámba!
      </button>

    
      <button 
        className="addCard publicDisabledBtn" 
        onClick={() => alert("A funkció használatához be kell jelentkezni!")}
      >
        <div className="addIcon">+</div>
        Recept hozzáadása
      </button>

     
      <button 
        className="addCard publicDisabledBtn" 
        onClick={() => alert("A funkció használatához be kell jelentkezni!")}
      >
        <div className="addIcon">+</div>
        Saját recept hozzáadása
      </button>
    </>
  )}
              {user && user.role !== "admin" && (
              
                <button className="copyToMyPlanBtn" onClick={handleCopyToMyPlan}>
                  ✨ Ezt a heti menüt kérem a saját konyhámba!
                </button>
             
            )}


                {user && user.role === "admin" && (
  
                  <button className="deleteMyPlanBtn" onClick={(e)=>{e.preventDefault();
    e.stopPropagation();mealPlanDelete(plan._id)}}>
                  🗑️ &nbsp;Heti menü törlése
                  </button>

                )}

                    
                    {user?.role === "admin" && (
                    
                    <button className="addCard" onClick={()=> setShowModal(true)}>
                      <div className="addIcon">+</div>
                      Recept hozzáadása
                    </button>
                  )}
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
        
          {user?.role ==="admin" && ( 
            <div className="adminPastActions" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
                  className="mealplanActivateBtn"
                  onClick={() => handleActivatePlan(p._id)}
                >
                  Aktiválom ezt a hetet
                </button>
                <button
      className="deleteMyPlanBtn"
      style={{ backgroundColor: "#ff4d4d", padding: "5px 10px", fontSize: "14px" }} // Opcionális gyors formázás
      onClick={() => mealPlanDelete(p._id)}
    >
      🗑️ Törlés
    </button>
  </div>
                
                 )}
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

          </div>
          </div>

        ))}
        </div>
        </div>
        {showTopBtn && (
    <button className="scrollTopBtn" onClick={scrollToTop}>
      ↑
    </button>
  )}
  


        {user &&  user.role === "admin" && ( <Link to="/mealplan/edit" className="mealplanEditLink">
          ✏️ Heti jegyzet szerkesztése
        </Link> )}
    

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

                const imgSrc = r.photo ? PF + r.photo : defaultImg;
                return (
                <div key={r._id} className="modalRecipeCard" onClick={() => handleAddRecipe(r._id)}>
                  <img src={imgSrc} alt="" />
                  <div className="modalRecipeInfo">
                    <h4>{r.title}</h4>
                  </div>
                </div>
        )})}
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

  );
}