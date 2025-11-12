import React, { useState, useEffect, createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default axios config
  axios.defaults.withCredentials = true;

  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem("authToken", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("authToken");
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  const getStoredToken = () => localStorage.getItem("authToken");

  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      data.success ? setUser(data.UserData) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAuthState = async () => {
    try {
      const storedToken = getStoredToken();
      if (storedToken)
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
      if (data.success) {
        setIsLoggedIn(true);
        await getUserData();
      }
    } catch (error) {
      console.error("Auth check failed:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    user,
    setUser,
    getUserData,
    setAuthToken,
    getStoredToken,
    loading,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};

export default AppContext;
