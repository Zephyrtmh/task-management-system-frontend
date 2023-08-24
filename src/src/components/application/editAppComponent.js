import React, { useEffect, useContext, useReducer, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import Axios from "axios"

//context
import StateContext from "../../StateContext"
import DispatchContext from "../../DispatchContext"
import IsLoadingComponent from "../global/isLoadingComponent"

function EditApp() {
  //navigate
  const navigate = useNavigate()

  //useLocation to get the Link variable
  const { state } = useLocation()

  //useState fields
  const [acronym, setAcronym] = useState("")
  const [description, setDescription] = useState("")
  const [rnumber, setRnumber] = useState(0)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [create, setCreate] = useState("")
  const [open, setOpen] = useState("")
  const [toDo, setTodo] = useState("")
  const [doing, setDoing] = useState("")
  const [done, setDone] = useState("")
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true);

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

  //HandleSubmit
  async function onSubmit(e) {
    e.preventDefault()
    console.log(acronym, description, rnumber, startDate, endDate, create, open, toDo, doing, done)
    try {
      const result = await Axios.post(
        "http://localhost:8080/updateApplication",
        { acronym, description, endDate, permitCreate: create, permitOpen: open, permitTodo: toDo, permitDoing: doing, permitDone: done, un: srcState.username, gn: "project leader" },
        { withCredentials: true }
      )
      console.log(result)
      if (result.data.success) {
        srcDispatch({ type: "flashMessage", value: "application updated" })
        return navigate("/application-management")
      }
      else if(result.data.message==="end date cannot be earlier than start date") {
        return navigate("/application-management")
      }
      else if(result.data.message==="user inactive") {
        logoutFunc()
        return navigate("/login")
      }
      else {
        srcDispatch({ type: "flashMessage", value: result.data.message!=null?result.data.message:"Failed to update application" })
        return navigate("/application-management")
      }
    } catch (err) {
      console.log(err.response.data.message)
      // if (err.response.data.message === "End date invalid") {
      //   srcDispatch({ type: "flashMessage", value: "Invalid end date" })
      // } else if (err.response.data.message === "Input require fields") {
      //   srcDispatch({ type: "flashMessage", value: "Input fields required" })
      // } else if (err.response.data.message === "invalid start date") {
      //   srcDispatch({ type: "flashMessage", value: "Invalid start date" })
      // } else if (err.response.data.message === "invalid group open") {
      //   srcDispatch({ type: "flashMessage", value: "Invalid permit open group" })
      // } else if (err.response.data.message === "invalid group toDo") {
      //   srcDispatch({ type: "flashMessage", value: "Invalid permit toDo group" })
      // } else if (err.response.data.message === "invalid group doing") {
      //   srcDispatch({ type: "flashMessage", value: "Invalid permit doing group" })
      // } else if (err.response.data.message === "invalid group done") {
      //   srcDispatch({ type: "flashMessage", value: "Invalid permit done group" })
      // } else if (err.response.data.message.code === "ER_DUP_ENTRY") {
      //   srcDispatch({ type: "flashMessage", value: "Application acronym exist" })
      // } else {
      //   srcDispatch({ type: "flashMessage", value: "Update application error" })
      // }
    }
  }

  //Get app
  async function getApp() {
    console.log(state.acronym);
    //Axios app
    const appResult = await Axios.post("http://localhost:8080/getApplication", { appAcronym: state.acronym }, { withCredentials: true })
    
    //Set app
    if (appResult.data.success) {
      setAcronym(appResult.data.application.app_Acronym)
      setDescription(appResult.data.application.app_Description)
      setRnumber(appResult.data.application.app_Rnumber)
      setStartDate(appResult.data.application.app_startDate)
      setEndDate(appResult.data.application.app_endDate)
      // setCreate(appResult.data.application.app_permit_Create)
      // setOpen(appResult.data.application.app_permit_Open)
      // setTodo(appResult.data.application.app_permit_toDo)
      // setDoing(appResult.data.application.app_permit_Doing)
      // setDone(appResult.data.application.app_permit_Done)

      //Set list
      // if (appResult.data.application.app_permit_Create) document.getElementById("permitCreate").value = appResult.data.application.app_permit_Create
      // if (appResult.data.application.app_permit_Open) document.getElementById("permitOpen").value = appResult.data.application.app_permit_Open
      // if (appResult.data.application.app_permit_toDoList) document.getElementById("permitTodo").value = appResult.data.application.app_permit_toDoList
      // if (appResult.data.application.app_permit_Doing) document.getElementById("permitDoing").value = appResult.data.application.app_permit_Doing
      // if (appResult.data.application.app_permit_Done) document.getElementById("permitDone").value = appResult.data.application.app_permit_Done
      if (appResult.data.application.app_permit_Create) setCreate(appResult.data.application.app_permit_Create)
      if (appResult.data.application.app_permit_Open) setOpen(appResult.data.application.app_permit_Open)
      if (appResult.data.application.app_permit_toDoList) setTodo(appResult.data.application.app_permit_toDoList)
      if (appResult.data.application.app_permit_Doing) setDoing(appResult.data.application.app_permit_Doing)
      if (appResult.data.application.app_permit_Done) setDone(appResult.data.application.app_permit_Done)
    }
    setIsLoading(false);
  }

  //Get groups
  async function getGroups(username) {
    try {
      const groupResult = await Axios.post("http://localhost:8080/getAllGroups", { un: username, gn: "project leader" }, { withCredentials: true })
      if (groupResult.data.success) {
        console.log(groupResult.data.groups)
        setGroups(groupResult.data.groups)
      }
    } catch (e) {
      console.log(e)
      //srcDispatch({type:"flashMessage", value:"Error in getting groups"});
    }
  }

  async function authorization(){
    if(srcState.isPL == false || srcState.logIn == false){
      srcDispatch({type:"flashMessage", value:"Unauthorized"});
      navigate("/")
    }
  }

  //context
  const srcState = useContext(StateContext)
  const srcDispatch = useContext(DispatchContext)

  //useEffect
  useEffect(() => {
    try {
      const getUserInfo = async () => {
        const res = await Axios.post("http://localhost:8080/authtoken/return/userinfo", {}, { withCredentials: true })
        if (res.data.success) {
          if (res.data.status == 0) navigate("/login")
          srcDispatch({ type: "login", value: res.data, admin: res.data.groups.includes("admin") })
          if (!(await res.data.groups.includes("project leader"))) {
            srcDispatch({ type: "flashMessage", value: "Not authorized" })
            navigate("/")
          }

          getGroups(res.data.username)
          getApp()
          
        } else {
          navigate("/")
        }
      }
      getUserInfo()
    } catch (err) {
      console.log(err)
    }
  }, [])

  // useEffect(() => {
  //   if (srcState.username != "nil") {
  //     getGroups()
  //   }
  // }, [srcState.username])

  // useEffect(() => {
  //   getApp()
  // }, [groups])

  useEffect(()=>{
    if(srcState.testLoginComplete) authorization();
  },[srcState.testLoginComplete])

  if(isLoading) {
    return <IsLoadingComponent />
  }
  return (
    <>
      <div className="container mx-auto mt-5">
        <div className="mb-4">
          <h1 className="text-xl font-bold">Edit application: {acronym}</h1>
        </div>
        <form onSubmit={onSubmit}>
          <div class="mb-6">
            <label for="acronym" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Application Acronym
            </label>
            <input
              type="text"
              onChange={e => setAcronym(e.target.value)}
              id="acronym"
              class="bg-stone-500 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Application Acronym"
              value={acronym}
              readOnly
              required
            />
          </div>

          <div class="mb-6">
            <label for="rnumber" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Running number
            </label>
            <input
              type="number"
              id="rnumber"
              onChange={e => setRnumber(e.target.value)}
              class="bg-stone-500 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Running number"
              value={rnumber}
              readOnly
              required
            />
          </div>

          <div class="mb-6 grid lg:grid-cols-2 gap-4 grid-cols-1">
            <div>
              <label for="startdate" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Start date
              </label>
              <input
                type="date"
                id="startdate"
                onChange={e => setStartDate(e.target.value)}
                class="bg-stone-500 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={String(startDate).substr(0, 10)}
                readOnly
                required
              />
            </div>
            <div>
              <label for="enddate" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                End date
              </label>
              <input
                type="date"
                id="enddate"
                onChange={e => setEndDate(e.target.value)}
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={String(endDate).substr(0, 10)}
                min={String(startDate).substr(0, 10)}
                required
              />
            </div>
            <div>
              <label for="permitCreate" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Permit create (group)
              </label>
              <select
                value={create}
                onChange={e => setCreate(e.target.value)}
                id="permitCreate"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value=""></option>
                {groups.map((g, index) => {
                  if (g != "admin") {
                    return (
                      <option key={index} value={g}>
                        {g}
                      </option>
                    )
                  }
                })}
              </select>
            </div>
            <div>
              <label for="permitOpen" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Permit open (group)
              </label>
              <select
                value={open}
                onChange={e => setOpen(e.target.value)}
                id="permitOpen"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value=""></option>
                {groups.map((g, index) => {
                  if (g != "admin") {
                    return (
                      <option key={index} value={g}>
                        {g}
                      </option>
                    )
                  }
                })}
              </select>
            </div>
            <div>
              <label for="permitTodo" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Permit todo (group)
              </label>
              <select
                value={toDo}
                id="permitTodo"
                onChange={e => setTodo(e.target.value)}
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value=""></option>
                {groups.map((g, index) => {
                  if (g != "admin") {
                    return (
                      <option key={index} value={g}>
                        {g}
                      </option>
                    )
                  }
                })}
              </select>
            </div>
            <div>
              <label for="permitDoing" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Permit doing (group)
              </label>
              <select
                value={doing}
                id="permitDoing"
                onChange={e => setDoing(e.target.value)}
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value=""></option>
                {groups.map((g, index) => {
                  if (g != "admin") {
                    return (
                      <option key={index} value={g}>
                        {g}
                      </option>
                    )
                  }
                })}
              </select>
            </div>
            <div>
              <label for="permitDone" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Permit done (group)
              </label>
              <select
                value={done}
                id="permitDone"
                onChange={e => setDone(e.target.value)}
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value=""></option>
                {groups.map((g, index) => {
                  if (g != "admin") {
                    return (
                      <option key={index} value={g}>
                        {g}
                      </option>
                    )
                  }
                })}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label for="desc" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Application description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              id="desc"
              rows="4"
              class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Application description...."
            ></textarea>
          </div>

          <Link
            type="button"
            to={"/application-management"}
            class="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-blue-800 mr-5"
          >
            Cancel
          </Link>
          <button
            type="submit"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Submit
          </button>
        </form>
      </div>
    </>
  )
}

export default EditApp
