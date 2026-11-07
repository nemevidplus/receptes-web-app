import React from 'react';
import "./header.css"
import spoonFork from "../../assets/spoon-and-fork.png";
import spoonForkSmall from "../../assets/spoon-and-fork.png";

const Header = ({title, title2, bgImage, bgVideo, youtubeId,  slogan}) => {
  return (
    <div>
          <div className="header" style={!youtubeId && bgImage ? {backgroundImage: `url(${bgImage})`} : {backgroudColor: '#000'} }>
            
          {youtubeId && (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&autohide=1&modestbranding=1&disablekb=1&fs=0&playsinline=1&rel=0`}
                title="Háttérvideó"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '100vw',
                  height: '56.25vw',
                  minHeight: '100vh',
                  minWidth: '177.77vh',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  zIndex: 0,
                  objectFit: 'cover',
                }}
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
