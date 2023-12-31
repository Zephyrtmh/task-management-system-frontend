//ACCEPT/REJECT TASK, ADD TASK TO NEW PLAN, ADD NOTES

import React, { useEffect, useContext, useReducer, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import Axios from "axios"

//context
import StateContext from "../../StateContext"
import DispatchContext from "../../DispatchContext"

//import onload
import IsLoadingComponent from "../global/isLoadingComponent"

function PmEditTask() {
  //Use location to get Task ID, acronym, todo/open
  const { state } = useLocation()

  //navigate
  const navigate = useNavigate()

  //context
  const srcState = useContext(StateContext)
  const srcDispatch = useContext(DispatchContext)

  //Variables to change
  const [taskNotes, setTaskNotes] = useState()
  const [taskPlan, setTaskPlan] = useState()
  const [taskOwner, setTaskOwner] = useState()
  const [thisTask, setThisTask] = useState([])
  const [plans, setPlans] = useState([])
  const [historyNotes, setHistoryNotes] = useState([])
  const [acronym, setAcronym] = useState()
  const [newState, setNewState] = useState()

  //on load
  const [onLoad, setOnLoad] = useState(true)

  //handle back
  async function handleBack() {
    return navigate("/plan-management", { state: { acronym: acronym } })
  }

  //onSubmit
  async function onSubmit(e) {
    e.preventDefault()
    try {
      // let permit_g
      // //Check if task has exisiting plan else no one can edit
      // if (thisTask.Task_app_Acronym == null) {
      //   srcDispatch({ type: "flashMessage", value: "Unauthorized" })
      //   return
      // } else {
      //   permit_g = await Axios.post("http://localhost:8080/getApplication", { acronym: thisTask.Task_app_Acronym }, { withCredentials: true })
      // }
      try{
          const res = await Axios.post("http://localhost:8080/authtoken/return/userinfo", {},{withCredentials:true});
          if(res.data.success){
              if(res.data.status == 0) logoutFunc();
              srcDispatch({type:"login", value:res.data, admin:res.data.groups.includes("admin"), isPL:res.data.groups.includes("project leader")});
              if(!res.data.groups.includes(state.pName)){
                srcDispatch({type:"flashMessage", value:"Unauthorized"})
                return navigate(-1)
              }
          }
          else{
              navigate("/")
          }
      }
      catch(err){
          if(err.response.data.message === "invalid token"){
              srcDispatch({type:"flashMessage", value:"Please login first.."})
              navigate("/login")
          }
          navigate("/login")
      }

      //Construct the requestBody
      const requestBody = {};
      requestBody.taskId = thisTask.taskId;
      requestBody.un = srcState.username;
      if(taskNotes != undefined) requestBody.userNotes = taskNotes;
      requestBody.taskState = newState;
      if(taskPlan != "") requestBody.taskPlan = taskPlan;
      console.log(requestBody);
      const result = await Axios.post(
        "http://localhost:8080/PMEditTask",
         requestBody ,
        { withCredentials: true }
      )
      console.log(result);

      if (result.data.success) {
        srcDispatch({ type: "flashMessage", value: "Task updated" })
        return navigate("/plan-management", {state:{acronym:acronym}})
      }else{
        if(!result.data.success && result.data.message){
          srcDispatch({ type: "flashMessage", value: result.data.message })
        }else{
          srcDispatch({ type: "flashMessage", value: "update task error" })
        }
      }
    } catch (err) {
      srcDispatch({ type: "flashMessage", value: "update task error" })
    }
  }

  //Regex handle Running number to make sure no negative symbol
  async function taskNotesRegex(e) {
    e.preventDefault()
    var rValue = e.target.value.replace(/\|/g, "")
    document.getElementById("taskNotes").value = rValue
    setTaskNotes(rValue)
  }

  //get task from taskID useLocaiton
  async function getTask() {
    //axios task id
    try {
      const taskResult = await Axios.post("http://localhost:8080/all-task/taskId", { taskId: state.taskId }, { withCredentials: true })
      if (taskResult.data.success) {
        setThisTask(taskResult.data.task)

        //Re-arranging the history notes
        var tempHistory = String(taskResult.data.task.taskNotes).split("||")
        tempHistory = tempHistory.reverse()

        for (const k in tempHistory) {
          setHistoryNotes(setHistoryNotes => [...setHistoryNotes, String(tempHistory[k]).split("|")])
        }
        setTaskPlan(taskResult.data.task.taskPlan)

        //Set acronym, task id, newState
        setAcronym(state.acronym)
        if (state.newState === "edit") {
          setNewState(taskResult.data.task.taskState)
        } else if (state.newState === "release") {
          setNewState("todo")
        }

        //Set onload to false
        setOnLoad(false)
      }
    } catch (err) {
      console.log(err)
      srcDispatch({ type: "flashMessage", value: "Error in find task" })
    }
  }

  //Get plans by acronym
  async function getPlans() {
    try {
      const planResult = await Axios.post("http://localhost:8080/all-plan/app", { appAcronym: state.acronym }, { withCredentials: true })
      console.log(planResult.data)
      if (planResult.data.success) {
        setPlans(planResult.data.plans)
      }
    } catch (e) {
      console.log(e)
      //srcDispatch({type:"flashMessage", value:"Error in getting groups"});
    }
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

  //useEffect
  useEffect(() => {
    const getUserInfo = async () => {
      //Check state acronym, task id, newState
      if (state == null) {
        navigate(-1)
      }
      if (state.acronym == null) {
        navigate(-1)
      }
      if (state.taskId == null) {
        navigate(-1)
      }
      if (state.newState == null) {
        navigate(-1)
      }
      if (state.newState === "release" || state.newState === "edit") {
      } else {
        navigate(-1)
      }

      try{
        const res = await Axios.post("http://localhost:8080/authtoken/return/userinfo", {},{withCredentials:true});
        if(res.data.success){
            if(res.data.status == 0) logoutFunc();
            srcDispatch({type:"login", value:res.data, admin:res.data.groups.includes("admin"), isPL:res.data.groups.includes("project leader")});
            if(!res.data.groups.includes(state.pName)){
              srcDispatch({type:"flashMessage", value:"Unauthorized"})
              return navigate(-1)
            }
        }
        else{
            navigate("/")
        }
    }
    catch(err){
        if(err.response.data.message === "invalid token"){
            srcDispatch({type:"flashMessage", value:"Please login first.."})
            navigate("/login")
        }
        navigate("/login")
    }
    }
    getUserInfo()
    getTask()
  }, [])

  useEffect(() => {
    if (srcState != "nil") {
      getPlans()
    }
  }, [srcState.username])

  if (onLoad) {
    return (
      <>
        <IsLoadingComponent />
      </>
    )
  } else {
    return (
      <>
        <div className="container mx-auto mt-5">
          <div className="mb-4">
            <h1 className="text-xl font-bold">
              <span className="capitalize ">{newState != "open" ? "Release" : "Edit"}</span> task
            </h1>
          </div>

          <form onSubmit={onSubmit}>
            <div className="mb-6">
              <label for="taskName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Task name
              </label>
              <input
                type="text"
                value={thisTask.taskName}
                id="taskName"
                className="bg-stone-400 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Task name..."
                readOnly
                required
              />
            </div>
            <div className="mb-6">
              <label for="desc" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Task description
              </label>
              <textarea
                value={thisTask.taskDescription}
                id="desc"
                rows="4"
                className="block p-2.5 w-full text-sm text-white bg-stone-400 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Task description...."
                readOnly
              ></textarea>
            </div>
            <div className="mb-6">
              <label for="taskNotes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Task notes
              </label>
              <textarea
                onInput={taskNotesRegex}
                id="taskNotes"
                rows="5"
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Task notes...."
              ></textarea>
            </div>

            <div className="mb-6 grid lg:grid-cols-2 gap-4 grid-cols-1">
              <div>
                <label for="permitOpen" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Plan
                </label>
                <select
                  onChange={e => setTaskPlan(e.target.value)}
                  id="permitOpen"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option value=""></option>
                  {plans.map((plan, index) => {
                    if (taskPlan === plan.plan_MVP_name) {
                      return (
                        <option value={plan.plan_MVP_name} selected>
                          {plan.plan_MVP_name}
                        </option>
                      )
                    } else {
                      return <option value={plan.plan_MVP_name}>{plan.plan_MVP_name}</option>
                    }
                  })}
                </select>
              </div>
              <div>
                <p>
                  <span className="text-md font-semibold">Application acronym: </span>
                  {thisTask.taskAppAcronym}
                </p>
                <p>
                  <span className="text-md font-semibold">Create date: </span>
                  {new Date().toISOString().substr(0, 10)}
                </p>
                <p>
                  <span className="text-md font-semibold">Task creator </span>
                  {thisTask.taskCreator}
                </p>
                <p>
                  <span className="text-md font-semibold">Task owner: </span>
                  {thisTask.taskOwner}
                </p>
                <p>
                  <span className="text-md font-semibold">Current task state: </span>
                  {thisTask.taskState}
                </p>
              </div>
            </div>

            <div>
              <h1 className="text-xl font-semibold">Notes history</h1>
            </div>
            <div className="mb-4 md:flex md:flex-wrap md:justify-between">
              <div className="container w-full px-4 sm:px-8">
                <div className="flex flex-col">
                  <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 inline-block w-full sm:px-6 lg:px-8">
                      <div className="table-wrp block max-h-96">
                        <table className="w-full">
                          <thead className="bg-white border-b sticky top-0">
                            <tr>
                              <th scope="col" className="text-md font-medium text-gray-900 pr-2 text-left">
                                User
                              </th>
                              <th scope="col" className="text-md font-medium text-gray-900 pr-2 text-left">
                                Task state
                              </th>
                              <th scope="col" className="text-md font-medium text-gray-900 text-left pr-2">
                                Date & Time
                              </th>
                              <th scope="col" className="text-md font-medium text-gray-900 text-left pr-2">
                                Notes
                              </th>
                            </tr>
                          </thead>
                          <tbody className="h-96 overflow-y-auto">
                            {historyNotes.map((note, index) => (
                              <tr key={index} className="p-2">
                                <td className="bg-stone-100">{note[0]}</td>
                                <td>{note[1]}</td>
                                <td className="bg-stone-100">
                                  {new Date(note[2]).toLocaleString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit"
                                  })}
                                </td>
                                <td>{note[3] ? note[3] : "NULL"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link
              type="button"
              to={"/plan-management"}
              className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-blue-800 mr-5"
              state={{ acronym: acronym }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <span className="capitalize">{newState != "open" ? "Release" : "Edit"}</span>
            </button>
          </form>
        </div>
        <br />
      </>
    )
  }
}

export default PmEditTask
