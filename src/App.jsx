import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import TrackPage from './pages/TrackPage'
import TrackManagmentPage from './pages/TrackManagmentPage'
import BranchLogin from './pages/Login'
import Login from './pages/Login'

function App() {
  return (
    <div >
        <Routes>
          <Route path="/" element={<Login />} />
        <Route path="/siparis-takip" element={<TrackPage />} />
        <Route path="/siparis-takip-yonetimi" element={<TrackManagmentPage />} />
        </Routes>
        <ToastContainer/>
    </div>
  )
}

export default App