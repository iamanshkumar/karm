import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './Pages/Login'
import Boards from './Pages/Boards'
import BoardDetails from './Pages/BoardDetails'
import { AppContextProvider } from './context/AppContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <AppContextProvider>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/boards" element={<Boards />}></Route>
        <Route path="/boards/:boardId" element={<BoardDetails />}></Route>
      </Routes>
    </AppContextProvider>
  )
}

export default App