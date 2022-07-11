// React
import {useState, useRef, useEffect} from 'react'

import { UserAuth } from '../../../context/AuthContext'

// Icons
import { TiArrowSortedUp } from 'react-icons/ti'

// Animation
import {gsap, Back} from 'gsap'

const DmRoomInvite = ({dmRoomInvitePopup, setDmRoomInvitePopup}) => {
   const [inviteFriendSearch, setInviteFriendSearch] = useState('')
   const [inviteFriends, setInviteFriends] = useState([])
   const [dmRoomInviteCounter, setDmRoomInviteCounter] = useState(0)
   const [requesterDmRoomData, setRequesterDmRoomData] = useState('')

   const {friends, sendRequest, dmRoomData} = UserAuth()

   useEffect(() => {
      setRequesterDmRoomData(JSON.parse(localStorage.getItem('currDmRoom')))
      const participants = JSON.parse(localStorage.getItem('currDmRoomData')).participantsInfo.length
      setDmRoomInviteCounter(10 - participants)
   }, [])

   // Animation
   const invitePopup = useRef()
   useEffect(() => {
      if (dmRoomInvitePopup)
         gsap.to (
            invitePopup.current, {
               duration: .8,
               x: 0,
               opacity: 1,
               pointerEvents: 'all',
               ease: Back.easeOut.config(2)
            }
         )
      else
         gsap.to (
            invitePopup.current, {
               duration: .2,
               x: -50,
               opacity: 0,
               pointerEvents: 'none'
            }
         ) 
   }, [dmRoomInvitePopup])

   const handleRoomInvite = async (e) => {
      e.preventDefault()
      const requestMsg = 'DmRoom Invite'
      const res = await sendRequest(inviteFriends, requestMsg, requesterDmRoomData)

      if (res.status) {
         setInviteFriends([])
         setDmRoomInvitePopup(!dmRoomInvitePopup)
      }
   }

   const handleAddRoomInvite = (e, friend) => {
      
      if (e.target?.checked && dmRoomInviteCounter > 0) {
         setDmRoomInviteCounter(dmRoomInviteCounter - 1)
         setInviteFriends(prev => [...prev, friend])
      }
      else if (!e.target?.checked && dmRoomInviteCounter < 10) {
         setDmRoomInviteCounter(dmRoomInviteCounter + 1)
         const newInviteFriends = inviteFriends
         const index = newInviteFriends.findIndex(elem => elem.friendUsername === friend.friendUsername)
         newInviteFriends.splice(index, 1)
         setInviteFriends(newInviteFriends)
      }
      setInviteFriendSearch('')
   } 

   return (
      <div className="roomInvite-wrapper" ref={invitePopup}>
         <div className="roomInvite-header">
            <h4 className="createDm-title">Select Friends</h4>
            <button className='closePopup-btn' onClick={() => setDmRoomInvitePopup(!dmRoomInvitePopup)}>
               <TiArrowSortedUp className='close-popup leftClose-popup'/>
            </button>
         </div>
         <form className="dmCreate-form" onSubmit={handleRoomInvite}>
            <input 
               type="text"
               className="dm-input"
               onChange={(e) => setInviteFriendSearch(e.target.value)}
               placeholder = 'username'
               value = {inviteFriendSearch}
            />

            { dmRoomInviteCounter < 10 &&
               <p className='dm-inviteLimit'>You have only {dmRoomInviteCounter} more invites</p>
            }

            <button 
            className='dmCreate-btn'
            disabled={inviteFriends.length === 0 ? true : false}
            >
               Invite to Room
            </button>
            
            <div className="dmFriendsAdded-wrapper">
            {inviteFriends?.map((friend) => {
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
                     if (inviteFriends === '') {
                        return search
                     }
                     else if (search.friendUsername.toLowerCase().includes(inviteFriendSearch.toLowerCase())) {
                        return search
                     }
                     return null

                     }).map((friend) => {
                        if (!dmRoomData?.participantsInfo.find(participant => participant.participantUsername === friend.friendUsername))
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
                                    inviteFriends.find(currFriend => currFriend.friendUsername === friend.friendUsername)
                                    ?
                                       <label className="container">
                                          <span className='tmp'></span>
                                          <input id='dmFriend' type="checkbox" className='select-friend' onClick={(e) => handleAddRoomInvite(e,friend)} defaultChecked/>
                                          <span className="checkmark"></span>
                                       </label>
                                    :
                                       <label className="container">
                                          <input id='dmFriend' type="checkbox" className='select-friend' onClick={(e) => handleAddRoomInvite(e,friend)}/>
                                          <span className="checkmark"></span>
                                       </label>
                                 }
                              </li>
                           )
                           else
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
                                 {dmRoomData?.participantsInfo.find(participant => participant.participantUsername === friend.friendUsername && participant.participation === 'pending')
                                 ?
                                    <span className='joined'>Pending</span>
                                 :
                                    <span className='joined'>Joined</span>
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

export default DmRoomInvite