import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Context } from "../../context/Context";
import "./mealplanEdit.css";

export default function MealPlanEdit() {
  const { user } = useContext(Context);

  const [plan, setPlan] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const query = user?.role === "admin" ? "?type=admin" : `?userId=${user?._id}`;
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/mealplans/current${query}`);
        setPlan(res.data);
        setNoteTitle(res.data?.noteTitle || "");
        setNoteText(res.data?.noteText || "");
      } catch (err) {
        console.log("Load failed:", err);
      }
    };
   if (user) load();
  }, [user]);

  const handleSave = async () => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/mealplans/current/note?userId=${user._id}`, {
        noteTitle,
        noteText,
        noteAuthor: user?.username || "ismeretlen",
        noteDate: new Date().toISOString(),
      });
      setPlan(res.data);
      alert("Mentve ✅");
    } catch (err) {
      console.log("Save failed:", err?.response?.data || err.message);
    }
  };

  if (!plan) return null;

  return (
    <div className="mealplanEdit">
      <h2>Heti menü jegyzet</h2>

      <input
        className="mealplanEditInput"
        placeholder="Cím"
        value={noteTitle}
        onChange={(e) => setNoteTitle(e.target.value)}
      />

      <textarea
        className="mealplanEditTextarea"
        placeholder="Heti megjegyzések..."
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
      />

  
      {(plan.noteAuthor || plan.noteDate) && (
        <div className="mealplanEditMeta">
          {plan.noteAuthor && <span>✍️ {plan.noteAuthor}</span>}
          {plan.noteDate && (
            <span>
              🕒 {new Date(plan.noteDate).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      <button className="mealplanEditBtn" onClick={handleSave}>
        Mentés
      </button>
    </div>
  );
}
