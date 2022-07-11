import {useState, useEffect, useRef} from 'react'
import { UserAuth } from '../../context/AuthContext';

// Icons
import defaultUser from '../../static/img/icons/defaultUser.svg'
import {BsCameraFill} from 'react-icons/bs'

// Animation
import {gsap, Back} from 'gsap'

// Constant Variable
const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,24}$/;

const RegsiterTwo = () => {
   const [username, setUsername] = useState('')
   const [validUsername, setValidUsername] = useState(false)
   const [usernameFocus, setUsernameFocus] = useState(false)

   const [accImg, setAccImg] = useState('')
   const [err, setErr] = useState('')

   // UserAuth
   const {finishReg, userAuth} = UserAuth()

   const registerContent = useRef()

   useEffect(() => {
      gsap.to(
         registerContent.current, {
            duration: .8,
            opacity: 1,
            y: 0,
            ease: Back.easeOut.config(2)
         }
      )
   }, [])

   useEffect(() => {
      const result = USER_REGEX.test(username)
      setValidUsername(result)
   },[username])

   useEffect(() => {
      setErr('')
   },[username])

   // Resize User Avatar
   const resizeImg = (e) => {
      const imgFile = e.target.files[0]
      if (!imgFile.name.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG|gif)$/)) {
         setErr('Please select valid image JPG,JPEG,PNG, GIF');
            return false;
      }
      else {
         let reader = new FileReader(); 
         
         reader.onload = (e) => {
         const img = new Image();
         img.onload = () => {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            var MAX_WIDTH = 350;
            var MAX_HEIGHT = 350;
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
            const file = new File([blob], `profile_${userAuth.uid}`, {
               type: 'image/jpeg',
               lastModified: Date.now()
            });
            setAccImg(file)
            }, 'image/jpeg', 1);
         };

         img.onerror = () => {
               console.log('Invalid image content.');
            return false;
         };
         //debugger
         img.src = e.target.result;
         };
         reader.readAsDataURL(imgFile);
      }
   }

   const handleSignUp = async (e) => {
      e.preventDefault()
      try {
         const res = await finishReg(username, accImg)

         if (res.status) {
            window.location.assign('http://localhost:3000')
         }
         else {
            setErr(res.message)
            return
         }

      } catch(err) {
         console.log(err)
         setErr(err.message)
         return
      }
   }

   return (
      <div className="updateAccount-wrapper">
         <div className='updateAccount-container' ref={registerContent}>
            <div className="head">
               <h2 className='acc-title'>Account Info</h2>
            </div>

            {err && <p className='err-msg'>{err}</p>}
            <form className='acc-form' onSubmit={handleSignUp} autoComplete='off'>
               <div className="accImg-wrapper">
                  <div className="accImg-container">
                     <img className='acc-img' src={!accImg ? defaultUser : URL.createObjectURL(accImg)} alt="default user icon" />
                     <label className='accImg-input' htmlFor="accImg-input">
                        <BsCameraFill className='img-input'/>
                     </label>
                  </div>

                  <input
                     onChange={resizeImg}
                     style={{display: 'none'}}
                     id ='accImg-input'
                     type="file"
                     required
                  />
               </div>
               
               <label className='acc-label' htmlFor="username">Username:</label>
               <input 
                  onChange={(e) => setUsername(e.target.value)}
                  aria-invalid = {validUsername ? 'false' : 'true'}
                  onFocus={() => setUsernameFocus(true)}
                  onBlur={() => setUsernameFocus(false)}
                  aria-describedby = 'userdnote'
                  className='acc-input'
                  value={username}
                  type="text"
                  required
               />
               <p id='usernote' className={usernameFocus && username && !validUsername ? 'inst' : 'offscreen'}>
                  4 to 24 characters. <br/>
                  Must begin with a letter and have no spaces.<br/>
                  Letters, numbers, underscores, and hyphens allowed.
               </p>

               <button 
                  className='acc-btn'
                  disabled={!username || !accImg  ? true : false}
               >
                  Confirm
               </button>
            </form>
         </div>
      </div>
   )
}

export default RegsiterTwo