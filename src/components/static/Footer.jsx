// React
import { useEffect, useRef } from 'react'
import {Link} from 'react-router-dom'

// Icons
import {FiHelpCircle} from 'react-icons/fi'
import {RiSettings3Fill} from 'react-icons/ri'

// Animation
import {gsap, Back} from 'gsap'

const Footer = () => {
   // Animation
   const footer = useRef()
   useEffect(() => {
      gsap.to(
         footer.current, {
            duration: .8,
            opacity: 1,
            x: 0,
            ease: Back.easeOut.config(2)
         }
      )
   }, [])

   return (
      <footer className='footer' ref={footer}>
         <div className="footer-wrapper">
            
            <a href="settings" className="setting-link">
               <RiSettings3Fill className="setting-icon"/>
            </a>

            <Link to="help" className='help-link'>
               <FiHelpCircle className='help-icon'/>
            </Link>
            
         </div>
      </footer>
   )
}

export default Footer