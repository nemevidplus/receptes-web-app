import React from 'react';
import "./header.css"
import spoonFork from "../../assets/spoon-and-fork.png";
import spoonForkSmall from "../../assets/spoon-and-fork.png";

const Header = ({title, title2, bgImage, bgVideo, slogan}) => {
  return (
    <div>
          <div className="header" style={bgImage ? {backgroundImage: `url(${bgImage})`} : {} }>
            

            {bgVideo && (
              <video className="headerBgVideo" autoPlay loop muted playsInline >
                <source src={bgVideo} type="video/mp4" />
             </video>
            )}

             <div className="headerOverlay">
             {slogan && <div className="mealplanSlogen">{slogan}</div>}
              
               <img className="headerIcon"
                                    src={spoonFork}
                                    alt=""/>
              
              </div>
          </div>
      
          <div className="headerTitleDiv"> 
          <img className="headerIconSmall"
                                    src={spoonForkSmall}
                                    alt=""/>
          <span className="headerTitle"> {title} </span>
          <span className="headerTitleSmall"> {title2} </span></div>
    </div>
  )
}

export default Header
