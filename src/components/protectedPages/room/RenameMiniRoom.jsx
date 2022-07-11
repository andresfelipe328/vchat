// React
import { useState, useEffect, useRef } from 'react'

import { UserAuth } from '../../../context/AuthContext'

// Icon
import {TiArrowSortedUp} from 'react-icons/ti'

// Animation
import {gsap, Back} from 'gsap'

const RenameMiniRoom = ({renameMiniRoomPopup, setRenameMiniRoomPopup, prevMiniRoom, currRoom, currMainRoom}) => {
   const [newMiniRoomName, setNewMiniRoomName] = useState('')
   const {renameMiniRoom} = UserAuth()

   // Animation
   const renamePopup = useRef()
   useEffect(() => {
      if (renameMiniRoomPopup)
         gsap.to (
            renamePopup.current, {
               duration: .8,
               y: 0,
               opacity: 1,
               zIndex: 25,
               pointerEvents: 'all',
               ease: Back.easeOut.config(2)
            }
         )
      else {
         setNewMiniRoomName('')
         gsap.to (
            renamePopup.current, {
               duration: .2,
               y: -50,
               opacity: 0,
               zIndex: -1,
               pointerEvents: 'none'
            }
         ) 
      }
   }, [renameMiniRoomPopup])

   // Handle Main Room Rename
   const handleRenameMainRoom = async (e) => {
      e.preventDefault()
      await renameMiniRoom(prevMiniRoom.miniRoomID, newMiniRoomName, currRoom.roomID, currMainRoom)
      setRenameMiniRoomPopup(!renameMiniRoomPopup)
   }

   return (
      <div className="renameMainRoomPopup" ref={renamePopup}>
         <button className='closePopup-btn' onClick={() => setRenameMiniRoomPopup(!renameMiniRoomPopup)}>
            <TiArrowSortedUp className='close-popup'/>
         </button>
         <form className="renameMainRoom-form" onSubmit={handleRenameMainRoom}>
            <p className="renameMainRoom-title">Rename Mini Room</p>
            <input 
               type="text"
               className="renameMainRoom-input"
               value={newMiniRoomName}
               onChange={(e) => setNewMiniRoomName(e.target.value)}
               placeholder={prevMiniRoom.miniRoomName}
            />
            <button className="renameMainRoom-btn">Rename</button>
         </form>

      </div>
   )
}

export default RenameMiniRoom