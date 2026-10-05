import "./login.css"
import { Link } from "react-router-dom"
import { useRef, useContext } from "react";
import { Context } from "../../context/Context";
import axios from "axios";


export default function Login() {
 
  const userRef= useRef();
  const passwordRef= useRef();
  const { user, dispatch, isFetching, error} = useContext(Context)

  const handleSubmit = async (e) => {
   e.preventDefault();
   dispatch({type:"LOGIN_START"});
   try{
        const res = await axios.post( process.env.REACT_APP_API_URL + "/auth/login", {
          username: userRef.current.value,
          password: passwordRef.current.value,
        })
        dispatch({type:"LOGIN_SUCCESS", payload:res.data});
   }catch (e){
    dispatch({type:"LOGIN_FAILURE"});
   }
  };
  console.log(user);

  return (
    <div className="login">
       <span className="loginTitle">Bejelentkezés</span>
      <form className="loginForm" onSubmit={handleSubmit}>
        <label>Felhasználó</label>
        <input className="loginInput" type="text" placeholder="felhasználó név..." ref={userRef}/>
        <label>Jelszó</label>
        <input className="loginInput" type="password" placeholder="jelszó..." ref={passwordRef} />
        <button className="loginButton" type="submit" disabled={isFetching}>Bejelentkezés</button>
        {error && <span className="loginError"> Hibás felhasználói név vagy jelszó!</span>}
      </form>
        <button className="loginRegisterButton">
        <Link to="/register" className='link'> Regisztráció</Link>
        </button>
    </div>
  )
}
