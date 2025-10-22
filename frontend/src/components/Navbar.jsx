import React , {useState , useContext ,useEffect } from 'react'
import AppContext from '../context/AppContext'
import {toast} from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


const Navbar = () => {
    const navigate = useNavigate()
    const [username , setUsername] = useState("")
    const {user,backendUrl,setIsLoggedIn,getUserData} = useContext(AppContext)

    const logout = async ()=>{
        try{
            axios.defaults.withCredentials=true
            const {data} = await axios.post(backendUrl+"/api/auth/logout")
            data.success && setIsLoggedIn(false)
            navigate("/")
        }catch(error){
            toast.error(error.message)
        }
    }

    const getUsername = async ()=>{
        try{
            const data = await getUserData()
            if (data && data.UserData) {
                setUsername(data.UserData.username)
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        getUsername()
    },[])

  return (
    <div className='flex items-center justify-between px-4 py-1'>
        <div>
            <h3 className='text-xl font-serif italic p-1 rounded px-2'>
                {user ? user.username : username}
            </h3>
        </div>
        <div >
            <button onClick={logout} className='bg-black text-white p-1 px-2 rounded hover:bg-red-500 cursor-pointer'>Logout</button>
        </div>
    </div>
  )
}

export default Navbar