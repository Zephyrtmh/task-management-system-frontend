import React, { useEffect, useContext, useReducer, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Axios from "axios"

//context
import StateContext from "../../StateContext"
import DispatchContext from "../../DispatchContext"

function MyProfile() {
  const [username, setUsername] = useState()
  const [email, setEmail] = useState()
  const [groups, setGroups] = useState([])
  const [newPassword, setPassword] = useState()
  const [verifyPassword, setOldPassword] = useState()

  //context
  const srcState = useContext(StateContext)
  const srcDispatch = useContext(DispatchContext)

  const navigate = useNavigate()

  async function getProfile() {
    try {
      const res = await Axios.post("http://localhost:8080/api/accounts/getUserProfile", { un: srcState.username }, { withCredentials: true })
      console.log(res)
      if (res.data.success) {
        setUsername(res.data.username)
        setEmail(res.data.email)
        if (res.data.groups.length != 0) {
          setGroups(res.data.groups)
        }
      }else{
        navigate("/")
      }
    } catch (e) {
      console.log(e)
      srcDispatch({ type: "flashMessage", value: "Error in getting profile" })
    }
  }

  async function updateProfile(e) {
    e.preventDefault()
    try {
      if (verifyPassword === undefined) {
        srcDispatch({ type: "flashMessage", value: "Please enter old password for verification" })
      } else {
        const res = await Axios.put("http://localhost:8080/api/accounts/updateAccount", { username, newPassword, verifyPassword, email }, { withCredentials: true })
        if (res.data.success) {
          srcDispatch({ type: "flashMessage", value: "profile updated" })
          return navigate("/")
        }
        else{
          srcDispatch({ type: "flashMessage", value: res.data.message})
        }
      }
    } catch (e) {
      if (e.response.data.message === "invalid password verification") {
        srcDispatch({ type: "flashMessage", value: "Password verification failed, please try again" })
      } else if (e.response.data.message === "invalid email") {
        srcDispatch({ type: "flashMessage", value: "Invalid email" })
      } else if (e.response.data.message === "invalid new password") {
        srcDispatch({ type: "flashMessage", value: "New password is invalid" })
      } else if (e.response.data.err.code === "ER_DUP_ENTRY") {
        srcDispatch({ type: "flashMessage", value: "Invalid email" })
      } else {
        srcDispatch({ type: "flashMessage", value: "Unauthorized" })
      }
    }
  }

  async function authorization() {
    if (srcState.logIn == false) {
      srcDispatch({ type: "flashMessage", value: "please login" })
      navigate("/login")
    }
    getProfile()
  }

  async function logoutFunc(){

    const logoutResult = await Axios.post("http://localhost:8080/logout", {}, {withCredentials: true});
    if(logoutResult.status === 200){
      //Clear localstorage
      localStorage.clear();

      //Set useState logIn to false
      srcDispatch({type:"logout"});

      localStorage.removeItem('authToken');

      return navigate('/login');
    }
    //Clear localstorage
    localStorage.clear();

    //Set useState logIn to false
    srcDispatch({type:"logout"});

    return navigate('/login');
  }

  useEffect(()=>{
      const getUserInfo = async()=>{
          
          try{
              const res = await Axios.post("http://localhost:8080/authtoken/return/userinfo", {},{withCredentials:true});
              console.log("test login done success");
              if(res.data.success){
                  //console.log("USERRR", res.data.status)
                  if(res.data.status == 0) logoutFunc();
                  //if(!res.data.groups.includes("admin")) navigate("/")
                  srcDispatch({type:"login", value:res.data, admin:res.data.groups.includes("admin"), isPL:res.data.groups.includes("project leader")});
                  srcDispatch({type:"testLogin"});
                  
              }
              else{
                  dispatch({type:"logout"})
              }
          }
          catch(e){
              console.log(e);
              console.log("test login done but got error");
              srcDispatch({type:"testLogin"});
          }
      }
      getUserInfo();
  }, [])

  useEffect(() => {
    // const getUserInfo = async () => {
    //   const res = await Axios.post("http://localhost:8080/authtoken/return/userinfo", {}, { withCredentials: true })
    //   if (res.data.success) {
    //     srcDispatch({ type: "login", value: res.data, admin: res.data.groups.includes("admin") })
    //     getProfile()
    //   } else {
    //     srcDispatch({ type: "flashMessage", value: "Please login.." })
    //     navigate("/login")
    //   }
    // }
    // getUserInfo()
  }, [])

  useEffect(() => {
    if (srcState.testLoginComplete) authorization()
  }, [srcState.testLoginComplete])

  return (
    <>
      <div className="grid grid-cols-3 grid-row-2">
        <div></div>
        <div className="my-5">My Profile</div>
        <div></div>
        <div></div>
        <div className="flex justify-center">
          <form onSubmit={updateProfile}>
            <label htmlFor="username" className="block">
              Username
            </label>
            <input className="rounded shadow border bg-stone-500 opacity-75" type="text" value={username} readOnly name="username" id="username" />

            <label htmlFor="email" className="block mt-5">
              Email
            </label>
            <input className="rounded shadow border" type="text" value={email} onChange={e => setEmail(e.target.value)} name="email" id="email" />

            <label htmlFor="password" className="block mt-5">
              New password
            </label>
            <input className="rounded shadow border" type="password" onChange={e => setPassword(e.target.value)} name="password" />

            <label htmlFor="oldPassword" className="block mt-5">
              Enter old password for verification
            </label>
            <input className="rounded shadow border" type="password" onChange={e => setOldPassword(e.target.value)} name="oldPassword" />

            <label htmlFor="oldPassword" className="block mt-5">
              Group/s:
            </label>
            <div class="mt-2">
              {groups.map((g, index) => (
                <span key={index} class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                  {g}
                </span>
              ))}
            </div>

            <br></br>
            <Link className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-full mr-5 mt-5" to="/">
              Cancel
            </Link>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mt-5">
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default MyProfile
