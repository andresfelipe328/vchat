// React
import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserAuth } from '../../../context/AuthContext'

// Icons
import {HiOutlineMenuAlt2, HiPlus} from 'react-icons/hi'
import {BsCaretDownFill, BsChatTextFill} from 'react-icons/bs'
import {RiSettings3Fill} from 'react-icons/ri'
import {GoMegaphone} from 'react-icons/go'
import {FaUserPlus, FaTrash} from 'react-icons/fa'
import {AiFillEdit} from 'react-icons/ai'
import folder from '../../../static/img/icons/add-folder.svg'
// import subfolder from '../../../static/img/icons/subfolder.svg'

// Components
import RenameMainRoom from './RenameMainRoom'
import RenameMiniRoom from './RenameMiniRoom'

// Animation
import {gsap, Back} from 'gsap'
import CreateMainRoom from './CreateMainRoom'

const RoomMgmt = ({currRoom, setCurrRoom, roomInvitePopup, setRoomInvitePopup}) => {
   const [miniRoomSelected, setMiniRoomSelected] = useState('')
   const [newMiniRoom, setNewMiniRoom] = useState('')
   const [miniRoomType, setMiniRoomType] = useState('')

   const [createMainRoomPopup, setCreateMainRoomPopup] = useState(false)
   const [renameMainRoomPopup, setRenameMainRoomPopup] = useState(false)
   const [prevMainRoomName, setPrevMainRoomName] = useState('')

   const [renameMiniRoomPopup, setRenameMiniRoomPopup] = useState('')
   const [currMainRoom, setCurrMainRoom] = useState('')
   const [prevMiniRoom, setPrevMiniRoom] = useState({})

   const {userAuth, userServers, deleteRoom, roomData, createMiniRoom, getMiniRoomData, deleteMainRoom, deleteMiniRoom, updateCurrMiniRoom} = UserAuth()

   const nav = useNavigate()

   useEffect(() => {
      let currMiniRoom = {}
      let newMiniRoom = {}

      for (let i = 0; i < roomData.mainRooms?.length; ++i) {
         currMiniRoom = roomData.mainRooms[i].miniRooms.find(miniRoom => miniRoom.miniRoomID === currRoom.miniRoomID)
         if (currMiniRoom)
            break
      }

      if (!currMiniRoom) {

         for (let i = 0; i < roomData.mainRooms?.length; ++i) {
            newMiniRoom = roomData.mainRooms[i].miniRooms.find(miniRoom => miniRoom.miniRoomType === 'text')
            if (newMiniRoom)
               break
         }

         handleUrl(newMiniRoom.miniRoomID)
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [roomData])

   useEffect(() => {
      const roomID = JSON.parse(localStorage.getItem('currRoom')).roomID
      const rooms = JSON.parse(localStorage.getItem('userRooms'))
      const roomExists = rooms.find(room => room.roomID === roomID)

      if (!roomExists) {
         localStorage.removeItem('currRoom')
         localStorage.removeItem('currRoomData')
         localStorage.removeItem('currMiniRoomData')
         localStorage.removeItem('miniRoomSelected')
         setCurrRoom('')
         nav('/')
      }
      
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [userServers])

   // Animation
   const roomMgmt = useRef()
   useEffect(() => {
      gsap.to (
         roomMgmt.current, {
            duration: .8,
            y: 0,
            opacity: 1,
            ease: Back.easeOut.config(2)
         }
      )
      setMiniRoomSelected(currRoom.miniRoomID)

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   // Handle Deletion of Room
   const handleDeleteRoom = async () => {
      await deleteRoom(currRoom)
   }

   // Handle Creation of Mini Room
   const handleCreateMiniRoom = async (e, mainRoomName) => {
      e.preventDefault()
      await createMiniRoom(newMiniRoom, miniRoomType, currRoom.roomID, mainRoomName)
      setNewMiniRoom('')
      setMiniRoomType('')
   }

   // Handle Change of mini room
   const handleUrl = async (miniRoomID) => {
      const newCurrRoom = {
         roomName: currRoom.roomName,
         roomIcon: currRoom.roomIcon,
         roomIconID: currRoom.roomIconID,
         roomID: currRoom.roomID,
         miniRoomID: miniRoomID,
      }
      setCurrRoom(newCurrRoom)
      localStorage.setItem('currRoom', JSON.stringify(newCurrRoom))

      localStorage.setItem('miniRoomSelected', JSON.stringify(miniRoomID))
      setMiniRoomSelected(miniRoomID)

      await getMiniRoomData(currRoom.roomID, miniRoomID)
      nav(`/room/${currRoom.roomID}/${miniRoomID}`)
   }

   // Handle rename of main room
   const handleRenameMainRoom = (prevMainRoomName) => {
      setRenameMainRoomPopup(!renameMainRoomPopup)
      setPrevMainRoomName(prevMainRoomName)
   }

   // Handle delete of main room
   const handleDeleteMainRoom = async (mainRoom) => {
      await deleteMainRoom(currRoom.roomID, mainRoom.mainRoomName)
   }

   // Handle rename of mini room 
   const handleRenameMiniRoom = async (currMainRoom, miniRoom) => {
      setRenameMiniRoomPopup(!renameMiniRoomPopup)
      setCurrMainRoom(currMainRoom.mainRoomName)
      setPrevMiniRoom(miniRoom)
   }

   // Handle delete of mini room
   const handleDeleteMiniRoom = async (currMainRoom, miniRoom) => {
      if (miniRoom.miniRoomID === roomData.currMiniRoomUrl) {
         let newMiniRoom = {}

         for (let i = 0; i < roomData.mainRooms?.length; ++i) {
            newMiniRoom = roomData.mainRooms[i].miniRooms.find(prevMiniRoom => prevMiniRoom.miniRoomType === 'text' && prevMiniRoom.miniRoomID !== miniRoom.miniRoomID)
            if (newMiniRoom)
               break
         }
         await updateCurrMiniRoom(currRoom.roomID, newMiniRoom.miniRoomID)
      }

      await deleteMiniRoom(currRoom.roomID, currMainRoom.mainRoomName, miniRoom.miniRoomID)
   }

   return (
      <div className="roomMgmt-wrapper" ref={roomMgmt}>
         <div className="roomMgmt-head">
            <h4 className='room-name'>{roomData.roomName}</h4>

            <li className="roomMgmt-menu">
               <button className='burger-btn'>
                  <HiOutlineMenuAlt2 className='burger-icon'/>
               </button>
               <ul className="menu-options">
                  <li className="option">
                     <button className="opt-btn" onClick={() => setRoomInvitePopup(!roomInvitePopup)}>
                        <FaUserPlus className="opt-icon"/>
                        <p>Invite People</p>
                     </button>
                  </li>
                  { roomData?.creator.find(creatorID => creatorID === userAuth.uid) &&
                     <>
                        <li className="option">
                        <button className="opt-btn">
                           <RiSettings3Fill className="opt-icon"/>
                           <p>Room Settings</p>
                        </button>
                        </li>
                        <li className="option">
                           <button className="opt-btn" onClick={() => setCreateMainRoomPopup(!createMainRoomPopup)}>
                              <img src={folder} alt="subfolder" className="opt-img" />
                              <p>Create Main Room</p>
                           </button>
                        </li>
                        <li className="option">
                           <button className="opt-btn delete-btn" onClick={handleDeleteRoom}>
                              <FaTrash className='opt-icon delete-icon' />
                              <p>Delete Room</p>
                           </button>
                        </li>
                     </>
                  }
               </ul>
            </li>
         </div>

         <div className="roomContents-container">
            <ul className="roomContents-list">
            {roomData?.mainRooms?.map((mainRoom) => {
               return (
                  <li key={mainRoom.mainRoomName} className={`room-content  ${mainRoom.mainRoomName && 'parent-room'}`}>
                     <div className="roomContent-head">
                        { mainRoom.mainRoomName &&
                           <button className="hideCollapse-btn">
                              <BsCaretDownFill className='hideCollapse-icon'/>
                           </button>
                        }
                        <p className="folder-name">{mainRoom.mainRoomName}</p>

                        { roomData?.creator.find(creatorID => creatorID === userAuth.uid) &&
                        <>
                           { mainRoom.mainRoomName &&
                              <>
                                 <ul className="category-submenu">
                                    <li className='setting-item'>
                                       <button className="mainSetting-btn">
                                          <RiSettings3Fill className='setting-icon'/>
                                       </button>
                                       <ul className="CategorySetting-menu">
                                          <li className="setting">
                                             <button className="setting-btn" onClick={() => handleRenameMainRoom(mainRoom.mainRoomName)}>
                                                <AiFillEdit className='subsetting-icon'/>
                                             </button>
                                          </li>
                                          <li className="setting">
                                             <button className="setting-btn delete" onClick={() => handleDeleteMainRoom(mainRoom)}>
                                                <FaTrash className='subsetting-icon'/>
                                             </button>
                                          </li>
                                       </ul>
                                    </li>
                                 </ul>

                                 <ul className="category-submenu">
                                    <li className='add-item'>
                                       <button className="addMiniRoom-btn">
                                          <HiPlus className='addMiniRoom-icon'/>
                                       </button>
                                       <form className="createMiniRoom-form" onSubmit={(e) => handleCreateMiniRoom(e, mainRoom.mainRoomName)}>
                                          <p className="createMiniRoom-title">Create Mini Room</p>
                                          <input 
                                             type="text"
                                             className="createMiniRoom-input"
                                             value={newMiniRoom}
                                             onChange={(e) => setNewMiniRoom(e.target.value.toLowerCase())}
                                             placeholder="Mini room name" 
                                          />
                                          <div className="type">
                                             <button type="button" className="type-text" onClick={() => setMiniRoomType('text')}>
                                                <BsChatTextFill className="text"/>
                                             </button>
                                             <button type="button" className="type-voice" onClick={() => setMiniRoomType('voice')}>
                                                <GoMegaphone className="voice"/>
                                             </button>
                                          </div>
                                          <button disabled={!miniRoomType ? true : false} className="createMiniRoom-btn">Create</button>
                                       </form>
                                    </li>
                                 </ul>
                              </>
                           }
                        </>
                        }
                     </div>
                     
                     <ul className="subRoom-content">
                     {mainRoom?.miniRooms?.map((miniRoom) => {
                        return (
                           <li key={miniRoom.miniRoomID} className={`subroom-container ${mainRoom.mainRoomName && 'child-subroom'} ${miniRoomSelected === miniRoom.miniRoomID && 'current'}`}>
                              <button type='button' onClick={() => handleUrl(miniRoom.miniRoomID)} className={`subroom `}>
                                 <span className='subRoom-icon'>
                                    {miniRoom.miniRoomType === 'text' 
                                       ?
                                          <BsChatTextFill className='subroom-icon'/>
                                       :
                                          <GoMegaphone className='subroom-icon'/>
                                    }
                                 </span>
                                 <p className='subroom-name'>{miniRoom.miniRoomName}</p>
                              </button>
                              { roomData?.creator.find(creatorID => creatorID === userAuth.uid) &&
                                 <ul className="category-submenu">
                                    <li className='setting-item'>
                                       <button className="mainSetting-btn">
                                          <RiSettings3Fill className='setting-icon'/>
                                       </button>
                                       <ul className="CategorySetting-menu">
                                          <li className="setting">
                                             <button className="setting-btn" onClick={() => handleRenameMiniRoom(mainRoom, miniRoom)}>
                                                <AiFillEdit className='subsetting-icon'/>
                                             </button>
                                          </li>
                                          <li className="setting">
                                             <button className="setting-btn delete" onClick={() => handleDeleteMiniRoom(mainRoom, miniRoom)}>
                                                <FaTrash className='subsetting-icon'/>
                                             </button>
                                          </li>
                                       </ul>
                                    </li>
                                 </ul>
                              }
                           </li>
                        )
                     })}
                     </ul>
                  </li>
               )
            })}
            </ul>
            <RenameMainRoom
               renameMainRoomPopup={renameMainRoomPopup}
               setRenameMainRoomPopup={setRenameMainRoomPopup}
               prevMainRoomName={prevMainRoomName}
               currRoom={currRoom}
            />
            <RenameMiniRoom
               renameMiniRoomPopup={renameMiniRoomPopup}
               setRenameMiniRoomPopup={setRenameMiniRoomPopup}
               prevMiniRoom={prevMiniRoom}
               currRoom={currRoom}
               currMainRoom={currMainRoom}
            />
            <CreateMainRoom
               createMainRoomPopup={createMainRoomPopup}
               setCreateMainRoomPopup={setCreateMainRoomPopup}
               currRoom={currRoom}
            />
         </div>

      </div>
   )
}

export default RoomMgmt