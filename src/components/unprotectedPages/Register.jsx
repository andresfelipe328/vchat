import {useState, useEffect, useRef} from 'react'
// import { UserAuth } from '../../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../../context/AuthContext';

// Icons
import {BsFillCheckCircleFill} from 'react-icons/bs'
import {FaTimesCircle} from 'react-icons/fa'

// Animation
import {gsap, Back} from 'gsap'

// Auth Validation Regex
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{6,24}$/

const RegPartOne = ({setNextStep}) => {
   // useState
   const [email, setEmail] = useState('')

   const [pwd, setPwd] = useState('')
   const [validPwd, setValidPwd] = useState(false)
   const [pwdFocus, setPwdFocus] = useState(false)

   const [matchPwd, setMatchPwd] = useState('')
   const [validMatch, setValidMatch] = useState(false)

   const [err, setErr] = useState('')

   // UserAuth
   const {createUser} = UserAuth()

   // Animation
   const registerContent = useRef()
   useEffect(() => {
      gsap.to(
         registerContent.current, {
            duration: .8,
            opacity: 1,
            y: 0,
            ease: Back.easeOut.config(2)
         }
      )
   }, [])

   // useEffect
   useEffect(() => {
      const result = PWD_REGEX.test(pwd)
      setValidPwd(result)
      const match = pwd === matchPwd
      setValidMatch(match)

   },[pwd, matchPwd])

   useEffect(() => {
      setErr('')
   },[email, pwd, matchPwd])

   // useNavigate
   const navigate = useNavigate()

   // HandleSignUp
   const handleSignUp = async (e) => {
      e.preventDefault()
      setErr('')

      try {
         await createUser(email, pwd)
         navigate('/register/part-two')
      } catch(e) {
         setErr(e.message)
      }
   }

   return (
      <div className='register-container' ref={registerContent}>
         <div className="head">
            <h2 className='reg-title'>Register</h2>
         </div>

         {err && <p className='err-msg'>{err}</p>}
         <form className='reg-form' onSubmit={handleSignUp} autoComplete='off'>
            <label className='reg-label' htmlFor="email">Email:</label>
            <input 
               onChange={(e) => setEmail(e.target.value.toLowerCase())}
               className='reg-input'
               value={email}
               type="email"
               required
            />

            <span className='pwd-group'>
               <label className='reg-label' htmlFor="pwd">Password:</label>
               {pwd ? (validPwd ? <BsFillCheckCircleFill className="fas fa-check-circle"/> : <FaTimesCircle className="fas fa-times-circle"/>) : null}
            </span>
            <input 
               onChange={(e) => setPwd(e.target.value)}
               aria-invalid = {validPwd ? "false" : "true"}
               onFocus={() => setPwdFocus(true)}
               onBlur={() => setPwdFocus(false)}
               aria-describedby = 'pdwdnote'
               className='reg-input'
               value={pwd}
               type="password"
               required
            />
            <p id='usernote' className={pwdFocus && !validPwd ? 'inst' : 'offscreen'}>
               6 to 24 characters. <br/>
               Must contain: upper/lowercase letters, numbers, and<br/>
               special characters.
            </p>

            <span className='pwd-group'>
               <label className='reg-label' htmlFor="confirmPwd">Confirm Password:</label>
               { pwd ? (validMatch && validPwd ? <BsFillCheckCircleFill className="fas fa-check-circle"/> : <FaTimesCircle className="fas fa-times-circle"/>) : null}
            </span>
            <input 
               onChange={(e) => setMatchPwd(e.target.value)}
               className='reg-input'
               type="password"
               required
            />

            <button 
               className='reg-btn'
               disabled={!email || !validPwd || !validMatch ? true : false}
            >
               Next Step
            </button>
         </form>
         <div className="toLogin">
            <p className='toLogin-p'>Already Registered:</p>
            <Link to='/login' className='toLogin-link' >Login</Link>
         </div>
      </div>
   )
}

export default RegPartOne