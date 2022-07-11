// React
import { useEffect, useRef } from 'react'

// Icons
import {IoMdHelpCircle} from 'react-icons/io'
import {BsChatTextFill, BsPlusLg} from 'react-icons/bs'
import {GoPrimitiveDot, GoMegaphone} from 'react-icons/go'
import {GiNightSleep, GiCancel} from 'react-icons/gi'
import {AiFillEyeInvisible} from 'react-icons/ai'
import {DiCompass} from 'react-icons/di'

// Images
import friends from '../../static/img/help/friends.svg'
import  groupChat from '../../static/img/help/group-chat.svg'
import videoCall from '../../static/img/help/video-call.svg'

// Animation
import {gsap, Back} from 'gsap'

const Help = () => {
   // Animation
   const help = useRef()
   const helpImg = useRef()
   const helpSteps1 = useRef()
   const helpSteps2 = useRef()
   const helpSteps3 = useRef()
   const helpSteps4 = useRef()
   const helpSteps5 = useRef()
   const helpSteps6 = useRef()
   useEffect(() => {
      gsap.to(
         help.current, {
            duration: .8,
            opacity: 1,
            x: 0,
            ease: Back.easeOut.config(2)
         }
      )
      gsap.to(
         helpImg.current, {
            duration: .8,
            opacity: 1,
            x: 0,
            ease: Back.easeOut.config(2)
         }
      )
      gsap.to(
         [helpSteps1.current, helpSteps2.current, helpSteps3.current,
            helpSteps4.current, helpSteps5.current, helpSteps6.current], {
            duration: .6,
            opacity: 1,
            stagger: .3,
            delay: 0.1,
            x: 0,
            ease: Back.easeOut.config(2)
         }
      )
   }, [])

   return (
      <div className='help-container' ref={help}>
         <div className="help-head">
            <IoMdHelpCircle className='help-icon'/>
            <h1 className='help-title'>Help</h1>
         </div>

         <div className="img-container" ref={helpImg}>
            <div className="help-group">
               <img className='help-img' src={friends} alt="make friends" />
               <p className='help-p'>Meet new people and stay in touch <br/> with them anywwhere.</p>
            </div>

            <div className="help-group">
               <img className='help-img' src={groupChat} alt="text with friends" />
               <p className='help-p'>Create your own rooms to talk <br/> to your friends, and customize <br/> their environment.</p>
            </div>

            <div className="help-group">
               <img className='help-img' src={videoCall} alt="talk with friends" />
               <p className='help-p'>Make video calls with your friends <br/> to have a more personal experience.</p>
            </div>
         </div>

         <div className="helpSteps-container">
            <ul className="help-steps">
               <li className="step" ref={helpSteps1}>Register or login to start creating rooms</li>
               <li className="step" ref={helpSteps2}>
                  User activity status:
                  <ul className="sublist">
                     <li className="status">
                        <GoPrimitiveDot className='status-icon active'/>
                        <div className="info">
                           <span>Online:</span> User is active and visible to all 
                        </div>
                        </li>
                     <li className="status">
                        <GiNightSleep className='status-icon idle'/>
                        <div className="info">
                           <span>Idle:</span> User is online, but not active
                        </div>
                        </li>
                     <li className="status">
                        <GiCancel className='status-icon busy'/>
                        <div className="info">
                           <span>Busy:</span> User is online, but unavailable<br/>and won't receive notifications
                        </div>
                        </li>
                     <li className="status">
                        <AiFillEyeInvisible className='status-icon invisible'/>
                        <div className="info">
                           <span>Invisible:</span> User is hidden to all, but online
                        </div>
                        </li>
                  </ul>
               </li>
               <li className="step create" ref={helpSteps3}>
                  Create rooms with 
                  <span><BsPlusLg className='create'/></span> 
               </li>
               <li className="step" ref={helpSteps4}>Each room is located in the sidebar</li>
               <li className="step" ref={helpSteps5}>
                  Each room has two types of mini rooms:
                  <ul className="sublist">
                     <li className='channel'>
                        <BsChatTextFill className='text'/>
                        <div className="info">
                           <span>Text:</span> Communication occurs via<br/>text message
                        </div>
                     </li>
                     <li className='channel'>
                        <GoMegaphone className='voice'/>
                        <div className="info">
                           <span>Voice:</span> Communication occurs via<br/>voice/video call
                        </div>
                     </li>
                  </ul>
               </li>
               <li className="step navigate" ref={helpSteps6}>
                  Navigate to public rooms with 
                  <span><DiCompass className='navigate'/></span>
               </li>
            </ul>
         </div>
      </div>
   )
}

export default Help