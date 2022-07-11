// React
import {useState, useRef, useEffect} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { UserAuth } from '../../../context/AuthContext'

// Components
import DmCreate from './DmCreate'

// Icons
import {BsPlusCircleFill} from 'react-icons/bs'
import {FaTimes} from 'react-icons/fa'
import {BiSearchAlt2} from 'react-icons/bi'

// Animation
import {gsap, Back} from 'gsap'

const DmMgmt = ({currDmRoom, setCurrDmRoom}) => {
   const [dmSearch, setDmSearch] = useState('')
   const [selected, setSelected] = useState('')
   const [dmCreatePopup, setDmCreatePopup] = useState(false)

   const {userAuth, userDmRooms, getDmRoomData, deleteDmRoom} = UserAuth()

   // Animation
   const dmMgmt = useRef()
   useEffect(() => {
      gsap.to (
         dmMgmt.current, {
            duration: .8,
            y: 0,
            opacity: 1,
            ease: Back.easeOut.config(2)
         }
      )
   }, [])

   const navigate = useNavigate()
   // Handle Current Room
   const handleCurrDmRoom = async (dmRoom) => {
      setCurrDmRoom(dmRoom)
      setSelected(dmRoom.dmRoomName)

      localStorage.setItem('currDmRoom', JSON.stringify(dmRoom))
      localStorage.removeItem('currDmRoomData')
      await getDmRoomData(dmRoom.dmRoomID)

      // if(!localStorage.getItem('currRoomData'))
      //    await getRoomData(room.roomID)

      navigate(`/dmroom/${dmRoom.dmRoomID}`)
   }

   // Handle Delete DM Room
   const handleDeleteDmRoom = async (dmRoomID) => {
      await deleteDmRoom(dmRoomID)
      localStorage.removeItem('currDmRoom')
      navigate('/')
   }

   useEffect(() => {
      if (localStorage.getItem('currDmRoom')) {
         const currDmRoom = JSON.parse(localStorage.getItem('currDmRoom'))
         setCurrDmRoom(currDmRoom)
         navigate(`/dmroom/${currDmRoom.dmRoomID}`)
      }
      else {
         navigate('/')
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   const location = useLocation().pathname
   useEffect(() => {
      if (!location.includes('dmroom')) {
         setSelected('')
      }
      else
         setSelected(currDmRoom.dmRoomName)
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [location])
   
   return (
      <div className='dmMgmt-wrapper' ref={dmMgmt}>
         <div className="form-wrapper">
            <form className="search">
               <input 
                  type="text"
                  className='search-input'
                  value={dmSearch}
                  placeholder='Find a conversation'
                  onChange={(e) => setDmSearch(e.target.value)}
               />
            </form>
            <BiSearchAlt2 className='search-icon'/>
         </div>
         
         <div className="dm-head">
            <h4 className='dm-title'>DIRECT MESSAGES</h4>
            <button className='dm-btn' onClick={() => setDmCreatePopup(!dmCreatePopup)}>
               <BsPlusCircleFill className='dmCreate-icon'/>
            </button>

            <DmCreate
               dmCreatePopup={dmCreatePopup}
               setDmCreatePopup={setDmCreatePopup}
            />
         </div>

         <div className="dm-wrapper">      
            <ul className='dm-list'>
               {userDmRooms?.filter((search) => {
                  if (dmSearch === '') {
                     return search
                  }
                  else if (search.dmRoomName.toLowerCase().includes(dmSearch.toLowerCase())) {
                     return search
                  }
                  return null

                  }).map((dmRoom) => {
                     return (
                        <li key={dmRoom.dmRoomID} className={`dm ${dmRoom.dmRoomName === selected && 'curr'}`}>
                           <button className="dm-group" onClick={() => handleCurrDmRoom(dmRoom)}>
                              <div className="dmIcon-wrapper">
                                 <div src="" alt="" className="dm-icon" style={{backgroundColor: dmRoom.dmRoomIcon}}/>
                              </div>
                              <div className="dm-info">
                                 <h5 className='dm-name'>
                                    {
                                       dmRoom.dmRoomName.split(" ").length - 1 === 1
                                       ?
                                          dmRoom.dmRoomName.replace(userAuth.displayName, '')
                                       :
                                          dmRoom.dmRoomName.replace(` ${userAuth.displayName}`, '').replaceAll(' ', ', ').includes(userAuth.displayName)
                                          ?
                                             dmRoom.dmRoomName.replace(`${userAuth.displayName} `, '').replaceAll(' ', ', ')
                                          :
                                             dmRoom.dmRoomName.replace(` ${userAuth.displayName}`, '').replaceAll(' ', ', ')
                                    }
                                 </h5>
                                 <small className='dm-subinfo'>some info</small>
                              </div>
                           </button>
                           
                           <button className='delete-dm' onClick={() => handleDeleteDmRoom(dmRoom.dmRoomID)}>
                              <FaTimes className='dmDelete-icon'/>
                           </button>
                        </li>
                     )
                  })
               }
            </ul>
         </div>
      </div>
   )
}

export default DmMgmt