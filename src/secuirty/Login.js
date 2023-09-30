import axios from 'axios';
import React, { useState } from 'react';
import { redirect, useNavigate } from 'react-router-dom';
import { baseUrl } from '../utils/jsonData';

function Login() {

  
    const navigate = useNavigate();

    const routeChange =()=>{
        let path = "/dashboard";
        navigate(path)
    }


  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform login logic here using formData
    console.log('Login Data:', formData);
    // Reset form fields after submission if needed
    setFormData({
        username: '',
      password: '',
    });
/////////////////
axios.post(`${baseUrl}/auth`,formData

)
.then(function (res){
    console.log(res)
    const token = res.data.response
    const userName = res.data.userModel.firstName
    const schoolName = res.data.userModel.schoolName
    const email = res.data.userModel.username
    console.log(token)
    sessionStorage.setItem("Authorization",token)
    sessionStorage.setItem("userName",userName)
    sessionStorage.setItem("schoolName",schoolName)
    sessionStorage.setItem("email",email)

    routeChange();
   

})
.catch(function (error){

});


/////////////////

 
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>User Name</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required

          />
        </div>
     
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required

          />
        </div>
        <button type="submit">Login</button>
        <div>
        <a href='/register'><span>New User? Register Here </span></a>
        </div>
      </form>
    </div>
  );
}

export default Login;