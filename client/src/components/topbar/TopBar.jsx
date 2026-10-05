import React, {useState} from 'react'
import "./topbar.css"
import { Link, useNavigate } from "react-router-dom"
import { useContext } from 'react';
import { Context } from '../../context/Context';
import { useLocation } from 'react-router-dom';

export default function TopBar() {

  const location= useLocation();
  const navigate= useNavigate();
  const isAboutPage = location.pathname.includes("rolam");

  const{user, dispatch} = useContext(Context);
   const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");



  const handleLogout = () => {
    dispatch ({ type: "LOGOUT"});
  };

  const handleSearch = (e) => {
    if ( e.key === "Enter") {
      if(searchQuery.trim()) {
        navigate(`/receptek?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery("");
        setIsSearchOpen(false);
      }
    }
  }

  return (
   <>
    <div className='top'>
      <div className="topLeft" >

       {isAboutPage && ( <div className="slogen"><Link className="link" to="/"> saját recepteid・bevásárlólista・naptár</Link></div>)}
     
      {/* <i className="topIcon fab fa-facebook-square"></i>
        <i className="topIcon fab fa-instagram-square"></i>
        <i className="topIcon fab fa-pinterest-square"></i>
        <i className="topIcon fab fa-twitter-square"></i> */}
         </div>
      <div className="topCenter ">
      <ul className="topList">
        <li className='topListItem'> <Link className="link" to="/">
        HETI MENÜ</Link></li>
        <li className='topListItem'><Link className="link" to="/receptek">
        RECEPTEK</Link></li>

{ user && (
  <>
        {/* <li className='topListItem'><Link className="link" to="/blogolj">
                BLOG
              </Link></li> */}
              <li className='topListItem'><Link className="link" to="/fozz">
                FŐZZ!
              </Link></li>
              <li className='topListItem'><Link className="link" to="/sajat-konyha">
                SAJÁT KONYHA
              </Link></li>
        
       
</>
      )}
      <li className='topListItem'><Link className="link" to="/rolam">
        MI EZ AZ OLDAL?</Link></li>

        { user && (
          <li className='topListItem' onClick={handleLogout}>  KIJELENTKEZÉS </li>
        )}


      {!user && null}
      </ul>
      </div>
      <div className="topRight ">
      {user ? (
          <Link className="link" to="/settings">
            <img
              className="topImage"
              src={ PF+user.profilePic}
              alt=""
            />
          </Link>
        ) : (
          <ul className="topList topLoginList">
            <li className="topListItem">
              <Link className="link" to="/login">
                BEJELENTKEZÉS
              </Link>
            </li>
            <li className="topListItem">
              <Link className="link" to="/register">
                REGISZTRÁCIÓ
              </Link>
            </li>
          </ul>
        )}

       <div className={`inlineSearchBox ${isSearchOpen ? "open" : ""}`}>
      <i 
        className="topSearchIcon fa-solid fa-magnifying-glass"
        onClick={() => setIsSearchOpen(!isSearchOpen)}
      ></i>
      <input
          type="text" 
          className="inlineSearchInput"
          placeholder= "keresés..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
      />
      </div>
 


      <div className={`hamburger ${menuOpen ? "active" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      </div>

    </div>
       {/* MOBIL MENÜ */}
       {menuOpen && (
        <div className="mobileMenu">

          <Link to="/" className="mobileLink" onClick={() => setMenuOpen(false)}>
            HETI MENÜ
          </Link>

          <Link to="/receptek" className="mobileLink" onClick={() => setMenuOpen(false)}>
            RECEPTEK
          </Link>

          <Link to="/rolam" className="mobileLink" onClick={() => setMenuOpen(false)}>
            MI EZ AZ OLDAL?
          </Link>

          {!user && (
          <Link to="/register" className="mobileLink" onClick={() => setMenuOpen(false)}>
            REGISZTRÁCIÓ
          </Link>
        )}
          {user && (
            <>
              <Link to="/sajat-konyha" className="mobileLink" onClick={() => setMenuOpen(false)}>
                SAJÁT KONYHA
              </Link>

              <Link to="/fozz" className="mobileLink" onClick={() => setMenuOpen(false)}>
                FŐZZ!
              </Link>

              <div className="mobileLink" onClick={handleLogout}>
                KIJELENTKEZÉS
              </div>
            </>
          )}

          {!user && (
            <Link to="/login" className="mobileLink" onClick={() => setMenuOpen(false)}>
              BEJELENTKEZÉS
            </Link>
          )}

        </div>
      )}

    </>
  )
}
