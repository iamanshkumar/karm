import React , {useState , useContext ,useEffect } from 'react'
import AppContext from '../context/AppContext'
import {toast} from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


const Navbar = ({ onCreateBoard }) => {
    const navigate = useNavigate()
    const [username , setUsername] = useState("")
    const [dropdownOpen , setDropdownopen] = useState(false)
    const {user,backendUrl,setIsLoggedIn,getUserData} = useContext(AppContext)

    const logout = async ()=>{
        try{
            const response = await axios.post(backendUrl+"/api/auth/logout")
            if (response.data.success) {
                setIsLoggedIn(false)
                navigate("/")
            } else {
                toast.error(response.data.message || "Logout failed")
            }
        }catch(error){
            toast.error(error.response?.data?.message || error.message || "Logout failed")
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

    const displayName = user ? user.username : username
    const initial = displayName ? displayName[0].toUpperCase() : 'U'

  return (
    <nav className='sticky top-0 z-40 backdrop-blur-sm bg-white/90 border-b border-gray-200/70'>
        <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
            <div className='flex items-center gap-3'>
                <h1 className='text-xl font-semibold tracking-tight text-gray-900'>Karm</h1>
            </div>

            

            <div className='flex items-center gap-4'>
                {onCreateBoard && (
            <button
              onClick={onCreateBoard}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-150"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Board
            </button>
          )}
                
                <div className='relative'>
                    <button onClick={()=>{setDropdownopen(!dropdownOpen)}}
                    onBlur={(e)=>{setTimeout(()=>{if(!e.currentTarget.contains(document.activeElement)){{
                        setDropdownopen(false)
                    }}},50)}}
                    className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-150'
                    >
                        <div className='w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium'>
                            {initial}    
                        </div>

                        <span className='hidden md:block text-sm font-medium text-gray-700'>
                            {displayName}
                        </span>

                        <svg className={`w-4 h-4 text-gray-500 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                        >
                            <path strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'></path>
                        </svg>
                </button>

                {dropdownOpen && (
                    <div className='absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden animate-scale-in'>
                        <button onClick={logout}
                        className='w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 flex items-center gap-2'
                        >
                            <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>Logout
                        </button>

                    </div>
                )}
                </div>

                
            </div>
        </div>
    </nav>
  )
}

export default Navbar