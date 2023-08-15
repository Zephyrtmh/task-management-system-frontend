import React, { useEffect, useReducer, useState, useContext } from "react";
import Axios from "axios";
import  { useNavigate } from 'react-router-dom'

//Import contexts
import DispatchContext from "../../DispatchContext";
import StateContext from "../../StateContext";

function LoginForm() {
  const [username, usernameFunc] = useState();
  const [password, passwordFunc] = useState();
  const navigate = useNavigate();

  //Contexts
  const srcDispatch = useContext(DispatchContext);
  const srcState = useContext(StateContext);

  async function handleSubmit(e) {
    e.preventDefault();
    try{
      await Axios.post('http://localhost:3000/login', {username, password}, {withCredentials: true}).then((data)=>{
        if(data.data.success){
          console.log(data.data)
          console.log(data.data.groups.includes("project leader"))
          srcDispatch({type:"login", value:data.data, admin:data.data.groups.includes("admin"), isPL:data.data.groups.includes("project leader")});
          return navigate("/");
        }
        else{
          srcDispatch({type:"flashMessage", value:"Login error, pelase try again"});
        }
      }).catch((err)=>{
        console.log(err.response.data.message);
       if(err.response.data.message === "Account suspended, please contact the admin"){
          srcDispatch({type:"flashMessage", value:"Account suspended, please contact the admin"});
        }
        else{
          srcDispatch({type:"flashMessage", value:"Invalid credentials, please try again.."});
        }
      })
    }
    catch(e){
      console.log(e)
      srcDispatch({type:"flashMessage", value:"Login error, pelase try again"});
    }
  }

  //useEffect()
  useEffect(()=>{
    const getUserInfo = async()=>{
      try{
          const res = await Axios.post("http://localhost:3000/authtoken/return/userinfo", {},{withCredentials:true});
          if(res.data.success){
              if(res.data.status == 0) logoutFunc();
              dispatch({type:"login", value:res.data, admin:res.data.groups.includes("admin")});
              
          }
      }
      catch(err){
          console.log(err);
      }
  }
  getUserInfo();
  },[])
  return (
    <>

      <div className="shadow-md rounded content-center">
        <form className="loginForm" onSubmit={handleSubmit} method="POST">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
             className="shadow appearance-none border rounded w-full"
            onChange={(e) => usernameFunc(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="shadow appearance-none border rounded w-full"
            onChange={(e) => passwordFunc(e.target.value)}
          />

          <button className="btn bg-blue-500 shadow w-full mt-5">Submit</button>
        </form>
      </div>
    </>
  )
};

export default LoginForm;
