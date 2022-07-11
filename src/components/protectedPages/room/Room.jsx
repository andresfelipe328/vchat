// React
import {useRef, useEffect, useState, Fragment} from 'react'
import TextareaAutosize from 'react-textarea-autosize';

import uuid from 'react-uuid';
import { UserAuth } from '../../../context/AuthContext';

// Icons
import { AiFillPushpin, AiFillEdit, AiFillPicture } from 'react-icons/ai'
import { MdOutlineReply } from 'react-icons/md'
import { BiSearchAlt2, BiUpload } from 'react-icons/bi'
import { FaTrash, FaUserPlus, FaBell, FaTimes } from 'react-icons/fa'
import { MdOutlineAddReaction, MdOutlineMoreHoriz } from 'react-icons/md'
import { RiAddLine } from 'react-icons/ri'
import pdfIcon from '../../../static/img/icons/pdf.svg'
import docIcon from '../../../static/img/icons/doc.svg'
import fileIcon from '../../../static/img/icons/file.svg'

// Components
import RoomInvite from './RoomInvite';
import PinnedMsgs from './PinnedMsgs';
import Emoji from '../../static/Emoji';

// Animation
import {gsap, Back} from 'gsap'

const RoomMsg = ({msg}) => {
   const URL_REGEX = /(https?:\/\/[^\s]+)/g
   const msgWords = msg.split(' ')

   return (
      <p className="msg">
         {msgWords.map((word,i) => {
				return word.match(URL_REGEX) ? (
					<Fragment key={i}>
						<a target={'blank'} className='msg-url' href={word}>{word}</a>{' '}
					</Fragment>
				) : (
					word + ' '
				);
			})}
      </p>
   )
}

