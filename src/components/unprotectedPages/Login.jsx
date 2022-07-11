import { useState, useEffect, useRef } from 'react'
import { UserAuth } from '../../context/AuthContext';
import { Link, useNavigate, /*useLocation*/ } from 'react-router-dom';

// Animation
import {gsap, Back} from 'gsap'

const Login = () => {
   // useState
   const [user, setUser] = useState('')
   const [pwd, setPwd] = useState('')
   const [err, setErr] = useState('')

   const navigate = useNavigate()

   // useRef
   const loginContent = useRef()

   // UserAuth
   const {signIn} = UserAuth()

   // useEffect
   useEffect(() => {
      gsap.to(
         loginContent.current, {
            duration: .8,
            opacity: 1,
            y: 0,
            ease: Back.easeOut.config(2)
         }
      )
   }, [])

   useEffect(() => {
      setErr('')
   },[user, pwd])

   // HandleLogin
   const handleLogin = async (e) => {
      e.preventDefault()
      setErr('')

      try {
         await signIn(user, pwd)
         navigate('/')
      } catch(e) {
         setErr(e.message)
      }
   }

   return (
      <div className="login-container" ref={loginContent}>
         <div className="head">
            <h2 className='log-title'>Login</h2>
         </div>

         {err && <p className='err-msg'>{err}</p>}
         <form className='log-form' onSubmit={handleLogin} >
            <label className='log-label' htmlFor="user">Email:</label>
            <input 
               onChange={(e) => setUser(e.target.value.toLowerCase())}
               className='log-input'
               placeholder='example@email.com '
               value={user}
               type="email"
               required
            />

            <span className='pwd-group'>
               <label className='log-label' htmlFor="pwd">Password:</label>
            </span>
            <input 
               onChange={(e) => setPwd(e.target.value)}
               className='log-input'
               placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
               value={pwd}
               type="password"
               required
            />

            <button className='log-btn'>Login</button>
         </form>
         <div className="toReg">
            <p className='toLogin-p'>Not Registered:</p>
            <Link to='/register/part-one' className='toReg-link' >Sign Up</Link>
         </div>
      </div>
   )
}

export default Login