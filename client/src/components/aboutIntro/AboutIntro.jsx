import "./aboutIntro.css";
import { init } from "ityped";
import { useEffect, useRef } from "react";
import evi2 from "../../assets/evi-bw.png";
import heart from "../../assets/hearts.png";
import bg from "../../assets/bg2.png";
// import down from "../../assets/down.png";

export default function AboutIntro() {
    const textRef = useRef();
    const leftRef = useRef(null);
    const rightRef = useRef(null);
  
    useEffect(() => {init(textRef.current, 
      { showCursor: true, 
        backDelay:  1500,
        backSpeed:  50,
        strings: ['anyuka', 'kezdő programozó', 'haspók' , 'varázsló']  
      })
    },[]);
    
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("show");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
    
      if (leftRef.current) observer.observe(leftRef.current);
      if (rightRef.current) observer.observe(rightRef.current);
    
      return () => observer.disconnect();
    }, []);


  return (
    <div className="aboutIntro">
      <div ref={leftRef} className="aboutIntroLeft revealLeft">
        <div className="aboutImgContainer"></div>
        {/* <img className="background" src={bg} alt="dekoráció" /> */}
        <img className="aboutImg" src={evi2} alt="Portré" />
      </div>

      <div ref={rightRef} className="aboutIntroRight revealRight">
        <div className="aboutIntroWrapper">
          <h2>Szia!</h2>
          <h1>nemevid vagyok</h1>
          <h3>
           gyesen lévő <span ref={textRef}></span>
          </h3>
          <p className="aboutNote">  
          Mi ez az oldal?
          <br />
          <ol> <li> Az oldalon receptek és heti vacsiterv látható inspiráció gyanánt. Néha elég, ha van egy ötlet. 🍎</li>
  <li> A regisztrált felhasználók kedvükre módosíthatják ezt a tervet a saját receptjeikkel is. Ha nem ehettek valami összetevőt, más volt olcsóbb a piacon: könnyen kicserélheted. </li>
   <li> A kiválasztott receptekből bevásárlólista 🛒  és google naptár 🗓️ bejegyzés generálható. Mindent a tempós működésért.</li>
  </ol>
  <br />   
 
          
          Bár nem vagyok gasztrós,  a "mi legyen a vacsora" témaköre 3 gyerek anyukájaként erősen foglalkoztat. 
      
  <br />

  Másik érdeklődési köröm a React programozás, ami autodidakta módon tanulok.
  Az itt látható app a portfólió építésem része.
  <br />
  <br />
 
  Ha kérdésed van az oldallal kapcsolatban: 
  <br />

        <a className="aboutMail"
        href="mailto:nemevidfoz@gmail.com?subject=Üzenet%20a%20weboldalról"
        >
          Írj nekem emailt!
        </a>
        
 
  <span className="aboutEnding">
  <img className="aboutIcon"
      src={heart}
      alt="szív"
       />
       </span>
   <br />
   <br />
 
  </p>
 
        </div>

        {/* <a href="#about-bottom" className="aboutArrowLink">
          <img src={down} alt="Lefelé" />
        </a> */}
      </div>

      <div id="about-bottom"></div>
    </div>
  );
}