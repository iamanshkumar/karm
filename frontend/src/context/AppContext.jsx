import React , {useState , useEffect} from 'react'
import axios from "axios"
import {toast} from "react-toastify"
import { createContext , useContext } from 'react'

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.BACKEND_URL || "http://localhost:3000"

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user,setUser] = useState(null)
    const [loading , setLoading]  = useState(true)

    axios.defaults.withCredentials = true

    const getAuthState = async()=>{
        try{
            const {data} = await axios.get(backendUrl + "/api/auth/is-auth")
            if(data.success){
                setIsLoggedIn(true)
                await getUserData()
            }
        }catch(error){
            toast.error(error.message)
        }finally{
            setLoading(false)
        }
    }

    const getUserData = async()=>{
        try{
            const {data} = await axios.get(backendUrl + "/api/user/data")
            data.success ? setUser(data.UserData) : toast.error(data.message)
        }catch(error){
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
        loading
    }
  return (
    <AppContext.Provider value = {value}>
        {props.children}
    </AppContext.Provider>
  )
}

export default AppContext