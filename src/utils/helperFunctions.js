import axios from "axios";
import { baseUrl } from "./jsonData";

export const handleLogout = async()=>{
    const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };
    try{
        const res = await axios.post(`${baseUrl}/v1/logout`, [],{headers});
        const response = res;
        console.log(response)
        sessionStorage.removeItem("Authorization");
        sessionStorage.removeItem("userName");
        sessionStorage.removeItem("schoolName");
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("role");
        window.location.href = "/login";

    }catch{


    }
}