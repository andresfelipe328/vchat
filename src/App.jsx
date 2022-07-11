// React
import {useState} from 'react';
import {Routes, Route} from 'react-router-dom'

import { UserAuth } from './context/AuthContext';

// Components
import Footer from './components/static/Footer'
import Help from './components/static/Help';
import SideBar from './components/static/SideBar';
import ProtectedMain from './components/protectedPages/ProtectedMain';
import UnprotectedMain from './components/unprotectedPages/UnprotectedMain';
import CreateRoomPopup from './components/protectedPages/room/CreateRoomPopup';
import RegsiterTwo from './components/unprotectedPages/RegsiterTwo';

function App() {
  const {userAuth} = UserAuth()
  const [currRoom, setCurrRoom] = useState ({})
  const [currDmRoom, setCurrDmRoom] = useState({})
  const [createRoomPopup, setCreateRoomPopup] = useState(false)

  return (
    <section className="app">
      <div className="app-wrapper">
        <SideBar
          createRoomPopup={createRoomPopup}
          setCreateRoomPopup={setCreateRoomPopup}
          currRoom={currRoom}
          setCurrRoom={setCurrRoom}
        />

        <Routes>
          {!userAuth && <Route path='*' element={<UnprotectedMain/>}/>}
          
          {(!userAuth?.displayName || !userAuth?.photoURL)
            ?
              <Route path='/register/part-two' element={<RegsiterTwo/>}/>
            :
              <Route path='*' element={<ProtectedMain
                currRoom={currRoom}
                setCurrRoom={setCurrRoom}
                currDmRoom={currDmRoom}
                setCurrDmRoom={setCurrDmRoom}
                />}
              />
          }
        
          <Route path='help' element={<Help/>}/>
        </Routes>
        
        {createRoomPopup &&
          <CreateRoomPopup
          createRoomPopup={createRoomPopup}
          setCreateRoomPopup={setCreateRoomPopup}
          />
        }
        
      </div>
      
      <Footer/>
    </section>
  );
}

export default App;
