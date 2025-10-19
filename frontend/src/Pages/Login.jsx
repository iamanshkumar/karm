import React from 'react'
import { useState , useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import AppContext from '../context/AppContext'
import axios from 'axios'
import {toast} from 'react-toastify'

const Login = () => {
  const [state, setState] = useState("Sign Up")
  const [username , setUsername] = useState("")
  const [email , setEmail] = useState("")
  const [password , setPassword] = useState("")

  const navigate = useNavigate()
  const {backendUrl , setIsLoggedIn , getUserData} = useContext(AppContext)

  const onSubmitHandler = async(e)=>{
    try{
      e.preventDefault()
      axios.defaults.withCredentials = true

      if(state === "Sign Up"){
        const {data} = await axios.post(backendUrl+"/api/auth/signup" , {username , email , password})
        if(data.success){
          setIsLoggedIn(true),
          getUserData()
          navigate("/boards")
        }else{
          toast.error(data.message)
        }
      }else{
        const {data} = await axios.post(backendUrl+"/api/auth/login" , {email , password})
        if(data.success){
          setIsLoggedIn(true)
          getUserData()
          navigate("/boards")
        }else{
          toast.error(data.message)
        }
      }
    }catch(error){
      toast.error(error.message)
    }
  }
  return (
    <div>
      
        <div className='flex justify-center items-center min-h-screen px-6 sm:px-0 flex-col'>
          <h2 className='text-4xl font-serif p-1.5 italic'>
            {state === "Sign Up" ? "Create your account" : "Login"}
          </h2>
          <form onSubmit={onSubmitHandler} className='flex flex-col gap-3.5'>
            {state === "Sign Up" && (
              <input type="text" placeholder='Username' className="border rounded border-neutral-300 p-2 w-xs"
                onChange={e=>setUsername(e.target.value)}
                value={username}
              />
            )}

            <input
            type="email"
            placeholder="Email"
            className="border rounded border-neutral-300 p-2 w-xs"
            onChange={e=> setEmail(e.target.value)}
            value = {email}
          /> 
          <input
            type="password"
            placeholder="Password"
            className="border rounded border-neutral-300 p-2 w-xs"
            onChange={e=> setPassword(e.target.value)}
            value = {password}
          />

          <button type ="submit" className='bg-black text-white rounded py-2'>{state}</button>
          </form>

          {state === "Sign Up" ? (
          <p className="text-center mt-2">
            Already have an account?{" "}
            <span
              className="cursor-pointer hover:underline"
              onClick={() => {
                setState("Login");
              }}
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="text-center mt-2">
            Don't have an account?{" "}
            <span
              className="cursor-pointer hover:underline"
              onClick={() => {
                setState("Sign Up");
              }}
            >
              Sign Up here
            </span>
          </p>
        )}
        </div>
      
    </div>
  )
}

export default Login