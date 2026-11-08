import React from 'react';
import "./header.css"
import spoonFork from "../../assets/spoon-and-fork.png";
import spoonForkSmall from "../../assets/spoon-and-fork.png";

const Header = ({title, title2, bgImage, bgVideo, youtubeId,  slogan}) => {
  return (
    <div>
          <div className="header" style={!youtubeId && bgImage ? {backgroundImage: `url(${bgImage})`} : {backgroundColor: '#000'} }>
            
          {youtubeId && (
            <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&autohide=1&modestbranding=1&disablekb=1&fs=0&playsinline=1&iv_load_policy=3&rel=0&background=1`}
                title="Háttérvideó"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                className="headerYouTubeVideo"
              ></iframe>
            )}

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
          <div className="headerTitles">
          <span className="headerTitle"> {title} </span>
          <span className="headerTitleSmall"> {title2} </span></div></div>
    </div>
  )
}

export default Header
