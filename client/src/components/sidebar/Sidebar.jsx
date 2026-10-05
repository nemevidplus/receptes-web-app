


import { Link } from "react-router-dom";
import "./sidebar.css"

import { useContext } from 'react';
import { Context } from '../../context/Context';


export default function Sidebar({ tags = [], selectedTag, onSelectTag, onClearTag }) {


  const{user} = useContext(Context);
     const PF = process.env.REACT_APP_PUBLIC_FOLDER;

 

  return (
    <div className="sidebar">
       {user && (<div className="sidebarItem">
    
      
     <span className="sidebarTitle">PROFIL</span>
     
     {user?.profilePic && ( 
               <Link className="link" to="/settings">
                  <img
                    className="topImage"
                    src={ PF+user.profilePic}
                    alt=""
                  />
                </Link>)}
    

      </div>)}

      <div className="sidebarItem">
  <span className="sidebarTitle">CÍMKEFELHŐ</span>
  {/* <ul className="sidebarList"> */}
  {selectedTag && (
          <button className="tagClearBtn" onClick={onClearTag}>
            Szűrés törlése: {selectedTag} ✕
          </button>
        )}

        <ul className="sidebarList">
          {tags.map((t) => (
            <li
              key={t}
              className={`sidebarListItem ${selectedTag === t ? "activeTag" : ""}`}
              onClick={() => onSelectTag(t)}
              role="button"
            
              
            >
              #{t}
            </li>
          ))}
        </ul>
      </div>

<div className="sidebarItem">
        <span className="sidebarTitle">KAPCSOLAT</span>

        <a className="sidebarMail"
        href="mailto:nemevidfoz@gmail.com?subject=Üzenet%20a%20weboldalról"
        >
          Írj nekem emailt!
        </a>

        {/* <div className="sidebarSocial">
          <i className="sidebarIcon fab fa-facebook-square"></i>
          <i className="sidebarIcon fab fa-instagram-square"></i>
          <i className="sidebarIcon fab fa-pinterest-square"></i>
          <i className="sidebarIcon fab fa-twitter-square"></i>
        </div> */}
        </div>
    </div>
  );
}
