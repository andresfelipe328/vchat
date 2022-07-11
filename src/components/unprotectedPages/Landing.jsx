// import { UserAuth } from '../context/AuthContext'
import Login from '../../static/img/icons/login.svg'
import { useRef, useEffect } from 'react'
import {Link, /*useNavigate*/} from 'react-router-dom'
// Icon
import {RiLoginCircleFill} from 'react-icons/ri'

// Animation
import {gsap, Back} from 'gsap'

const Landing = () => {
   const landingContainer = useRef()
   // const {userAuth} = UserAuth()
   // const navigate = useNavigate()

   // useEffect(() => {
   //    if (userAuth) {
   //       navigate('home')
   //    }
   // })

   useEffect(() => {
      gsap.to(
         landingContainer.current, {
            duration: .8,
            opacity: 1,
            y: 0,
            ease: Back.easeOut.config(2)
         }
      )
   })

   return (
      <div className="landing-container" ref={landingContainer}>
         <img className='login-img' src={Login} alt="login to use services" />
         <p className='landing-p'>To begin creating rooms with VChat, <br/>please login or create an account (<Link to='login'><RiLoginCircleFill className='login-icon'/></Link>).</p>
      </div>
   )
}

export default Landing