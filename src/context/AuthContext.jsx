import { createContext, useContext, useEffect, useState } from 'react';
import uuid from 'react-uuid'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot, arrayRemove, deleteDoc} from 'firebase/firestore';
import {ref, uploadBytes, getDownloadURL, getStorage, deleteObject, listAll} from 'firebase/storage'

const UserContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [userAuth, setUserAuth] = useState({})
  const [userIcon, setUserIcon] = useState('')
  const [status, setStatus] = useState('')

  const [userServers, setUserServers] = useState([])
  const [roomData, setRoomData] = useState({})
  const [currMiniRoomData, setCurrMiniRoomData] = useState({})

  const [userDmRooms, setUserDmRooms] = useState([])
  const [dmRoomData, setDmRoomData] = useState({})

  const [friendRequests, setFriendRequests] = useState({})
  const [friends, setFriends] = useState([])



  // Create New User ==========================================================================================
  const createUser = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }
  // ==========================================================================================================




  // Complete User Registration ===============================================================================
  const finishReg = async (username, file) => {
    let res = await checkUsername(username)
    if (res.status) {
      await updateUserServerImg(file)
      return res
    }
    else
      return res
  }
  // ==========================================================================================================




  // Check Username ===========================================================================================
  const checkUsername = async (username) => {
    const docRef = doc(db, "users", username)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      console.log('username exists')
      return {
        status: false,
        message: "Username already taken"
      }
    }
    else {
      try {
        await setDoc(doc(db, "users", username), {
          userID: auth.currentUser.uid,
          status: 'active',
          friendRequests: {
            received: [],
            sent: []
          }
        })
        setUserAuth(auth.currentUser)
        await updateProfile(auth.currentUser, {
          displayName: username
        })
        
        return {
          status: true,
          message: "success"
        }
      } catch(e) {
        console.log('CheckUsername: ', e.message)
      }
    }
  }
  // ==========================================================================================================




  // Update User Rooms ========================================================================================
  const updateUserServers = async (file, imgURL, roomName, roomID, miniRoomID) => {
    if (userAuth.displayName) {
      try {
        const docRef = doc(db, 'users', userAuth.displayName)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const newRoom = {
            name: roomName,
            roomID: roomID,
            miniRoomID: miniRoomID,
            roomIcon: imgURL,
            roomIconID: file.name
          }
          await updateDoc(docRef, {
            rooms: arrayUnion(newRoom)
          });
          return
        }
      } catch (err) {
        console.log("updateUserServers: ", err.message)
      }
    }
  }
  // ==========================================================================================================




  // Add User or Server Icon ==================================================================================
  const updateUserServerImg = async (file, mode='user', roomName=null, roomID=null, miniRoomID=null) => {
    let fileName = ''
    if (mode === 'user')
      fileName = `users/${userAuth.displayName}/${file.name}`
    else if (mode === 'room')
      fileName= `rooms/${roomID}/${file.name}_${roomID}`
    const storageRef = ref(storage, fileName)
    
    try {
      await uploadBytes(storageRef, file).then( async (snapshot) => {
        await getDownloadURL(snapshot.ref)
        .then( async (imageUrl) => {
            if (mode === 'room') {
              await updateUserServers(file, imageUrl, roomName, roomID, miniRoomID)
            }
            else {
              await updateProfile(auth.currentUser, {
                photoURL: imageUrl
              })
              
              const docRef = doc(db, "users", userAuth.displayName)
              await updateDoc(docRef, {
                userIcon: imageUrl
              });
              setUserIcon(imageUrl)
            }
        })
      });
  
      return {
        status: true,
        message: "success"
      }
    } catch(e) {
      console.log('UpdateUserServerImg: ', e.message)
    }
  }
  // ==========================================================================================================




  // Authenticate User ========================================================================================
  const signIn = (email, password) =>  {
  return signInWithEmailAndPassword(auth, email, password)
  }
  // ==========================================================================================================




  // Logout User ==============================================================================================
  const logout = () => {
    setUserAuth('')
    setStatus('')
    setUserServers([])
    setFriendRequests([])
    setFriends([])
    localStorage.clear()
    return signOut(auth)
  }
  // ==========================================================================================================




  // Change User Activity Status ==============================================================================
  const changeStatus = async (newStatus) => {
    if (userAuth.displayName) {
      try {
        const docRef = doc(db, 'users', userAuth.displayName)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          await updateDoc(docRef, {
            status: newStatus
          });
        }
        await updateFriendStatus(newStatus)
        return
      } catch (err) {
        console.log("changeStatus: ", err.message)
      }
    }
  }
  const updateFriendStatus = async (newStatus) => {
    const docRef = doc(db, `users/${userAuth.displayName}/Friends`, 'FriendRoom')
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const friends = docSnap.data().friends
      
      for (let i = 0; i < friends.length; ++i) {
        const friendDocRef = doc(db, `users/${friends[i].friendUsername}/Friends`, 'FriendRoom')
        const friendDocSnap = await getDoc(friendDocRef)

        if (friendDocSnap.exists()) {
          const friendList = friendDocSnap.data().friends
          const index = friendList.findIndex(elem => elem.friendUsername === userAuth.displayName)
          friendList[index].status = newStatus

          try {
            await updateDoc(friendDocRef, {
              friends: friendList
            });
          } catch (e) {
            console.log('updateFriendStatus: ', e.message)
          }
        }
      }
    }
  } 
  // ==========================================================================================================




  // Create Room ==============================================================================================
  const createUserRoom = async (category, roomName, roomImg) => {
    if (userAuth.displayName) {
      try {

        if (userServers.length > 0 && userServers.find(room => room.name === roomName)) {
          return {
            status: false,
            message: `You've used "${roomName}" as a room name already`
          }
        }

        const roomID = uuid()
        const miniRoomIDOne = uuid()
        const miniRoomIDTwo = uuid()
        await setDoc(doc(db, `rooms`, roomID), {
          roomID: roomID,
          roomCategory: category,
          roomName: roomName,
          participantIDs: [userAuth.uid],
          participantsInfo: [{
            participantUsername: userAuth.displayName,
            participantIcon: userAuth.photoURL
          }],
          mainRooms: [{
            mainRoomName: 'Text Main Room',
            miniRooms: [{
              miniRoomID: miniRoomIDOne,
              miniRoomName: 'general',
              miniRoomType: 'text'
            }]
          }, {
            mainRoomName: 'Voice Main Room',
            miniRooms: [{
              miniRoomID: miniRoomIDTwo,
              miniRoomName: 'general',
              miniRoomType: 'voice'
            }]
          }],
          currMiniRoomUrl: miniRoomIDOne,
          creator: [userAuth.uid]
        })

        await setDoc(doc(db, `rooms/${roomID}/MiniRooms`, miniRoomIDOne), {
          miniRoomName: 'general',
          miniRoomID: miniRoomIDOne,
          miniRoomType: 'text'
        })

        await setDoc(doc(db, `rooms/${roomID}/MiniRooms`, miniRoomIDTwo), {
          miniRoomName: 'general',
          miniRoomID: miniRoomIDOne,
          miniRoomType: 'voice',
        })
        const res = await updateUserServerImg(roomImg, 'room', roomName, roomID, miniRoomIDOne)
        return res
        
      } catch(err) {
        console.log('CreateUserRoom: ', err)
        return {
          status: false,
          message: 'error while creating room'
        }
      }
    }
  }
  // ==========================================================================================================




  // Delete Room ==============================================================================================
  const deleteRoom = async (currRoom) => {
    await deleteRoomFiles(currRoom.roomID)

    for (let i = 0; i < roomData.participantsInfo?.length; ++i) {
      await updateParticipantsRooms(roomData.participantsInfo[i].participantUsername, currRoom, roomData.roomID)
    }

    for (let i = 0; i < roomData.mainRooms?.length; ++i) {
      for (let j = 0; j < roomData.mainRooms[i].miniRooms?.length; ++j) {
        try {
          await deleteDoc(doc(db, `rooms/${roomData.roomID}/MiniRooms`, roomData.mainRooms[i].miniRooms[j].miniRoomID))
        } catch(e) {
          console.log('deleteMiniRoom', e.message)
        }
      }
    }
    
    try {
      await deleteDoc(doc(db, 'rooms', roomData.roomID))
    } catch(e) {
      console.log('deleteRoom', e.message)
    }

    localStorage.removeItem('currRoom')
    localStorage.removeItem('currRoomData')
    localStorage.removeItem('currMiniRoomData')
    localStorage.removeItem('miniRoomSelected')
    setRoomData({})
    setCurrMiniRoomData({})
  }
  const updateParticipantsRooms = async (participantUsername, currRoom, roomID) => {
    const docRef = doc(db, 'users', participantUsername)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      try {
        await updateDoc(docRef, {
          rooms: arrayRemove({
            miniRoomID: roomData.currMiniRoomUrl,
            name: currRoom.roomName,
            roomID: currRoom.roomID,
            roomIcon: currRoom.roomIcon,
            roomIconID: currRoom.roomIconID
          })
        });
      } catch(e) {
        console.log('updateParticipantsRooms', e.message)
      }
    }
    return
  }
  const deleteRoomFiles = async (currRoomID) => {
    const room = `rooms/${currRoomID}`
    const storage = getStorage()
    const storageRef = ref(storage, room)

    listAll(storageRef)
    .then((res) => {
      res.prefixes.forEach((folderRef) => {
        listAll(folderRef)
        .then((res) => {
          res.items.forEach((subItemRef) => {
            deleteObject(subItemRef)
          });
        }).catch((error) => {
          console.log('deleteRoomFiles-in-subFolders: ', error.message)
        });
      });
      res.items.forEach((itemRef) => {
        deleteObject(itemRef)
      });
    }).catch((error) => {
      console.log('deleteRoomFiles: ', error.message)
    });

  }
  // ==========================================================================================================




  // Fetch Server Data ========================================================================================
  const getRoomData = async (roomID) => {
    if (!roomID)
      return
    else {
      try {
        const docRef = doc(db, 'rooms', roomID)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setRoomData(docSnap.data())
          localStorage.setItem('currRoomData', JSON.stringify(docSnap.data()))
        }
      } catch(err) {
        console.log('getRoomData: ', err.message)
      }
    }
  } 
  // ==========================================================================================================




  // Update Room ==============================================================================================
  const updateRoom = async (miniRoomName, miniRoomID, miniRoomType, currRoomID, currMainRoomName) => {
    if (userAuth.displayName) {
      try {
        const docRef = doc(db, 'rooms', currRoomID)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const newMiniRoom = {
            miniRoomID: miniRoomID,
            miniRoomName: miniRoomName,
            miniRoomType: miniRoomType
          }

          const roomData = docSnap.data()
          const mainRooms = roomData.mainRooms
          const updateMainRoom = mainRooms.find(mainRoom => mainRoom['mainRoomName'] === currMainRoomName)

          if (!updateMainRoom.miniRooms) {
            updateMainRoom['miniRooms'] = [{
              miniRoomID: miniRoomID,
              miniRoomName: miniRoomName,
              miniRoomType: miniRoomType
            }]
          }
          else
            updateMainRoom.miniRooms.push(newMiniRoom)

          const index = roomData.mainRooms.findIndex(elem => elem.mainRoomName === currMainRoomName)
          mainRooms[index] = updateMainRoom

          await updateDoc(docRef, {
            mainRooms: mainRooms
          });

          setRoomData(roomData)
          localStorage.setItem('currRoomData', JSON.stringify(roomData))
          return
        }
      } catch (err) {
        console.log("updateRoom: ", err.message)
      }
    }
  }
  // ==========================================================================================================




  // Create Main Room =========================================================================================
  const createMainRoom = async (mainRoomName, currRoomID) => {
    if (userAuth.displayName) {
      const docRef = doc(db, 'rooms', currRoomID)
      const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const roomData = docSnap.data()
          let mainRooms = roomData.mainRooms

          const newMainRoom = {
            mainRoomName: mainRoomName
          }
          mainRooms.push(newMainRoom)
          try {
            await updateDoc(docRef, {
              mainRooms: mainRooms
            });
          } catch(e) {
            console.log('CreateMainRoom: ', e.message)
          }

          setRoomData(roomData)
          localStorage.setItem('currRoomData', JSON.stringify(roomData))
          return
        }
    }
  }
  // ==========================================================================================================




  // Rename Main Room =========================================================================================
  const renameMainRoom = async (prevMainRoomName, newMainRoomName, currRoomID) => {
    if (userAuth.displayName) {
      const docRef = doc(db, 'rooms', currRoomID)
      const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const roomData = docSnap.data()
          const mainRooms = roomData.mainRooms
          const updateMainRoom = mainRooms.find(mainRoom => mainRoom['mainRoomName'] === prevMainRoomName)
          updateMainRoom.mainRoomName = newMainRoomName

          try {
            await updateDoc(docRef, {
              mainRooms: mainRooms
            });
          } catch(e) {
            console.log('RenameMainRoom: ', e.message)
          }

          setRoomData(roomData)
          localStorage.setItem('currRoomData', JSON.stringify(roomData))
          return
        }
    }
  }
  // ==========================================================================================================




  // Delete Main Room =========================================================================================
  const deleteMainRoom = async (currRoomID, mainRoomName) => {
    if (userAuth.displayName) {
      const docRef = doc(db, 'rooms', currRoomID)
      const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const roomData = docSnap.data()
          const mainRooms = roomData.mainRooms
          const updateMainRoom = mainRooms.find(mainRoom => mainRoom['mainRoomName'] === mainRoomName)

          if (!updateMainRoom?.miniRooms || updateMainRoom?.miniRooms?.length < 1) {
            try {
              await updateDoc(docRef, {
                mainRooms: arrayRemove(updateMainRoom)
              });
            } catch(e) {
              console.log('DeleteMainRoom: ', e.message)
            }
          }
          else {
            updateMainRoom.mainRoomName = ""

            try {
              await updateDoc(docRef, {
                mainRooms: mainRooms
              });
            } catch(e) {
              console.log('DeleteMainRoom: ', e.message)
            }

          }

          setRoomData(roomData)
          localStorage.setItem('currRoomData', JSON.stringify(roomData))
          return
        }
    }
  }
  // ==========================================================================================================




  // Create Mini Room =========================================================================================
  const createMiniRoom = async (newMiniRoomName, miniRoomType, currRoomID, currMainRoomName) => {
    if (userAuth.displayName) {
      try {
        const miniRoomID = uuid()
        const newMiniRoom = {
          miniRoomID: miniRoomID,
          miniRoomName: newMiniRoomName,
          miniRoomType: miniRoomType
        }

        await setDoc(doc(db, `rooms/${currRoomID}/MiniRooms`, miniRoomID), newMiniRoom)

        await updateRoom(newMiniRoomName, miniRoomID, miniRoomType, currRoomID, currMainRoomName)

      } catch(err) {
        console.log("CreateMiniRoom: ", err.message)
      }
    }
  }
  // ==========================================================================================================




  // Rename Mini Room =========================================================================================
  const renameMiniRoom = async (miniRoomID, newMiniRoomName, currRoomID, mainRoomName) => {
    if (userAuth.displayName) {
      try {
        const docRoomRef = doc(db, 'rooms', currRoomID)
        const docRoomSnap = await getDoc(docRoomRef)
        const docMiniRoomRef = doc(db, `rooms/${currRoomID}/MiniRooms`, miniRoomID)
        const docMiniRoomSnap = await getDoc(docMiniRoomRef)
        
        if (docRoomSnap.exists()) {
          const mainRooms = docRoomSnap.data()?.mainRooms
          const mainRoom = mainRooms.find(mainRoom => mainRoom.mainRoomName === mainRoomName)
          const index = mainRoom.miniRooms.findIndex(prevMiniRoom => prevMiniRoom.miniRoomID === miniRoomID)
          mainRoom.miniRooms[index].miniRoomName = newMiniRoomName

          await updateDoc(docRoomRef, {
            mainRooms: mainRooms
          })

          if (docMiniRoomSnap.exists()) {
            await updateDoc(docMiniRoomRef, {
              miniRoomName: newMiniRoomName
            })
          }
          
        }
      } catch(e) {
        console.log('RenameMiniRoom: ', e.message)
      }
    }
  }
  // ==========================================================================================================


  

  // Delete Mini Room =========================================================================================
  const deleteMiniRoom = async (currRoomID, mainRoomName, miniRoomID) => {
    if (userAuth.displayName) {
      const roomDocRef = doc(db, 'rooms', currRoomID)
      const roomDocSnap = await getDoc(roomDocRef)
        if (roomDocSnap.exists()) {
          const roomData = roomDocSnap.data()
          const mainRooms = roomData.mainRooms
          const updateMainRoom = mainRooms.find(mainRoom => mainRoom['mainRoomName'] === mainRoomName)
          const index = updateMainRoom.miniRooms.findIndex(miniRoom => miniRoom.miniRoomID === miniRoomID)

          updateMainRoom.miniRooms.splice(index, 1)

          if (!updateMainRoom?.miniRooms || updateMainRoom?.miniRooms?.length < 1) {
            const index = mainRooms.findIndex(mainRoom => mainRoom.mainRoomName === mainRoomName)
            mainRooms.splice(index, 1)
          }

          await updateDoc(roomDocRef, {
            mainRooms: mainRooms
          });

          setRoomData(roomData)
          localStorage.setItem('currRoomData', JSON.stringify(roomData))
        }

      await deleteDoc(doc(db, `rooms/${currRoomID}/MiniRooms`, miniRoomID))
    }
  }
  const updateCurrMiniRoom = async (currRoomID, newMiniRoomID) => {
    if (userAuth.displayName) {
      const roomDocRef = doc(db, 'rooms', currRoomID)
      const roomDocSnap = await getDoc(roomDocRef)
      const userDocRef = doc(db, 'users', userAuth.displayName)
      const userDocSnap = await getDoc(userDocRef)

      if (roomDocSnap.exists()) {
        await updateDoc(roomDocRef, {
          currMiniRoomUrl: newMiniRoomID
        });
      }
      
      if (userDocSnap.exists()) {
        const rooms = userDocSnap.data().rooms
        const room = rooms.find(room => room.roomID === currRoomID)
        room.miniRoomID = newMiniRoomID

        await updateDoc(userDocRef, {
          rooms: rooms
        })
      }

    }
  }
  // ==========================================================================================================



  
  // Get Mini Room Data =======================================================================================
  const getMiniRoomData = async (currRoomID, miniRoomID) => {
    if (userAuth.displayName) {
      try {
        const docRef = doc(db, `rooms/${currRoomID}/MiniRooms`, miniRoomID)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setCurrMiniRoomData(docSnap.data())
          localStorage.setItem('currMiniRoomData', JSON.stringify(docSnap.data()))
          return
        }

      } catch(err) {
        console.log('getMiniRoomData: ', err.message)
      }
    }
  }
  // ==========================================================================================================




  //Upload Message ============================================================================================
  const uploadRoomMsg = async (message, currRoomID, miniRoomID) => {
    if (userAuth.displayName) {
      try {
        const docRef = doc(db, `rooms/${currRoomID}/MiniRooms`, miniRoomID)
        const docSnap = await getDoc(docRef)
        let timestamp = new Date().toLocaleString()
        timestamp = timestamp.substring(0, timestamp.lastIndexOf(':')) + timestamp.substring(timestamp.lastIndexOf(' '))

        if (docSnap.exists()) {
          if (message.msgFile) {
            await uploadMsgFile(message, currRoomID, docRef, timestamp)
          }
          else {
            await updateDoc(docRef, {
              messages: arrayUnion({
                msgID: message.msgID,
                authorID: userAuth.uid,
                authorName: userAuth.displayName,
                authorIcon: userAuth.photoURL,
                pinned: false,
                reply: message.replyTo ? message.replyTo : null,
                replyFile: message.replyToFile,
                messageFile: null, 
                message: message.msg,
                timestamp: timestamp
              })
            });
          }
        }
      } catch(err) {
        console.log('UploadRoomMsg: ', err.message)
      }
    }
  }

  const uploadMsgFile = async (msg, currRoomID, docRef, timestamp) => {
    const fileName = `rooms/${currRoomID}/messageFiles/${msg.msgFile.name}`
    const storageRef = ref(storage, fileName)
    
    try {
      await uploadBytes(storageRef, msg.msgFile).then( async (snapshot) => {
        await getDownloadURL(snapshot.ref)
        .then( async (imageUrl) => {
          await updateDoc(docRef, {
            messages: arrayUnion({
              msgID: msg.msgID,
              authorID: userAuth.uid,
              authorName: userAuth.displayName,
              authorIcon: userAuth.photoURL,
              pinned: false,
              reply: msg.replyTo ? msg.replyTo : null,
              replyFile: msg.replyToFile,
              messageFileName: msg.msgFile.name.substring(msg.msgFile.name.lastIndexOf('_') + 1),
              messageFile: imageUrl, 
              message: msg.msg,
              timestamp: timestamp
            })
          });
        })
      });
    } catch(e) {
      console.log('uploadMsgFile: ', e.message)
    }
  }
  // ==========================================================================================================




  // Create DM Room ===========================================================================================
  const createDmRoom = async (dmFriends) => {
    if (userAuth.displayName) {
      const iconColor = `#${Math.floor(Math.random()*16777215).toString(16)}`
      let dmRoomName = ''
      let participantsInfo = []
      const participantIDs = await addFriendIDs(dmFriends)

      for (let i = 0; i < dmFriends.length; ++i) {
        participantsInfo.push({
          participantUsername: dmFriends[i].friendUsername,
          participantIcon: dmFriends[i].friendIcon
        })
      }

      participantsInfo.push({
        participantIcon: userAuth.photoURL,
        participantUsername: userAuth.displayName,
      })

      participantIDs.push(userAuth.uid)

      for (let i = 0; i < participantsInfo.length; ++i) {
        if (i === participantsInfo.length - 1)
          dmRoomName += participantsInfo[i].participantUsername
        else
          dmRoomName += `${participantsInfo[i].participantUsername} `
      }
      
      try {
        const dmRoomID = uuid()
        const newDmRoom = {
          dmRoomID: dmRoomID,
          dmRoomIcon: iconColor,
          dmRoomName: dmRoomName
        }

        await setDoc(doc(db, 'dmRooms', `${dmRoomID}`), {
          dmRoomID: dmRoomID,
          dmRoomIcon: iconColor,
          dmRoomName: dmRoomName,
          participantsInfo: participantsInfo,
          participantIDs: participantIDs
        })
        await updateUserDmRooms(newDmRoom)

        for (let i = 0; i < participantsInfo.length; ++i) {
          await updateUserDmRooms(newDmRoom, participantsInfo[i].participantUsername)
        }

      } catch(err) {
        console.log("CreateMiniRoom: ", err.message)
      }
    }
  }
  const addFriendIDs = async (dmFriends) => {
    let participantIDs = []

    for (let i = 0; i < dmFriends.length; ++i) {
      const docRef = doc(db, 'users', dmFriends[i].friendUsername)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        participantIDs.push(docSnap.data().userID)
      }
    }
    return participantIDs
  }
  const updateUserDmRooms = async (newDmRoom, dmFriend=null) => {
    try {
      const docRef = doc(db, 'users', !dmFriend ? userAuth.displayName : dmFriend)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          dmrooms: arrayUnion(newDmRoom)
        });
        return
      }
    } catch (err) {
      console.log("updateUserDmRooms: ", err.message)
    }
  }
  // ==========================================================================================================




  // Rename DM Room ===========================================================================================
  
  // ==========================================================================================================




  // Delete DM Room ===========================================================================================
  const deleteDmRoom = async (dmRoomID) => {
    if (userAuth.displayName) {
      try {
        const docRef = doc(db, 'users', userAuth.displayName)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const newDmRooms = docSnap.data().dmrooms
          const dmRoom = newDmRooms.find(dmRoom => dmRoom.dmRoomID === dmRoomID)
          
          await updateDoc(docRef, {
            dmrooms: arrayRemove(dmRoom)
          });
        }
      } catch(e) {
        console.log(e.message)
      }
    }
  }
  // ==========================================================================================================




  // Get DM Room Data =========================================================================================
  const getDmRoomData = async (currDmRoomID) => {
    if (!currDmRoomID)
      return
    else {
      try {
        const docRef = doc(db, 'dmRooms', currDmRoomID)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setDmRoomData(docSnap.data())
          localStorage.setItem('currDmRoomData', JSON.stringify(docSnap.data()))
        }
      } catch(err) {
        console.log(err.message)
      }
    }
  }
  // ==========================================================================================================




  // Upload DM Room Message =================================================================================== 
  const uploadDmRoomMsg = async (message, currDmRoomID) => {
    if (userAuth.displayName) {
      try {
        const docRef = doc(db, 'dmRooms', currDmRoomID)
        const docSnap = await getDoc(docRef)
        let timestamp = new Date().toLocaleString()
        timestamp = timestamp.substring(0, timestamp.lastIndexOf(':')) + timestamp.substring(timestamp.lastIndexOf(' '))

        if (docSnap.exists()) {
          if (message.msgFile) {
            await uploadMsgFile(message, docRef, timestamp)
          }
          else {
            await updateDoc(docRef, {
              messages: arrayUnion({
                msgID: message.msgID,
                authorID: userAuth.uid,
                authorName: userAuth.displayName,
                authorIcon: userAuth.photoURL,
                pinned: false,
                reply: message.replyTo ? message.replyTo : null,
                replyFile: message.replyToFile,
                messageFile: null, 
                message: message.msg,
                timestamp: timestamp
              })
            });
          }
        }
      } catch(err) {
        console.log('UploadRoomMsg: ', err.message)
      }
    }
  }

  // ==========================================================================================================




  // Delete Message ===========================================================================================
  const pinMsg = async (message, currDmRoomID, roomType, currMiniRoomID=null) => {
    if (roomType === 'room') {
      const docRef = doc(db, `rooms/${currDmRoomID}/MiniRooms`, currMiniRoomID)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        try {
        const msgList = docSnap.data()?.messages
        msgList.find(msg => msg.msgID === message.msgID).pinned = true

        await updateDoc(docRef, {
          messages: msgList
        });

        } catch(e) {
          console.log('pinMsg: ', e.message)
        }
      }
    }
    else {
      const docRef = doc(db, 'dmRooms', currDmRoomID)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        try {
          const msgList = docSnap.data()?.messages
          msgList.find(msg => msg.msgID === message.msgID).pinned = true
  
          await updateDoc(docRef, {
            messages: msgList
          });
  
        } catch(e) {
          console.log('pinMsg: ', e.message)
        }
      }
    }
  }
  // ==========================================================================================================
  
  
  
  
  // Unpin Message ===========================================================================================
  const unpinMsg = async (message, currDmRoomID, roomType, currMiniRoomID=null) => {
    if (roomType === 'room') {
      const docRef = doc(db, `rooms/${currDmRoomID}/MiniRooms`, currMiniRoomID)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        try {
        const msgList = docSnap.data()?.messages
        msgList.find(msg => msg.msgID === message.msgID).pinned = false

        await updateDoc(docRef, {
          messages: msgList
        });

        } catch(e) {
          console.log('unpinMsg: ', e.message)
        }
      }
    }
    else {
      const docRef = doc(db, 'dmRooms', currDmRoomID)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        try {
          const msgList = docSnap.data()?.messages
          msgList.find(msg => msg.msgID === message.msgID).pinned = false
  
          await updateDoc(docRef, {
            messages: msgList
          });
  
          } catch(e) {
            console.log('unpinMsg: ', e.message)
          }
      }
    }
  }
  // ==========================================================================================================




  // Delete Message ===========================================================================================
  const deleteMsg = async (message, currDmRoomID, currMiniRoomID=null, roomType) => {
    if (roomType === 'room') {
      const docRef = doc(db, `rooms/${currDmRoomID}/MiniRooms`, currMiniRoomID)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        try {
        const msgList = docSnap.data()?.messages
        const msg = msgList.find(msg => msg.msgID === message.msgID)

        await updateDoc(docRef, {
          messages: arrayRemove(msg)
        });

        if (message.messageFile)
          await deleteMsgFile(message, currDmRoomID, currMiniRoomID)

        } catch(e) {
          console.log('deleteMsg: ', e.message)
        }
      }
    }
    else {
      const docRef = doc(db, 'dmRooms', currDmRoomID)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        try {
        const msgList = docSnap.data()?.messages
        const msg = msgList.find(msg => msg.msgID === message.msgID)

        await updateDoc(docRef, {
          messages: arrayRemove(msg)
        });

        } catch(e) {
          console.log('deleteMsg: ', e.message)
        }
      }
    }
  }

  const deleteMsgFile = async (message, currDmRoomID, currMiniRoomID=null) => {
    let msgFile = ''
    const storage = getStorage()
    if (currMiniRoomID)
      msgFile = `rooms/${currDmRoomID}/messageFiles/${message.msgID}_${message.messageFileName}`
    else
      msgFile = `message_${userAuth.uid}_${currDmRoomID}_${message.msgID}`

    const storageRef = ref(storage, msgFile)

    try {
      await deleteObject(storageRef)
    } catch(e) {
      console.log('DeleteRoomIcon: ', e.message)
    }
  }
  // ==========================================================================================================




  // Friend Request ===========================================================================================
  const sendRequest = async (requestee, requestMsg, currRoom=null) => {
    if (userAuth.displayName) {
      let room = {}
      if (currRoom) {
        room = {
          roomID: currRoom.roomID || currRoom.dmRoomID,
          roomIcon: currRoom.roomIcon || currRoom.dmRoomIcon,
          roomName: currRoom.roomName || currRoom.dmRoomName,
          miniRoomID: roomData.currMiniRoomUrl || null
        }

        await addPendingParticipant(room, requestee)
      }

      if (Array.isArray(requestee)) {
        for (let i = 0; i < requestee.length; ++i) {
          const requesteeDocRef = doc(db, 'users', requestee[i].friendUsername)
          const requesteeDocSnap = await getDoc(requesteeDocRef)

          if (!requesteeDocSnap.exists()) {
            return {
              status: false,
              message: "user doesn't exist"
            }
          }
          await updateRequestee(requestMsg, requesteeDocRef, requesteeDocSnap.data(), room)
          await updateRequester(requestMsg, requestee[i].friendUsername, requestee[i].friendIcon, room)
        }
      }
      else {
        const requesteeDocRef = doc(db, 'users', requestee)
        const requesteeDocSnap = await getDoc(requesteeDocRef)

        if (!requesteeDocSnap.exists()) {
          return {
            status: false,
            message: "user doesn't exist"
          }
        }
        if (requestMsg === 'Friend Request')
          await addPendingFriend(requesteeDocSnap.data())

        await updateRequestee(requestMsg, requesteeDocRef, requesteeDocSnap.data(), currRoom=null)
        await updateRequester(requestMsg, requestee, requesteeDocSnap.data().userIcon, currRoom=null)
      }

      return {
        status: true,
        message: 'sucess'
      }
    }
  }
  
  const updateRequestee = async (requestMsg, userDocRef, userData, currRoom=null) => {
    let newFriendRequests = {}
    const newRequest = {
      requester: userAuth.displayName,
      requesterIcon: userAuth.photoURL,
      requestMsg: requestMsg,
      requestRoom: currRoom,
      status: 'pending',
      timestamp: new Date().toLocaleString()
    }
    
    newFriendRequests = userData.friendRequests
    newFriendRequests.received.push(newRequest)

    await updateDoc(userDocRef, {
      friendRequests: newFriendRequests
    });
  }
  
  const updateRequester = async (requestMsg, requesteeName, requesteeIcon, currRoom=null) => {
    const requesterDocRef = doc(db, 'users', userAuth.displayName)
    const requesterDocSnap = await getDoc(requesterDocRef)
    const userData = requesterDocSnap.data()
    let newFriendRequests = {}
    const newRequest = {
      requestee: requesteeName,
      requesteeIcon: requesteeIcon,
      requestMsg: requestMsg,
      requestRoom: currRoom,
      status: 'pending',
      timestamp: new Date().toLocaleString()
    }
    
    newFriendRequests = userData.friendRequests
    newFriendRequests.sent.push(newRequest)

    await updateDoc(requesterDocRef, {
      friendRequests: newFriendRequests
    });
  }

  const addPendingParticipant = async (room, requestee) => {
    if (room.miniRoomID) { 
      const docRef = doc(db, 'rooms', room.roomID)
      const docSnap = await getDoc(docRef)
      let participantID = ''

      if (docSnap.exists()) {
        for (let i = 0; i < requestee.length; ++i) {
          const requesteeDocRef = doc(db, 'users', requestee[i].friendUsername)
          const requesteeDocSnap = await getDoc(requesteeDocRef)
  
          if (requesteeDocSnap.exists()) {
            participantID = requesteeDocSnap.data().userID

            await updateDoc(docRef, {
              participantIDs: arrayUnion(participantID),
              participantsInfo: arrayUnion({
                participantIcon: requestee[i].friendIcon,
                participantUsername: requestee[i].friendUsername,
                participation: 'pending'
              })
            });
          }
        }
      }
    }
    else {
      const docRef = doc(db, 'dmRooms', room.roomID)
      const docSnap = await getDoc(docRef)
      let participantID = ''

      if (docSnap.exists()) {
        for (let i = 0; i < requestee.length; ++i) {
          const requesteeDocRef = doc(db, 'users', requestee[i].friendUsername)
          const requesteeDocSnap = await getDoc(requesteeDocRef)
  
          if (requesteeDocSnap.exists()) {
            participantID = requesteeDocSnap.data().userID

            await updateDoc(docRef, {
              participantIDs: arrayUnion(participantID),
              participantsInfo: arrayUnion({
                participantIcon: requestee[i].friendIcon,
                participantUsername: requestee[i].friendUsername,
                participation: 'pending'
              })
            });
          }
        }
      }
    }
  }

  const addPendingFriend = async (requestee) => {
    const docRef = doc(db, `users/${userAuth.displayName}/Friends`, 'FriendRoom')
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      updateDoc(docRef, {
        friendIDs: arrayUnion(requestee.userID)
    })
    } 

    else {
      setDoc(docRef, {
        friendIDs: [requestee.userID]
      })
    }
  }
  // ==========================================================================================================




  // Complete Friend Request ==================================================================================
  const completeFriendRequest = async (request, response) => {
    if (userAuth.displayName) {
      if (response === 'decline') {
        deleteRequest(request)
      }
      else if (request.requestMsg === 'Friend Request') {
        await completeFriendRequesteeRequest(request)
        await completeFriendRequesterRequest(request)
        deleteRequest(request, 'accept')
      }
      else if (request.requestMsg === 'Room Invite') {
        await completeRoomRequest(request)
        deleteRequest(request, 'accept')
      }
      else {
        await completeDmRoomRequest(request)
        deleteRequest(request, 'accept')
      }
    }
  }
  const deleteRequest = async (request, mode=null) => {
    if (mode === 'decline') {
      const requesterDocRef = doc(db, 'users', userAuth.displayName)
      const requesterDocSnap = await getDoc(requesterDocRef)

      if (requesterDocSnap.exists()) {
        const newFriendRequests = requesterDocSnap.data().friendRequests
        const friendRequestsSent = newFriendRequests.sent
        const index = friendRequestsSent.findIndex(elem => elem.requester === userAuth.displayName)

        friendRequestsSent.splice(index, 1)
        newFriendRequests.sent = friendRequestsSent
        
        await updateDoc(requesterDocRef, {
          friendRequests: newFriendRequests
        });
      }      
      return
    }

    const requesteeDocRef = doc(db, 'users', userAuth.displayName)
    const requesteeDocSnap = await getDoc(requesteeDocRef)
    const requesterDocRef = doc(db, 'users', request.requester)
    const requesterDocSnap = await getDoc(requesterDocRef)

    if (requesteeDocSnap.exists()) {
      const newFriendRequests = requesteeDocSnap.data().friendRequests
      const friendRequestsReceived = newFriendRequests.received
      const index = friendRequestsReceived.findIndex(elem => elem.requester === request.requester)

      friendRequestsReceived.splice(index, 1)
      newFriendRequests.received = friendRequestsReceived
      
      await updateDoc(requesteeDocRef, {
        friendRequests: newFriendRequests
      });
    }

    if (requesterDocSnap.exists() && !mode) {
      const newFriendRequests = requesterDocSnap.data().friendRequests
      const friendRequestsSent = newFriendRequests.sent
      const updateFriendRequest = friendRequestsSent.find(request => request.requestee === userAuth.displayName)
      updateFriendRequest.status = 'decline'

      newFriendRequests.sent = friendRequestsSent

      await updateDoc(requesterDocRef, {
        friendRequests: newFriendRequests
      });

      if (request.requestMsg === 'Friend Request'){
        const friendsRef = doc(db, `users/${request.requester}/Friends`, 'FriendRoom')

        updateDoc(friendsRef, {
          friendIDs: arrayRemove(userAuth.uid)
        })

        return
      }

      if (request.requestRoom.miniRoomID) { 
        const docRef = doc(db, 'rooms', request.requestRoom.roomID)
        const docSnap = await getDoc(docRef)
  
        if (docSnap.exists()) {

          await updateDoc(docRef, {
            participantIDs: arrayRemove(userAuth.uid),
            participantsInfo: arrayRemove({
              participantIcon: userAuth.photoURL,
              participantUsername: userAuth.displayName,
              participation: 'pending'
            })
          });
        }
        return
      }
      else {
        console.log('dmRoom')
      }

      return
    }

    if (requesterDocSnap.exists() && mode === 'accept') {
      const newFriendRequests = requesterDocSnap.data().friendRequests
      const friendRequestsSent = newFriendRequests.sent
      const index = friendRequestsSent.findIndex(elem => elem.requestee === userAuth.displayName)
      friendRequestsSent.splice(index, 1)
      newFriendRequests.sent = friendRequestsSent
      
      await updateDoc(requesterDocRef, {
        friendRequests: newFriendRequests
      });
      return
    }
  }
  const completeFriendRequesteeRequest = async (request) => {
    const docRef = doc(db, `users/${userAuth.displayName}/Friends`, 'FriendRoom')
    const docSnap = await getDoc(docRef)
    const requesterDocSnap = await getDoc(doc(db, 'users', request.requester))
    let status = ''
    let requesterID = ''

    if (requesterDocSnap.exists()) {
      requesterID = requesterDocSnap.data().userID
      status = requesterDocSnap.data().status
    }

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        friends: arrayUnion({
          friendUsername: request.requester,
          friendIcon: request.requesterIcon,
          status: status
        }),
        friendIDs: arrayUnion(requesterID)
      });
    }
    else {
      try {
        await setDoc(doc(db, `users/${userAuth.displayName}/Friends`, 'FriendRoom'), {
          friends: [{
            friendUsername: request.requester,
            friendIcon: request.requesterIcon,
            status: status
          }],
          friendIDs: [requesterID]
        })
      } catch (e) {
        console.log('completeFriendRequesteeRequest: ', e.message)
      }
    }
  }
  const completeFriendRequesterRequest = async (request) => {
    const docRef = doc(db, `users/${request.requester}/Friends`, 'FriendRoom')
    const docSnap = await getDoc(docRef)
    const requesteeDocSnap = await getDoc(doc(db, 'users', userAuth.displayName))
    let status = ''

    if (requesteeDocSnap.exists()) {
      status = requesteeDocSnap.data().status
    }

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        friends: arrayUnion({
          friendUsername: userAuth.displayName,
          friendIcon: userAuth.photoURL,
          status: status
        })
      });
    }
    else {
      try {
        await setDoc(doc(db, `users/${request.requester}/Friends`, 'FriendRoom'), {
          friends: [{
            friendUsername: userAuth.displayName,
            friendIcon: userAuth.photoURL,
            status: status
          }]
        })
      } catch(e) {
        console.log('completeFriendRequesterRequest: ', e.message)
      }
    }

  }
  const completeRoomRequest = async (request) => {
    try {
      const docUserRef = doc(db, 'users', userAuth.displayName)
      const docUserSnap = await getDoc(docUserRef)
      const docRoomRef = doc(db, 'rooms', request.requestRoom.roomID)
      const docRoomSnap = await getDoc(docRoomRef)

      if (docUserSnap.exists()) {
        const newRoom = {
          name: request.requestRoom.roomName,
          roomID: request.requestRoom.roomID,
          miniRoomID: request.requestRoom.miniRoomID,
          roomIcon: request.requestRoom.roomIcon
        }
        try {
          await updateDoc(docUserRef, {
            rooms: arrayUnion(newRoom)
          });
        } catch(e) {
          console.log('completeRoomRequest new room: ', e.message)
        }
      }

      if (docRoomSnap.exists()) {
        const participants = docRoomSnap.data().participantsInfo
        const index = participants.findIndex(participant => participant.participantUsername === userAuth.displayName)
        participants[index].participation = 'joined'

        try {
          await updateDoc(docRoomRef, {
            participantsInfo: participants
          });
        } catch(e) {
          console.log('completeRoomRequest upading participation: ', e.message)
        }
      }
    } catch (err) {
      console.log("completeRoomRequest: ", err.message)
    }
  }
  const completeDmRoomRequest = async (request) => {
    const docUserRef = doc(db, 'users', userAuth.displayName)
    const docUserSnap = await getDoc(docUserRef)
    const docRoomRef = doc(db, 'dmRooms', request.requestRoom.roomID)
    const docRoomSnap = await getDoc(docRoomRef)
    let newDmRoomName = ''

    if (docRoomSnap.exists()) {
      newDmRoomName = docRoomSnap.data().dmRoomName + ` ${userAuth.displayName}`
      const participants = docRoomSnap.data().participantsInfo
      const index = participants.findIndex(participant => participant.participantUsername === userAuth.displayName)
      participants[index].participation = 'joined' 

      await updateDoc(docRoomRef, {
        dmRoomName: newDmRoomName,
        participantsInfo: participants
      });
    }

    if (docUserSnap.exists()) {
      const newDmRoom = {
        dmRoomName: newDmRoomName,
        dmRoomID: request.requestRoom.roomID,
        dmRoomIcon: request.requestRoom.roomIcon
      }
      try {
        await updateDoc(docUserRef, {
          dmrooms: arrayUnion(newDmRoom)
        });
      } catch(e) {
        console.log('completeDmRoomRequest-your dmRoom list: ', e.message)
      }
    }

    await updateParticipantDmRoom(request, newDmRoomName, docRoomSnap.data().participantsInfo)
    
    
  }
  const updateParticipantDmRoom = async (request, newDmRoomName, participants) => {
    for (let i = 0; i < participants?.length; ++i) {
      const docUserRef = doc(db, 'users', participants[i].participantUsername)
      const docUserSnap = await getDoc(docUserRef)

      if (docUserSnap.exists()) {
        const dmRooms = docUserSnap.data()?.dmrooms
        const updateDmRoom = dmRooms.find(dmRoom => dmRoom.dmRoomID === request.requestRoom.roomID)
        updateDmRoom.dmRoomName = newDmRoomName

        try {
          await updateDoc(docUserRef, {
            dmrooms: dmRooms
          });
        } catch(e) {
          console.log('updateParticipantDmRoom: ', e.message)
        }
      }
    }
  }
  // ==========================================================================================================




  // Delete Friend ============================================================================================
  const deleteFriend = async (friend) => {
    if (userAuth.displayName) {
      const docRef = doc(db, `users/${userAuth.displayName}/Friends`, 'FriendRoom')
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const friends = docSnap.data().friends
        const deleteFriend = friends.find(elem => elem.friendUsername === friend.friendUsername)

        await updateDoc(docRef, {
          friends: arrayRemove(deleteFriend)
        });
      }
    }
  }
  // ==========================================================================================================




  // UseEffect ================================================================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Current User: ',currentUser);
      setUserAuth(currentUser);

      if (currentUser?.displayName && currentUser?.photoURL) {
        onSnapshot(doc(db,'users', currentUser.displayName), async (docData) => {
          setStatus(docData.data().status)
  
          localStorage.setItem('userRooms', JSON.stringify(docData.data().rooms ? docData.data().rooms : []))
          setUserServers(docData.data().rooms ? docData.data().rooms : [])

          localStorage.setItem('userDMRooms', JSON.stringify(docData.data().dmrooms ? docData.data().dmrooms : []))
          setUserDmRooms(docData.data().dmrooms ? docData.data().dmrooms : [])
  
          localStorage.setItem('friendRequests', JSON.stringify(docData.data().friendRequests ? docData.data().friendRequests : []))
          setFriendRequests(docData.data().friendRequests)
        })

        onSnapshot(doc(db,`users/${currentUser.displayName}/Friends`, 'FriendRoom'), (doc) => {
          if (doc.exists()) {
            localStorage.setItem('friends', JSON.stringify(doc.data().friends ? doc.data().friends : []))
            setFriends(doc.data().friends ? doc.data().friends : [])
          }
        })
      }
    });
    return () => {
      unsubscribe();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currDmRoom = localStorage.getItem('currDmRoom')
  useEffect(() => {
    if (localStorage.getItem('currDmRoom')) {
      onSnapshot(doc(db,'dmRooms', JSON.parse(localStorage.getItem('currDmRoom')).dmRoomID), (doc) => {
        if (doc.exists()) {
          console.log('currDmRoom')
          if (localStorage.getItem('currDmRoom')) {
            const currDmRoom = JSON.parse(localStorage.getItem('currDmRoom'))
            currDmRoom.dmRoomName = doc.data().dmRoomName
            
            localStorage.setItem('currDmRoom', JSON.stringify(currDmRoom))
          }
          localStorage.setItem('currDmRoomData', JSON.stringify(doc.data() ? doc.data() : {}))
          setDmRoomData(doc.data() ? doc.data() : {})
        }
      })
    }
  }, [currDmRoom])

  const currRoom = localStorage.getItem('currRoom')
  useEffect(() => {
    if (localStorage.getItem('currRoom')) {
      onSnapshot(doc(db,`rooms/${JSON.parse(localStorage.getItem('currRoom')).roomID}/MiniRooms`, JSON.parse(localStorage.getItem('currRoom')).miniRoomID), (doc) => {
        if (doc.exists()) {
          console.log('currMiniRoomData')
          localStorage.setItem('currMiniRoomData', JSON.stringify(doc.data() ? doc.data() : {}))
          setCurrMiniRoomData(doc.data() ? doc.data() : {})
        }
        else
          console.log('useffect currRoom')
      })
    }
  }, [currRoom])

  const currRoomData = localStorage.getItem('currRoomData')
  useEffect(() => {
    if (localStorage.getItem('currRoomData')) {
      onSnapshot(doc(db,'rooms', JSON.parse(localStorage.getItem('currRoomData')).roomID), (doc) => {
        if (doc.exists()) {
          localStorage.setItem('currRoomData', JSON.stringify(doc.data() ? doc.data() : {}))
          setRoomData(doc.data() ? doc.data() : {})
        }
        else
          console.log('useffect currRoomData')
      })
    }
  }, [currRoomData])

  useEffect(() => {
    if (localStorage.getItem('currRoomData'))
      setRoomData(JSON.parse(localStorage.getItem('currRoomData')))

    if (localStorage.getItem('currMiniRoomData'))
      setCurrMiniRoomData(JSON.parse(localStorage.getItem('currMiniRoomData')))
    
      if (localStorage.getItem('currDmRoomData'))
      setDmRoomData(JSON.parse(localStorage.getItem('currDmRoomData')))
  }, [])
  // ==========================================================================================================

  return (
    <UserContext.Provider value={{ createUser, finishReg, userAuth, userIcon, logout, signIn, status, changeStatus, createUserRoom, deleteRoom, userServers, getRoomData, roomData, createMiniRoom, updateCurrMiniRoom,  uploadRoomMsg, getMiniRoomData, currMiniRoomData, setCurrMiniRoomData, deleteMiniRoom, renameMiniRoom, setRoomData, createMainRoom, renameMainRoom, deleteMainRoom, sendRequest, friendRequests, completeFriendRequest, deleteRequest, friends, deleteFriend, createDmRoom, userDmRooms, getDmRoomData, dmRoomData, setDmRoomData , uploadDmRoomMsg, deleteDmRoom, deleteMsg, pinMsg, unpinMsg}}>
      {children}
    </UserContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(UserContext);
};