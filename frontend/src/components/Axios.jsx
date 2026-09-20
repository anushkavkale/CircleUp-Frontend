import axios from "axios";

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }
  const baseUrl = `${import.meta.env.VITE_API_URL || "https://circleup-backend-2.onrender.com"}/api/`

const AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout:5000,
    withCredentials:true,
    headers:({"Content-Type": "application/json"})
})
  AxiosInstance.interceptors.request.use((config) =>{
    const csrftoken = getCookie("csrftoken");
    if(csrftoken){
        config.headers["X-CSRFToken"] = csrftoken
    }
    return config
  });

  export default AxiosInstance;