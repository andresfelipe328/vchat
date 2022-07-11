// React
import {useState, useRef, useEffect} from 'react'

import { UserAuth } from '../../../context/AuthContext'

// Icons
import {TiArrowSortedUp} from 'react-icons/ti'

// Animation
import {gsap, Back} from 'gsap'

const DmCreate = ({dmCreatePopup, setDmCreatePopup}) => {
   const [dmFriendSearch, setDmFriendSearch] = useState('')
   const [dmFriendCounter, setDmFriendCounter] = useState(9)
   const [dmFriends, setDmFriends] = useState([])
   const {friends, createDmRoom} = UserAuth()
   

   // Animation
   const dmPopup = useRef()
   useEffect(() => {
      if (dmCreatePopup)
         gsap.to (
            dmPopup.current, {
               duration: .8,
               y: 0,
               opacity: 1,
               pointerEvents: 'all',
               ease: Back.easeOut.config(2)
            }
         )
      else
         gsap.to (
            dmPopup.current, {
               duration: .2,
               y: -50,
               opacity: 0,
               pointerEvents: 'none'
            }
         ) 
   }, [dmCreatePopup])

   const handleAddDmFriend = (e, friend) => {
      if (e.target?.checked && dmFriendCounter > 0) {
         setDmFriendCounter(dmFriendCounter - 1)
         setDmFriends(prev => [...prev, friend])
      }
      else if (!e.target?.checked && dmFriendCounter < 9) {
         setDmFriendCounter(dmFriendCounter + 1)
         const newDmFriends = dmFriends
         const index = newDmFriends.findIndex(elem => elem.friendUsername === friend.friendUsername)
         newDmFriends.splice(index, 1)
         setDmFriends(newDmFriends)
      }
      else if (dmFriendCounter === 0) {
         setDmFriendCounter(0)
      }
      setDmFriendSearch('')
   }

   const handleCreateDmRoom = async (e) => {
      e.preventDefault()
      await createDmRoom(dmFriends)
      setDmFriends([])
      setDmFriendCounter(9)
      setDmCreatePopup(!dmCreatePopup)
   }

   return (
      <div className="dm-popup" ref={dmPopup}>
         <h4 className="createDm-title">Select Friends</h4>
         <button className='closePopup-btn' onClick={() => setDmCreatePopup(!dmCreatePopup)}>
            <TiArrowSortedUp className='close-popup'/>
         </button>
         <small className="subinfo">You can add {dmFriendCounter} more friends</small>
         <form className="dmCreate-form" onSubmit={handleCreateDmRoom}>
            <input 
               type="text"
               className="dm-input"
               onChange={(e) => setDmFriendSearch(e.target.value)}
               placeholder = 'username'
               value = {dmFriendSearch}
            />

            <button 
            className='dmCreate-btn'
            disabled={dmFriends.length === 0 ? true : false}
            >
               Create DM Room
            </button>
            
            <div className="dmFriendsAdded-wrapper">
            {dmFriends?.map((friend) => {
               return (
                  <div className="dmFriend" key={friend.friendUsername}>
                     <p>{friend.friendUsername}</p>
                  </div>
               )
            })}
            </div>

            <div className="selectFriend-wrapper">
               <ul className="dmFriend-list">

                  {friends?.filter((search) => {
                     if (dmFriendSearch === '') {
                        return search
                     }
                     else if (search.friendUsername.toLowerCase().includes(dmFriendSearch.toLowerCase())) {
                        return search
                     }
                     return null

                     }).map((friend) => {
                        return (
                           <li key={friend.friendUsername} className="friend">
                              <div className="friendIcon-wrapper">
                                 <div className="friendIcon-container">
                                    <img className='friend-icon' src={friend.friendIcon} alt="friend icon"/>
                                    {friend.status === 'active' && <span style={{backgroundColor: '#378139'}} className='status-icon'/>}
                                    {friend.status === 'idle' && <span style={{backgroundColor: '#FFAD27'}} className='status-icon'/>}
                                    {friend.status === 'busy' && <span style={{backgroundColor: '#b30f0f'}} className='status-icon'/>}
                                    {friend.status === 'invisible' && <span style={{backgroundColor: '#606A6D'}} className='status-icon'/>}
                                 </div>
                                 <p className='friend-username'>{friend.friendUsername}</p>
                              </div>
                              {
                                 dmFriends.find(currFriend => currFriend.friendUsername === friend.friendUsername && dmFriendCounter !== 9)
                                 ?
                                    <label className="container">
                                       <span className='tmp'></span>
                                       <input id='dmFriend' type="checkbox" className='select-friend' onClick={(e) => handleAddDmFriend(e,friend)} defaultChecked/>
                                       <span className="checkmark"></span>
                                    </label>
                                 :
                                    <label className="container">
                                       <input id='dmFriend' type="checkbox" className='select-friend' onClick={(e) => handleAddDmFriend(e,friend)}/>
                                       <span className="checkmark"></span>
                                    </label>
                              }
                           </li>
                        )
                     })
                  }
               </ul>
            </div>
         </form>
      </div>
   )
}

export default DmCreate