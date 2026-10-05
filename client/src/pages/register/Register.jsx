import "./register.css"
import { Link } from "react-router-dom"
import { useState } from "react"
import axios from "axios"

export default function Register() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
 
  const handleSubmit = async (e)=>{
    e.preventDefault();
    setError(false);

    try{
      const res = await axios.post( process.env.REACT_APP_API_URL + "/auth/register", {
        username, 
        email,
        password
      });
      res.data && window.location.replace("/login");
    }catch(err) {
      setError(true);
    }
  };

    return (
        <div className="register">
      <span className="registerTitle">Regisztráció</span>
      <form className="registerForm" onSubmit={handleSubmit}>
        <label>Felhasználó</label>
        <input className="registerInput" type="text" placeholder="felhasználó neve..." onChange ={e =>setUsername(e.target.value)}/>
        <label>Email</label>
        <input className="registerInput" type="text" placeholder="felhasználó email címe..." onChange ={e =>setEmail(e.target.value)}/>
        <label>Jelszó</label>
        <input className="registerInput" type="password" placeholder="jelszó.."onChange ={e =>setPassword(e.target.value)} />
        <button className="registerButton " type="submit">Regisztáció</button>
      </form>
        <button className="registerLoginButton"><Link to="/login" className='link'> Bejelentkezés</Link></button>

     { error && <span style={{color: "red", marginTop: "10px"}}>Valami hiba történt</span>} 
    </div>
    )
}