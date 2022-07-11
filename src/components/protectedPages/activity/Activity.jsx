// React
import { useState, useRef, useEffect } from 'react'

import { UserAuth } from '../../../context/AuthContext'

// Icons
import {FaUserFriends, FaExclamationCircle} from 'react-icons/fa'
import {HiOutlineMenuAlt2} from 'react-icons/hi'
import {TiArrowSortedUp} from 'react-icons/ti'
import addFriend from '../../../static/img/icons/addfriend.svg'
import check from '../../../static/img/icons/check.gif'

// Animation
import {gsap, Back} from 'gsap'
import Friends from './Friends'
import FriendsRequests from './FriendsRequests'

const Activity = () => {
   const [friendSearch, setFriendSearch] = useState('')
   const [friendPopup, setFriendPopup] = useState(false)
   const [confirmSend, setConfirmSend] = useState(false)
   const [friendUN, setFriendUN] = useState('')
   const [activityPage, setActivityPage] = useState('')
   const [err, setErr] = useState('')

   const {sendRequest, friendRequests} = UserAuth()

   // Animation
   const addFriendPopup = useRef()
   const activity = useRef()
   useEffect(() => {
      if (friendPopup) {
         setConfirmSend(false)
         gsap.to (
            addFriendPopup.current, {
               duration: .8,
               y: 0,
               opacity: 1,
               pointerEvents: 'all',
               ease: Back.easeOut.config(2)
            }
         )
      }
      else
         gsap.to (
            addFriendPopup.current, {
               duration: .2,
               y: -50,
               opacity: 0,
               pointerEvents: 'none'
            }
         ) 
   }, [friendPopup])
   useEffect(() => {
      gsap.to (
         activity.current, {
            duration: .8,
            y: 0,
            opacity: 1,
            ease: Back.easeOut.config(2)
         }
      )
      if (localStorage.getItem('currActivityPage'))
         setActivityPage(localStorage.getItem('currActivityPage'))
      else {
         setActivityPage('online')
         localStorage.setItem('currActivityPage', 'online')
      }
   }, [])

   // HandleAddFriend
   const handleAddFriend = async (e) => {
      e.preventDefault()
      const requestMsg = 'Friend Request'
      const res = await sendRequest(friendUN, requestMsg)

      if (res.status) {
         setConfirmSend(!confirmSend)
         setTimeout(() => {
            setFriendPopup(!friendPopup)
            setFriendUN('')
         }, 1100)
      }
      else
         setErr(res.message)
   }

   // Handle Change Content
   const handleChangeContent = (page) => {
      setActivityPage(page)
      localStorage.setItem('currActivityPage', page)
   }

   return (
      <div className='activity-wrapper' ref={activity}>
         <div className="activity-head">
            <div className='activityHead-group'>
               <FaUserFriends className='friends-icon'/>
               <p className='friend-title'>Friends</p>
            </div>

            <ul className="friends-categories">
               <li className="status">
                  <button className={`status-btn ${activityPage === 'online' && 'curr'}`} onClick={() => handleChangeContent('online')}>
                     Online
                  </button>
               </li>
               <li className="status" >
                  <button className={`status-btn ${activityPage === 'all' && 'curr'}`} onClick={() => handleChangeContent('all')}>
                     All
                  </button>
               </li>
               <li className="status">
                  {friendRequests.received?.length > 0 && <FaExclamationCircle className='pending-icon'/>}
                  <button className={`status-btn ${activityPage === 'pending' && 'curr'}`} onClick={() => handleChangeContent('pending')}>
                     Pending
                  </button>
               </li>

               <li className="burger">
                  {friendRequests.received?.length > 0 && <FaExclamationCircle className='pending-icon'/>}
                  <HiOutlineMenuAlt2 className='burger-icon'/>
                  <ul className="drop-statusMenu">
                     <li className="drop-status">
                        <button className='status-btn' onClick={() => handleChangeContent('online')}>
                           <p>Online</p>
                           Online
                        </button>
                     </li>
                     <li className="drop-status">
                        <button className='status-btn' onClick={() => handleChangeContent('all')}>
                           <p>All</p>
                           All
                        </button>
                     </li>
                     <li className="drop-status">
                        <button className='status-btn' onClick={() => handleChangeContent('pending')}>
                           {friendRequests.received?.length > 0 && <FaExclamationCircle className='pending-icon'/>}
                           <p>Pending</p>
                           Pending
                        </button>
                     </li>
                  </ul>
               </li>

            </ul>

            <div className="add-friend">
               <button className="addFriend-btn" onClick={() => setFriendPopup(!friendPopup)}>
                  <img src={addFriend} alt="add friend" className='addFriend-icon'/>
               </button>
               <div className="addFriend-popup" ref={addFriendPopup}>
                  <h4 className='addFriend-title'>Add Friend</h4>
                  <button className='closePopup-btn' onClick={() => setFriendPopup(!friendPopup)}>
                     <TiArrowSortedUp className='close-popup'/>
                  </button>
                  <small className='subinfo'>Usernames are case sensitive.</small>
                  <form className="addFriend-form" onSubmit={handleAddFriend}>
                     <input 
                     type="text"
                     className="addFriend-input"
                     onClick={() => setErr('')}
                     onChange={(e) => setFriendUN(e.target.value)}
                     placeholder = 'username'
                     value = {friendUN}
                     required
                     />
                     { err && <p className='addFriend-err'>{err}</p>}
                     {
                        !confirmSend
                           ?
                              <button 
                              className='friend-btn'
                              type='submit'
                              >
                                 Send
                              </button>
                           :
                              <img style={{width:'1.75rem', height:'1.75rem'}} src={check} alt="sent" />
                     }
                  </form>
               </div>
            </div>
         </div>

         { activityPage !== 'pending'
            ?
               <Friends
                  friendSearch={friendSearch}
                  activityPage={activityPage}
                  setFriendSearch={setFriendSearch}
               />
            :
               <FriendsRequests
                  activityPage={activityPage}
               />
         }
      </div>
   )
}

export default Activity