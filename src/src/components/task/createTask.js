import React, { useEffect, useContext, useReducer, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import Axios from "axios"

//context
import StateContext from "../../StateContext"
import DispatchContext from "../../DispatchContext"

function CreateTask() {
  //Use location to get app acronym
  const { state } = useLocation()

  //navigate
  const navigate = useNavigate()

  //useState fields
  const [acronym, setAcronym] = useState("")
  const [taskName, setTaskName] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskNotes, setTaskNotes] = useState("")
  const [taskPlan, setTaskPlan] = useState("")
  const [taskApp, setTaskApp] = useState("")
  const [gn, setGn] = useState("")
  //const [taskOwner, setTaskOwner] = useState();
  //const [taskCreator, setTaskCreator] = useState();
  const [plans, setPlans] = useState([])

  //useState for display only
  const [taskId, setTaskId] = useState("")
  const [createDate, setCreateDate] = useState("")

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
    //console.log(acronym, description, rnumber, startDate, endDate, open, toDo, doing, done);

    try {
      const result = await Axios.post(
        "http://localhost:8080/createTask",
        { taskName, taskDescription, taskNotes, taskPlan, taskAppAcronym: acronym, taskCreator: srcState.username, taskOwner: srcState.username, un: srcState.username, gn },
        { withCredentials: true }
      )

      if (result.data.success) {
        //clear all fields
        setTaskName("")
        setTaskDescription("")
        setTaskNotes("")
        setTaskPlan("")

        document.getElementById("taskName").value = ""
        document.getElementById("desc").value = ""
        document.getElementById("taskNotes").value = ""
        document.getElementById("plans").value = ""

        srcDispatch({ type: "flashMessage", value: "Task created" })
        return navigate("/create/task", { state: { acronym: acronym } })
      }
      else if(result.data.message == "user inactive") {
        logoutFunc()
        srcDispatch({ type: "flashMessage", value: "user inactive" })
        return navigate("/login")
      }
      else if(result.data.message == "User does not have permission") {
        srcDispatch({ type: "flashMessage", value: result.data.message })
        return navigate("/plan-management",{state: {acronym: acronym}})
      }
    } catch (err) {
      console.log(err.response.data)

      srcDispatch({ type: "flashMessage", value: "Create task error" })
    }
  }

  //check if app exist
  // async function checkApp() {
  //   if (!state.acronym) {
  //     navigate(-1)
  //   }

  //   //get app
  //   const appResult = await Axios.post("http://localhost:8080/getApplication", { appAcronym: state.acronym }, { withCredentials: true })
  //   //console.log(appResult);
  //   if (!appResult.data.success) {
  //     srcDispatch({ type: "flashMessage", value: "Invalid app acronym" })
  //     navigate(-1)
  //   }
  // }

  async function taskNotesRegex(e) {
    e.preventDefault()
    var rValue = e.target.value.replace(/\|/g, "")
    document.getElementById("taskNotes").value = rValue
    setTaskNotes(rValue)
  }

  //Get plans by acronym
  async function getPlans() {
    try {
      if (state.acronym) setAcronym(state.acronym)

      const planResult = await Axios.post("http://localhost:8080/all-plan/app", { appAcronym: state.acronym }, { withCredentials: true })
      const appResult = await Axios.post("http://localhost:8080/getApplication", { appAcronym: state.acronym }, {withCredentials: true})
      if (planResult.data.success) {
        console.log("planResult", planResult.data.plans)
        setPlans(planResult.data.plans)
      }
      if (appResult.data.success) {
        setGn(appResult.data.application.app_permit_Create)
      }
    } catch (e) {
      console.log(e)
      //srcDispatch({type:"flashMessage", value:"Error in getting groups"});
    }
  }

  //context
  const srcState = useContext(StateContext)
  const srcDispatch = useContext(DispatchContext)

  //useEffect
  useEffect(() => {
    const getUserInfo = async () => {
      //check state if null
      if (state === null) {
        return navigate("/")
      }
      if (!state.aCreate || state.aCreate == null) {
        return navigate("/")
      }
      if (state.acronym == null) {
        return navigate("/")
      }

      //Get user info
      const res = await Axios.post("http://localhost:8080/authtoken/return/userinfo", {}, { withCredentials: true })
      //console.log(res)
      if (res.data.success) {
        if (res.data.status == 0) navigate("/login")
        srcDispatch({ type: "login", value: res.data, admin: res.data.groups.includes("admin") })
        console.log("attempts to run this")
        const checkOpenPermit = await Axios.post("http://localhost:8080/getApplication", { appAcronym: state.acronym }, { withCredentials: true })
        console.log(checkOpenPermit.data.application);
        if (checkOpenPermit.length < 0) {
          navigate("/")
        }
        if (!res.data.groups.includes(checkOpenPermit.data.application.app_permit_Create)) {
          navigate("/")
        }
        getPlans()
        // checkApp()
      } else {
        navigate("/")
      }
    }
    getUserInfo()
  }, [])

  // useEffect(() => {
  //   if (srcState.username != "nil") {
  //     getPlans()
  //     checkApp()
  //   }
  // }, [srcState.username])
  
  return (
    <>
      <div className="container mx-auto mt-5">
        <div className="mb-4">
          <h1 className="text-xl font-bold">Create task</h1>
        </div>
        <form onSubmit={onSubmit}>
          <div className="mb-6">
            <label for="taskName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Task name
            </label>
            <input
              type="text"
              onChange={e => setTaskName(e.target.value)}
              id="taskName"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Task name..."
              required
            />
          </div>
          <div className="mb-6">
            <label for="desc" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Task description
            </label>
            <textarea
              onChange={e => setTaskDescription(e.target.value)}
              id="desc"
              rows="4"
              class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Task description...."
            ></textarea>
          </div>
          <div className="mb-6">
            <label for="taskNotes" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Task notes
            </label>
            <textarea
              onInput={taskNotesRegex}
              onChange={e => setTaskNotes(e.target.value)}
              id="taskNotes"
              rows="4"
              class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Task notes...."
            ></textarea>
          </div>

          <div className="mb-6 grid lg:grid-cols-2 gap-4 grid-cols-1">
            <div>
              <label for="plans" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Plan
              </label>
              <select
                onChange={e => setTaskPlan(e.target.value)}
                id="plans"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value=""></option>
                {plans.map((plan, index) => {
                  // <option value={index}>{index}</option>
                  if(plan !== null) {
                    return <option value={plan.plan_MVP_name}>{plan.plan_MVP_name}</option>
                  }
                })}
              </select>
            </div>
            <div>
              <p>
                <span className="text-md font-semibold">Application acronym: </span>
                {acronym}
              </p>
              <p>
                <span className="text-md font-semibold">Create date: </span>
                {new Date().toISOString().substr(0, 10)}
              </p>
              <p>
                <span className="text-md font-semibold">Task creator </span>
                {srcState.username}
              </p>
              <p>
                <span className="text-md font-semibold">Task owner: </span>
                {srcState.username}
              </p>
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
            Create
          </button>
        </form>
      </div>
    </>
  )
}

export default CreateTask
