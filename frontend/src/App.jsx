import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider"


import SignUp from './components/pages/SignUp';
import SignIn from './components/pages/SignIn';
import Home from './components/pages/Home';
import Profile from './components/pages/Profile';
import Notification from './components/pages/Notification';
import Messages from './components/pages/Messages';
import Friends from './components/pages/Friends';
import Groups from './components/pages/Groups';
import GroupDetail from './components/pages/GroupDetail';
import Reels from './components/pages/Reels';
import PasswordReset from './components/pages/PasswordReset';
import PasswordResetConfirm from './components/pages/PasswordResetConfirm';
import Security from './components/pages/Security';
import Stories from './components/pages/Stories';
import { Toaster } from "@/components/ui/sonner"


import { Private, Public } from './components/Routing';



function App() {

  return (
    
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <div className="app-shell text-zinc-100">
        <Toaster />

        <Router>
          <Routes>
              <Route element={<Public/>}>
                <Route path='/signup' element={<SignUp />} />
                <Route path='/signin' element={<SignIn />} />
                <Route path='/password-reset' element={<PasswordReset />} />
                <Route path='/password-reset/confirm' element={<PasswordResetConfirm />} />
              </Route>


              <Route element={<Private/>}>
                <Route path='/feed' element={<Home />} />
                <Route path='/profile/:username' element={<Profile />} />
                <Route path='/notification' element={<Notification />} />
                <Route path='/messages' element={<Messages />} />
                <Route path='/friends' element={<Friends />} />
                <Route path='/groups' element={<Groups />} />
                <Route path='/groups/:id' element={<GroupDetail />} />
                <Route path='/reels' element={<Reels />} />
                <Route path='/stories' element={<Stories />} />
                <Route path='/security' element={<Security />} />
              </Route>

              <Route path='*' element={<Navigate to="/feed" replace /> } />


          </Routes>
        </Router>
      </div>
    </ThemeProvider>

  )
}

export default App
