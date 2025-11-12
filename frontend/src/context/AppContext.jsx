import React , {useState , useEffect} from 'react'
import axios from "axios"
import {toast} from "react-toastify"
import { createContext , useContext } from 'react'

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user,setUser] = useState(null)
    const [loading , setLoading]  = useState(true)

    // Set default axios configuration
    axios.defaults.withCredentials = true

    // Function to set token in localStorage as fallback
    const setAuthToken = (token) => {
        if (token) {
            localStorage.setItem('authToken', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('authToken');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    // Function to get token from localStorage
    const getStoredToken = () => {
        return localStorage.getItem('authToken');
    };

    const getAuthState = async()=>{
        try{
            // Try to get token from localStorage as fallback
            const storedToken = getStoredToken();
            if (storedToken) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }

            console.log('Checking auth state with URL:', backendUrl + "/api/auth/is-auth")
            const {data} = await axios.get(backendUrl + "/api/auth/is-auth")
            if(data.success){
                setIsLoggedIn(true)
                await getUserData()
            }
        }catch(error){
            console.error('Auth check failed:', error.response || error.message)
            // If cookie-based auth fails, try token-based auth
            const storedToken = getStoredToken();
            if (storedToken) {
                try {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                    const {data} = await axios.get(backendUrl + "/api/auth/is-auth")
                    if(data.success){
                        setIsLoggedIn(true)
                        await getUserData()
                        return;
                    }
                } catch (tokenError) {
                    console.error('Token-based auth also failed:', tokenError.message)
                }
            }
            toast.error(error.message)
        }finally{
            setLoading(false)
        }
    }

    const getUserData = async()=>{
        try{
            console.log('Fetching user data with URL:', backendUrl + "/api/user/data")
            const {data} = await axios.get(backendUrl + "/api/user/data")
            data.success ? setUser(data.UserData) : toast.error(data.message)
        }catch(error){
            console.error('User data fetch failed:', error.response || error.message)
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        getAuthState()
    },[])

    const value = {
        backendUrl , 
        isLoggedIn , setIsLoggedIn,
        user , setUser ,
        getUserData ,
        setAuthToken,
        getStoredToken,
        loading
    }
  return (
    <AppContext.Provider value = {value}>
        {props.children}
    </AppContext.Provider>
  )
}

export default AppContext