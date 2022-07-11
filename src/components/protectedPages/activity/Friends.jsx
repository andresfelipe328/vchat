// React
import { useEffect, useRef } from 'react'

import { UserAuth } from '../../../context/AuthContext'

// Icons
import { BiSearchAlt2 } from 'react-icons/bi'
import { BsFillChatLeftTextFill, BsThreeDots } from 'react-icons/bs'
import { FaTrash } from 'react-icons/fa'
import { GoMegaphone} from 'react-icons/go'

// Animation
import { gsap, Back } from 'gsap'

const Friends = ({friendSearch, activityPage, setFriendSearch}) => {
   const {friends, createDmRoom, deleteFriend} = UserAuth()

   const friendList = useRef()
   useEffect(() => {
      
         gsap.to (
            friendList.current, {
               duration: .8,
               y: 0,
               opacity: 1,
               ease: Back.easeOut.config(2)
            }
         )
      
   }, [activityPage])

   const hanleCreateDmRoom = async (friend) => {
      await createDmRoom([friend])
   }

   const handleDeleteFriend = async (friend) => {
      await deleteFriend(friend)
   }

   return (
      <div className="activity-contents" ref={friendList}>
            <div className="search-wrapper">
               <form className="search">
                  <input 
                     type="text"
                     className='search-input'
                     value={friendSearch}
                     placeholder='Find a friend'
                     onChange={(e) => setFriendSearch(e.target.value)}
                  />
               </form>
               <BiSearchAlt2 className='search-icon'/>
            </div>

            <span className='divider'>{activityPage}</span>

            <div className="friendList-wrapper">
               <ul className="friend-list">
                  {activityPage === 'online' 
                     ?
                        friends?.filter((search) => {
                           if (friendSearch === '') {
                              return search
                           }
                           else if (search.friendUsername.toLowerCase().includes(friendSearch.toLowerCase())) {
                              return search
                           }
                           return null

                        }).map((friend) => {
                           if (friend.status === 'active')
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
                                 <div className="friend-btns">
                                    <button onClick={() => hanleCreateDmRoom(friend)} className="message">
                                       <BsFillChatLeftTextFill className='msg-icon'/>
                                    </button>
   
                                    <div className='more-wrapper'>
                                       <button className="more">
                                          <BsThreeDots className='more-icon'/>
                                       </button>
   
                                       <ul className="more-menu">
                                          <li className="menu-item">
                                             <button className="item-btn">
                                                <GoMegaphone className="item-icon"/>
                                                <p>start voice call</p>
                                             </button>
                                          </li>
                                          <li className="menu-item delete">
                                             <button className="item-btn" onClick={() => handleDeleteFriend(friend)}>
                                                <FaTrash className='delete-icon'/>
                                                <p>goodbye friend</p>
                                             </button>
                                          </li>
                                       </ul>
                                    </div>
                                    
                                 </div>
                                 </li>
                              )
                           else
                              return null
                        })
                     :
                        friends?.filter((search) => {
                           if (friendSearch === '') {
                              return search
                           }
                           else if (search.friendUsername.toLowerCase().includes(friendSearch.toLowerCase())) {
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
                                 <div className="friend-btns">
                                    <button onClick={() => hanleCreateDmRoom(friend)} className="message">
                                       <BsFillChatLeftTextFill className='msg-icon'/>
                                    </button>
   
                                    <div className='more-wrapper'>
                                       <button className="more">
                                          <BsThreeDots className='more-icon'/>
                                       </button>
   
                                       <ul className="more-menu">
                                          <li className="menu-item">
                                             <button className="item-btn">
                                                <GoMegaphone className="item-icon"/>
                                                <p>start voice call</p>
                                             </button>
                                          </li>
                                          <li className="menu-item delete">
                                             <button className="item-btn">
                                                <FaTrash className='delete-icon'/>
                                                <p>goodbye friend</p>
                                             </button>
                                          </li>
                                       </ul>
                                    </div>
                                    
                                 </div>
                              </li>
                           )
                        })
                  }
               </ul>
            </div>
      </div>
   )
}

export default Friends