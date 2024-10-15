import axios from "axios";
import { baseUrl } from "./jsonData";

export const handleLogout = async()=>{
    const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };
    try{
        const res = await axios.post(`${baseUrl}/v1/logout`, [],{headers});
        const response = res;
       clearSessionStorage();
        window.location.href = "/login";

    }catch{
//for edge case where app is restared while in session, so log out still happens
        clearSessionStorage();
        window.location.href = "/login";


    }
}

const clearSessionStorage = () => {
    ["Authorization", "userName", "schoolName", "email", "role"].forEach(
      (key) => {
        sessionStorage.removeItem(key);
      }
    );
  };