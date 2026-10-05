import Sidebar from "../../components/sidebar/Sidebar"
import "./settings.css"
import { useContext, useState } from 'react';
import { Context } from '../../context/Context';
import axios from "axios";

export default function Settings() {

   
  const { user, dispatch } = useContext(Context);
    const [file, setFile] = useState(null);
    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState(false);
 
    const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      dispatch({ type: "UPDATE_START" });
      const updatedUser = {
        userId: user._id,
        username,
        email,
        
      };
      if (password && password.trim().length > 0) {
        updatedUser.password = password;
      }
      if (file) {
        const data = new FormData();
        const filename = Date.now() + file.name;
        data.append("name", filename);
        data.append("file", file);
        updatedUser.profilePic = filename;
        try {
          await axios.post("/upload", data);
        } catch (err) {}
      }
      try {
        const res = await axios.put("/users/" + user._id, updatedUser);
        setSuccess(true);
        dispatch({ type: "UPDATE_SUCCESS", payload: res.data });
      } catch (err) {
        console.log("Update user failed:", err.response?.data || err.message);
        dispatch({ type: "UPDATE_FAILURE" });
      }
    }

  return (
    <div className="settings">
      <div className="settingsWrapper">
          <div className="settingsTitle">
            <span className="settingsUpdateTitle">Frissítsd a profilod!</span>
            <span className="settingsDeleteTitle">Fiók törlése</span>
          </div>
          <form className="settingsForm" onSubmit={handleSubmit}>
          <label>Fotó</label>
          <div className="settingsPP">
            <img
              src={file ? URL.createObjectURL(file) : PF+user.profilePic}
              alt=""
            />
            <label htmlFor="fileInput">
              <i className="settingsPPIcon far fa-user-circle"></i>{" "}
            </label>
            <input
              id="fileInput"
              type="file"
              style={{ display: "none" }}
              className="settingsPPInput"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <label>Felhasználó</label>
          <input type="text" placeholder={user.username}  onChange={e =>setUsername(e.target.value)}/>
          <label>Email</label>
          <input type="email" placeholder={user.email}  onChange={e =>setEmail(e.target.value)}/>
          <label>Jelszó</label>
          <input type="password" placeholder="jelszó" onChange={e =>setPassword(e.target.value)} />
          <button className="settingsSubmitButton" type="submit">
          Frissítés
          </button>
          {success && <span style={{color: "green", textAlign: "center", marginTop: "20px"}}> a frissítés kész</span>}
        </form>
      
      </div>
      <Sidebar />
    </div>
  )
}