const Room = ({currRoom, roomInvitePopup, setRoomInvitePopup, pinnedMsgPopup, setPinnedMsgPopup}) => {
   const [msgImg, setMsgImg] = useState('')
   const [msgFileType, setMsgFileType] = useState('')
   const [msgImgPopup, setMsgImgPopup] = useState(false)
   const [msg, setMsg] = useState('')
   const [replyPopup, setReplyPopup] = useState(false)
   const [replyTo, setReplyTo] = useState({})
   const [err, setErr] = useState('')
   const [pinnedMsgs, setPinnedMsgs] = useState([])
   const [emojiPopup, setEmojiPopup] = useState(false)

   const {uploadRoomMsg, currMiniRoomData, userAuth, deleteMsg, pinMsg} = UserAuth('')

   // Animation
   const room = useRef()
   useEffect(() => {
      gsap.to (
         room.current, {
            duration: .8,
            y: 0,
            opacity: 1,
            ease: Back.easeOut.config(2)
         }
      )
   }, [])

   const imgMsg = useRef()
   useEffect(() => {
      if (msgImgPopup) {
         gsap.to (
            imgMsg.current, {
               duration: .8,
               y: 0,
               opacity: 1,
               pointerEvents: 'all',
               display: 'flex',
               ease: Back.easeOut.config(2)
            }
         )
      }
      else {
         gsap.to (
            imgMsg.current, {
               duration: .2,
               y: -20,
               opacity: 0,
               pointerEvents: 'none',
               display: 'none'
            }
         )
      }
   }, [msgImgPopup])

   const reply = useRef()
   useEffect(() => {
      if (replyPopup) {
         gsap.to (
            reply.current, {
               duration: .8,
               y: 0,
               opacity: 1,
               pointerEvents: 'all',
               display: 'flex',
               ease: Back.easeOut.config(2)
            }
         )
      }
      else {
         gsap.to (
            reply.current, {
               duration: .2,
               y: -20,
               opacity: 0,
               pointerEvents: 'none',
               display: 'none'
            }
         )
      }
   }, [replyPopup])

   // Handle Message Submit
   const onEnterPress = async (e) => {
      if(e.keyCode === 13 && e.shiftKey === false) {
         e.preventDefault();

         const message = {
            msgID: msgImg ? msgImg.name.substring(0, msgImg.name.indexOf('_')) : uuid(),
            msgFile: msgImg && msgImgPopup ? msgImg : null,
            replyTo: replyTo.contents ? replyTo.contents : null,
            replyToFile: replyTo.fileContents ? replyTo.fileContents :null,
            msg: msg 
         }
         
         await uploadRoomMsg(message, currRoom.roomID, currRoom.miniRoomID)
         setMsg('')
         setMsgImg('')
         setReplyTo({})
         msgImgPopup && setMsgImgPopup(!msgImgPopup)
         replyPopup && setReplyPopup(!replyPopup)
      }
   }

   const handleAddFile = (e) => {
      e.target.value=""
      setErr('')
   }

   // Resize User msgImg
   const resizeImg = (e) => {
      const imgFile = e.target.files[0]
      const msgID = uuid()
      
      // if (!imgFile.name.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG|gif|mp3|mp4|pdf|doc|docx)$/)) {
      //    setErr('Please select valid image JPG,JPEG,PNG, GIF');
      //       return false;
      // }

      if (!imgFile.name.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)) {
         // const file = new File([imgFile], `message_${userAuth.uid}_${currRoom.roomID}_${currRoom.miniRoomID}_${msgID}`, {
         //    type: imgFile.type,
         //    lastModified: Date.now()
         // });
         const file = new File([imgFile], `${msgID}_${imgFile.name.replace('_','')}`, {
            type: imgFile.type,
            lastModified: Date.now()
         });
         
         setMsgImg(file)
         setMsgFileType(file.type.substring(file.type.indexOf('/') + 1))
         setMsgImgPopup(!msgImgPopup)
      }

      else {
         let reader = new FileReader();
         reader.onload = (e) => {
         const img = new Image();
         img.onload = () => {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            var MAX_WIDTH = 250;
            var MAX_HEIGHT = 250;
            var width = img.width;
            var height = img.height;

            if (width > height) {
               if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
               }
            } else {
               if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
               }
            }
            canvas.width = width;
            canvas.height = height;
            ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            ctx.canvas.toBlob((blob) => {
            const file = new File([blob], `${msgID}_${imgFile.name.replace('_','')}`, {
               type: imgFile.type,
               lastModified: Date.now()
            });
            setMsgImg(file)
            setMsgFileType(file.type.substring(file.type.indexOf('/') + 1))
            }, imgFile.type, 1);
         };
         setMsgImgPopup(!msgImgPopup)
         img.onerror = () => {
               console.log('Invalid image content.');
            return false;
         };
         //debugger
         img.src = e.target.result;
         };
         reader.readAsDataURL(imgFile);
      }

      document.getElementById("msg-input").focus()
   }

   const handleDeleteMsg = async (msg) => {
      await deleteMsg(msg, currRoom.roomID, currRoom.miniRoomID, 'room')
   }

   const handlePinMsg = async (msg) => {
      await pinMsg(msg, currRoom.roomID, 'room', currRoom.miniRoomID)
      // setPinnedMsgs(prev => [...prev, msg])
   }

   const handleReplyTo = (msg) => {
      let replyMsg = ''
      let replyImgMsg = false

      if (msg.message.length > 0)
         replyMsg = msg.message.length < 24 ? msg.message : msg.message.substring(0,24) + '...'
      if (msg.messageFile)
         replyImgMsg = true

      setReplyPopup(!replyPopup)
      setReplyTo({
         replyTo: msg.authorName,
         replyMsgID: msg.msgID,
         contents: msg.authorName + ': ' + replyMsg,
         fileContents: replyImgMsg
      })
   }

   const handleCloseReplyPopup = () => {
      setReplyPopup(!replyPopup)
      setReplyTo('')
   }

   return (
      <div className="dmRoom-wrapper" ref={room}>

         <div className="msgHeadMenu-wrapper">
            <ul className="msgHead-menu">
               <div className="msgHeadMenu-group">
                  <li className="menu-item">
                     <button className="item-btn notification-btn">
                        <FaBell className='item-icon notification-icon'/>
                     </button>
                  </li>
                  <li className="menu-item">
                     <button className="item-btn" onClick={() => setPinnedMsgPopup(!pinnedMsgPopup)}>
                        <AiFillPushpin className='item-icon'/>
                     </button>
                     
                     <PinnedMsgs
                        currRoom={currRoom}
                        pinnedMsgs={pinnedMsgs}
                        setPinnedMsgs={setPinnedMsgs}
                        pinnedMsgPopup={pinnedMsgPopup}
                        setPinnedMsgPopup={setPinnedMsgPopup}
                     />
                  </li>
                  <li className="menu-item">
                     <button className="item-btn" onClick={() => setRoomInvitePopup(!roomInvitePopup)}>
                        <FaUserPlus className='item-icon'/>
                     </button>
                  </li>
               </div>
            
               <li className="menu-item">
                  <div className="form-wrapper">
                     <form className="msgSearch-form">
                        <input
                        type="text" 
                        className="msgSearch-input"
                        placeholder='search...'
                        />
                     </form>
                     <BiSearchAlt2 className='search-icon'/>
                  </div>
               </li>

               <RoomInvite
                  roomInvitePopup={roomInvitePopup}
                  setRoomInvitePopup={setRoomInvitePopup}
               />
            </ul>
         </div>

         <div className="dmMsg-container">
            <ul className="msg-list">
               <li className="msg-container">
                  <div className="msg-head">
                     <div className="msgHead-main">
                        <div className="dmIcon-wrapper">
                           <img src={currRoom?.roomIcon} alt="room icon" className='dm-icon' />
                        </div>
                        <h2 className='dmRoom-name'>
                           - {currMiniRoomData.miniRoomName}
                        </h2>
                     </div>
                     <h5 className='subinfo'>Welcome to the beginning of - {currMiniRoomData.miniRoomName}</h5>
                  </div>

                  <ul className="msg-contents">
                     {currMiniRoomData?.messages?.map((msgContent) => {
                        return (
                           <li key={msgContent.msgID} className={`msg-wrapper ${msgContent.msgID === replyTo.replyMsgID && 'curr-reply'}`}>
                              { msgContent.reply 
                                 &&
                                 <div className='reply-p'>
                                    @{msgContent.reply}
                                    { msgContent.replyFile 
                                       &&
                                          <AiFillPicture className='reply-imgFile'/>
                                    }
                                 </div>
                              }
                              <div className="msg-subHead">
                                 <img src={msgContent.authorIcon} alt="user icon" className="dm-icon" />
                                 <div className="msgSubHead-id">
                                    <p className='msg-author'>{msgContent.authorName}</p>
                                    -<small className='msg-date'>{msgContent.timestamp}</small>-
                                 </div>
                              </div>
                              {msgContent.messageFile 
                              && 
                                 <img className='msg-file' src={msgContent.messageFile} alt="msg file" />
                                    
                              }
                              <RoomMsg
                                 msg = {msgContent.message}
                              />

                              <ul className="msg-menu">
                                 <li className="reaction">
                                    <button className="reaction-btn" onClick={() => setEmojiPopup(!emojiPopup)}>
                                       <MdOutlineAddReaction className='reaction-icon'/>
                                    </button>
                                 </li>
                                 {  userAuth.uid !== msgContent.authorID
                                    &&
                                    <li className="reply">
                                       <button className="reply-btn" onClick={() => handleReplyTo(msgContent)}>
                                          <MdOutlineReply className='reply-icon'/>
                                       </button>
                                    </li>
                                 }
                                 <li className="more">
                                    <button className="more-btn">
                                       <MdOutlineMoreHoriz className='more-icon'/>
                                    </button>
                                    <ul className="more-menu" style={{display: (msgContent.authorName !== userAuth.displayName && msgContent.pinned) && 'none' , bottom: (msgContent.authorName !== userAuth.displayName && !msgContent.pinned) ? -3.25 + 'rem' : (msgContent.authorName === userAuth.displayName && msgContent.pinned) && -3.25 + 'rem'}}>
                                       { !msgContent.pinned &&
                                          <li className="menu-item">
                                             <button className="item-btn" onClick={() => handlePinMsg(msgContent)}>
                                                <AiFillPushpin className='item-icon'/>
                                                <p>Pin</p>
                                             </button>
                                          </li>
                                       }
                                       {userAuth.uid === msgContent.authorID && 
                                          <li className="menu-item delete">
                                             <button className="item-btn" onClick={() => handleDeleteMsg(msgContent)}>
                                                <FaTrash className='delete-icon'/>
                                                <p>delete message</p>
                                             </button>
                                          </li>
                                       }
                                    </ul>
                                 </li>
                              </ul>
                           </li>
                        )
                     })}
                  </ul>
               </li>
            </ul>
         </div>

         <form className="dmMsgform-wrapper">
            <div className="replyTo-container" ref={reply}>
               <div className='reply-to'>
                  <p>Replying to - {replyTo.contents}</p>
                  { replyTo.fileContents
                     &&
                        <AiFillPicture className='reply-imgFile'/>
                  }
               </div>
               <button type='button' className='replyDelete-btn' onClick={handleCloseReplyPopup}>
                  <FaTimes className='replyDelete-icon'/>
               </button>
            </div>

            <div className="msgImg-wrapper" ref={imgMsg}>
               <div className="msgImg-container">
                  {
                     msgFileType.match(/(jpg|jpeg|png|JPG|JPEG|PNG)$/)
                     ?
                     <img 
                        className='msg-img' 
                        src={
                           msgImg && URL.createObjectURL(msgImg)
                        } alt="msg file" 
                     />
                     :
                     <img 
                        className='msg-file' 
                        src={
                           msgFileType === 'pdf'
                           ?
                           pdfIcon
                           :
                           msgFileType === 'doc' || msgFileType === 'docx'
                           ?
                           docIcon
                           :
                           fileIcon
                        } alt="msg file" 
                     />
                  }

                  <div className="img-menu">
                     <button type='button' className='imgDelete-btn' onClick={() => setMsgImgPopup(!msgImgPopup)}>
                        <FaTrash className='imgDelete-icon'/>
                     </button>
                     <button type='button' className='imgEdit-btn'>
                        <AiFillEdit className='imgEdit-icon'/>
                     </button>
                  </div>
               </div>
            </div>

            <Emoji
               msg={msg}
               setMsg={setMsg}
               emojiPopup={emojiPopup}
               setEmojiPopup={setEmojiPopup}
            />

            { err
               &&
                  <p className='msgFile-error'>{err}</p>
            }
            <div className="dmMsgInput-wrapper">
               <label htmlFor="dmMsgImg-input" className="addFile-btn">
                  <BiUpload className='addFile-icon'/>
               </label>
               <input
                  onChange={resizeImg}
                  onClick={(e) => handleAddFile(e)}
                  type='file'
                  style={{display: 'none'}}
                  id ='dmMsgImg-input'
                  required
               />
               <TextareaAutosize
                  id='msg-input'
                  className='dmMsg-input'
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={onEnterPress}
                  value={msg}
                  placeholder='message...' 
               />
               <button type='button' className="addEmoji-btn" onClick={() => setEmojiPopup(!emojiPopup)}>
                  <RiAddLine className='addEmoji-icon' style={{color: 'wheat'}}/>
               </button>
            </div>
         </form>
      </div>
   )
}

export default Room