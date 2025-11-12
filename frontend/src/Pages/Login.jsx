import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [state, setState] = useState("Sign Up");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, getUserData, setAuthToken } = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      axios.defaults.withCredentials = true;

      let response;
      if (state === "Sign Up") {
        response = await axios.post(`${backendUrl}/api/auth/signup`, {
          username,
          email,
          password,
        });
      } else {
        response = await axios.post(`${backendUrl}/api/auth/login`, {
          email,
          password,
        });
      }

      const { data } = response;

      if (data.success) {
        // Extract token from response if available
        if (data.token) {
          setAuthToken(data.token);
        }
        setIsLoggedIn(true);
        getUserData();
        navigate("/boards");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50 p-6">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/60 shadow-xl rounded-2xl p-8 border border-white/30 transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          {state === "Sign Up" ? "Create your account" : "Welcome back"}
        </h2>

        <form onSubmit={onSubmitHandler} className="space-y-4">
          {state === "Sign Up" && (
            <input
              type="text"
              placeholder="Username"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            {state}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-5">
          {state === "Sign Up" ? (
            <>
              Already have an account?{" "}
              <span
                className="text-indigo-600 font-medium hover:underline cursor-pointer"
                onClick={() => setState("Login")}
              >
                Login here
              </span>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <span
                className="text-indigo-600 font-medium hover:underline cursor-pointer"
                onClick={() => setState("Sign Up")}
              >
                Sign up here
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;