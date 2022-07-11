// React
import {useRef, useEffect} from 'react'

// Icons
import { TiArrowSortedUp } from 'react-icons/ti'
import { FaTimes } from 'react-icons/fa'

// Animation
import {gsap, Back} from 'gsap'

import { UserAuth } from '../../../context/AuthContext';

const PinnedMsgs = ({currRoom, pinnedMsgs, setPinnedMsgs, pinnedMsgPopup, setPinnedMsgPopup}) => {
   
   const {userAuth, unpinMsg, currMiniRoomData, roomData} = UserAuth()

   // Animation
   const pinnedMsg = useRef()
   useEffect(() => {
      if (pinnedMsgPopup) {
         gsap.to (
            pinnedMsg.current, {
               duration: .8,
               x: 0,
               opacity: 1,
               pointerEvents: 'all',
               ease: Back.easeOut.config(2)
            }
         )
         for (let i = 0; i < currMiniRoomData?.messages?.length; ++i) {
            const msg = currMiniRoomData?.messages[i]
            if (msg.pinned)
               setPinnedMsgs(prev => [...prev, msg])
         }
      }
      else {
         gsap.to (
            pinnedMsg.current, {
               duration: .2,
               x: -50,
               opacity: 0,
               pointerEvents: 'none'
            }
         )
         setPinnedMsgs([])
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [pinnedMsgPopup])

   const handleUnpinMsg = async (msg) => {
      setPinnedMsgs(pinnedMsgs.filter(unpinMsg => unpinMsg.msgID !== msg.msgID));
      unpinMsg( msg, currRoom.roomID, 'room', currRoom.miniRoomID)
   } 

   return (
      <div className="pinnedMsg-wrapper" ref={pinnedMsg}>
         <div className="pinnedMsg-header">
            <h4 className="createDm-title">Pinned Messages</h4>
            <button className='closePopup-btn' onClick={() => setPinnedMsgPopup(!pinnedMsgPopup)}>
               <TiArrowSortedUp className='close-popup leftClose-popup'/>
            </button>
         </div>
         
         <ul className='pinnedMsg-list'>
            { pinnedMsgs.map((msg) => {
               return (
                  <li className='pinned-msg' key={msg.msgID}>
                     
                     <img className='user-icon' src={msg.authorIcon} alt="user icon" />
                     
                     <div className="msg-info">
                        <div className="msg-header">
                           <p className='username'>{msg.authorName}</p>
                           <p className='date'>{msg.timestamp}</p>
                        </div>
                        <p className='message'>{msg.message}</p>
                     </div>

                     {(userAuth.uid === msg.authorID || roomData?.creator.find(creatorID => creatorID === userAuth.uid)) 
                        &&
                           <button className="unpin" onClick={() => handleUnpinMsg(msg)}>
                              <FaTimes className='unpin-icon'/>
                           </button>
                     }
                  </li>
               )
            })

            }
         </ul>
      </div>
   )
}

export default PinnedMsgs