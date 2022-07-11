// React
import {useState, useEffect, useRef} from 'react'

import { UserAuth } from '../../../context/AuthContext'

// Icons
import { TiArrowSortedUp } from 'react-icons/ti'

// Animation
import {gsap, Back} from 'gsap'



const CreateMainRoom = ({createMainRoomPopup, setCreateMainRoomPopup, currRoom}) => {
   const [newMainRoom, setNewMainRoom] = useState('')
   const {createMainRoom} = UserAuth()

   // Animation
   const createPopup = useRef()
   useEffect(() => {
      if (createMainRoomPopup)
         gsap.to (
            createPopup.current, {
               duration: .8,
               y: 0,
               opacity: 1,
               zIndex: 25,
               pointerEvents: 'all',
               ease: Back.easeOut.config(2)
            }
         )
      else {
         setNewMainRoom('')
         gsap.to (
            createPopup.current, {
               duration: .2,
               y: -50,
               opacity: 0,
               zIndex: -1,
               pointerEvents: 'none'
            }
         ) 
      }
   }, [createMainRoomPopup])

   // Handle Main Room Rename
   const handleCreateMainRoom = async (e) => {
      e.preventDefault()
      await createMainRoom(newMainRoom, currRoom.roomID)
      setCreateMainRoomPopup(!createMainRoomPopup)
   }

   return (
      <div className="createMainRoomPopup" ref={createPopup}>
         <button className='closePopup-btn' onClick={() => setCreateMainRoomPopup(!createMainRoomPopup)}>
            <TiArrowSortedUp className='close-popup'/>
         </button>
         <form className="createMainRoom-form" onSubmit={handleCreateMainRoom}>
            <p className="createMainRoom-title">Create Main Room</p>
            <input 
               type="text"
               className="createMainRoom-input"
               value={newMainRoom}
               onChange={(e) => setNewMainRoom(e.target.value)}
               placeholder='Main Room Name'
            />
            <button className="createMainRoom-btn">Create</button>
         </form>

      </div>
   )
}

export default CreateMainRoom