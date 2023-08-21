import React, { useEffect, useContext, useReducer, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import Axios from "axios"

//context
import StateContext from "../../StateContext"
import DispatchContext from "../../DispatchContext"

//import task view more modal
import TaskModal from "../global/taskModalComponent"

//import onload
import IsLoadingComponent from "../global/isLoadingComponent"

function PlanOverview() {
  //useLocation to get the acronym from the Link button
  const { state } = useLocation()

  //navigate
  const navigate = useNavigate()

  //useState fields
  const [acronym, setAcronym] = useState()
  const [startDate, setStartDate] = useState("NULL")
  const [endDate, setEndDate] = useState("NULL")
  const [planColour, setPlanColour] = useState("")
  const [appStartDate, setAppStartDate] = useState()
  const [appEndDate, setAppEndDate] = useState()
  const [open, setOpen] = useState([])
  const [todo, setTodo] = useState([])
  const [doing, setDoing] = useState([])
  const [done, setDone] = useState([])
  const [closed, setClosed] = useState([])
  const [plan, setPlan] = useState([])

  //authorization for tasks
  const [aCreate, setACreate] = useState(false)
  const [aOpen, setAOpen] = useState(false)
  const [aTodo, setATodo] = useState(false)
  const [aDoing, setADoing] = useState(false)
  const [aDone, setADone] = useState(false)

  //Onload
  const [onLoad, setOnLoad] = useState(true)

  //handle plan start and end date (display)
  async function displaySEdate(startDate, endDate, planColour) {
    var tempStartDate = new Date(startDate).toISOString().substr(0, 10)
    var tempEndDate = new Date(endDate).toISOString().substr(0, 10)
    setStartDate(tempStartDate)
    setEndDate(tempEndDate)
    setPlanColour(planColour)
  }

  //Set authroization
  async function setAuthorization() {
    //Get application
    const appResult = await Axios.post("http://localhost:8080/getApplication", { appAcronym: state.acronym }, { withCredentials: true })
    console.log(appResult);

    if (appResult.data.success) {
      // Check if current user got permission for create
      if (appResult.data.application.app_permit_Create != null) {
        //Checkgroup
        let createR = await Axios.post("http://localhost:8080/cg", { un: srcState.username, gn: appResult.data.application.app_permit_Create }, {withCredentials: true})
        if (createR.data.cgResult) {
          setACreate(true)
        }
      }

      //Check if current user got permission for open
      if (appResult.data.application.app_permit_Open != null) {
        //Checkgroup
        let OpenR = await Axios.post("http://localhost:8080/cg", { un: srcState.username, gn: appResult.data.application.app_permit_Open }, {withCredentials: true})
        if (OpenR.data.cgResult) {
          setAOpen(true)
        }
      }

      //Check if current user got permission for todo
      if (appResult.data.application.app_permit_toDoList != null) {
        //Checkgroup
        let todoR = await Axios.post("http://localhost:8080/cg", { un: srcState.username, gn: appResult.data.application.app_permit_toDoList }, {withCredentials: true})
        if (todoR.data.cgResult) {
          setATodo(true)
        }
      }

      //Check if current user got permission for doing
      if (appResult.data.application.app_permit_Doing != null) {
        //Checkgroup
        let doingR = await Axios.post("http://localhost:8080/cg", { un: srcState.username, gn: appResult.data.application.app_permit_Doing }, {withCredentials: true})
        if (doingR.data.cgResult) {
          setADoing(true)
        }
      }

      //Check if current user got permission for done
      if (appResult.data.application.app_permit_Done != null) {
        //Checkgroup
        let doneR = await Axios.post("http://localhost:8080/cg", { un: srcState.username, gn: appResult.data.application.app_permit_Done }, {withCredentials: true})
        if (doneR.data.cgResult) {
          setADone(true)
        }
      }
    } else {
      navigate("/")
    }
  }

  //get application, plan and task
  async function getApp() {
    //check state acronym
    if (!state.acronym) {
      srcDispatch({ type: "flashMessage", value: "Invalid acronym" })
      navigate(-1)
    }

    //Axios get app
    const appResult = await Axios.post("http://localhost:8080/getApplication", { appAcronym: state.acronym }, { withCredentials: true })
    if (appResult.data.success) {
      setAppStartDate(new Date(appResult.data.application.app_startDate).toISOString().substr(0, 10))
      setAppEndDate(new Date(appResult.data.application.app_endDate).toISOString().substr(0, 10))
      setAcronym(appResult.data.application.app_Acronym)
    }

    //Axios get plan by app acronym
    const planResult = await Axios.post("http://localhost:8080/all-plan/app", { appAcronym: state.acronym }, { withCredentials: true })
    //console.log(planResult)
    console.log("planResult", planResult.data.plans);
    if (planResult.data.success) {
      setPlan(planResult.data.plans)
    }

    //Axios get task by app acronym
    const taskResult = await Axios.post("http://localhost:8080/all-task/app", { appAcronym: state.acronym }, { withCredentials: true })
    console.log("taskResults", Object.values(taskResult.data.tasks))
    
    if (taskResult.data.success) {
      //Set onload to false
      setOnLoad(false)
      //console.log(taskResult.data.tasks);
      //re-arrange tasks into different state
      for (let k in Object.values(taskResult.data.tasks)) {
        if (taskResult.data.tasks[k].taskState === "open") {
          //Get the colour of the task based on the plan and append to the array
          if (taskResult.data.tasks[k].taskPlan) {
            const taskPlanColour = await Axios.post("http://localhost:8080/get-plan/planname", { planName: taskResult.data.tasks[k].taskPlan }, { withCredentials: true })
            if (taskPlanColour.data.success) {
              taskResult.data.tasks[k]["colour"] = taskPlanColour.data.plans.colour
              setOpen(setOpen => [...setOpen, taskResult.data.tasks[k]])
            } else {
              setOpen(setOpen => [...setOpen, taskResult.data.tasks[k]])
            }
          } else {
            setOpen(setOpen => [...setOpen, taskResult.data.tasks[k]])
          }
        } else if (taskResult.data.tasks[k].taskState === "todo") {
          //Get the colour of the task based on the plan and append to the array
          if (taskResult.data.tasks[k].taskPlan) {
            const taskPlanColour = await Axios.post("http://localhost:8080/get-plan/planname", { planName: taskResult.data.tasks[k].taskPlan }, { withCredentials: true })
            if (taskPlanColour.data.success) {
              taskResult.data.tasks[k]["colour"] = taskPlanColour.data.plans.colour
              setTodo(setTodo => [...setTodo, taskResult.data.tasks[k]])
            } else {
              setTodo(setTodo => [...setTodo, taskResult.data.tasks[k]])
            }
          } else {
            setTodo(setTodo => [...setTodo, taskResult.data.tasks[k]])
          }
        } else if (taskResult.data.tasks[k].taskState === "doing") {
          //Get the colour of the task based on the plan and append to the array
          if (taskResult.data.tasks[k].taskPlan) {
            const taskPlanColour = await Axios.post("http://localhost:8080/get-plan/planname", { planName: taskResult.data.tasks[k].taskPlan }, { withCredentials: true })
            if (taskPlanColour.data.success) {
              taskResult.data.tasks[k]["colour"] = taskPlanColour.data.plans.colour
              setDoing(setDoing => [...setDoing, taskResult.data.tasks[k]])
            } else {
              console.log("enetered else")
              setDoing(setDoing => [...setDoing, taskResult.data.tasks[k]])
            }
          } else {
            console.log("teem")
            setDoing(setDoing => [...setDoing, taskResult.data.tasks[k]])
          }
        } else if (taskResult.data.tasks[k].taskState === "done") {
          //Get the colour of the task based on the plan and append to the array
          if (taskResult.data.tasks[k].taskPlan) {
            const taskPlanColour = await Axios.post("http://localhost:8080/get-plan/planname", { planName: taskResult.data.tasks[k].taskPlan }, { withCredentials: true })
            if (taskPlanColour.data.success) {
              taskResult.data.tasks[k]["colour"] = taskPlanColour.data.plans.colour
              setDone(setDone => [...setDone, taskResult.data.tasks[k]])
            } else {
              setDone(setDone => [...setDone, taskResult.data.tasks[k]])
            }
          } else {
            setDone(setDone => [...setDone, taskResult.data.tasks[k]])
          }
        } else if (taskResult.data.tasks[k].taskState === "closed") {
          //Get the colour of the task based on the plan and append to the array
          if (taskResult.data.tasks[k].taskPlan) {
            const taskPlanColour = await Axios.post("http://localhost:8080/get-plan/planname", { planName: taskResult.data.tasks[k].taskPlan }, { withCredentials: true })
            if (taskPlanColour.data.success) {
              taskResult.data.tasks[k]["colour"] = taskPlanColour.data.plans.colour
              setClosed(setClosed => [...setClosed, taskResult.data.tasks[k]])
            } else {
              setClosed(setClosed => [...setClosed, taskResult.data.tasks[k]])
            }
          } else {
            setClosed(setClosed => [...setClosed, taskResult.data.tasks[k]])
          }
        }
      }
    } else {
      //Set onload to false
      setOnLoad(false)
    }
  }

  //context
  const srcState = useContext(StateContext)
  const srcDispatch = useContext(DispatchContext)

  async function authorization(){
    if(srcState.logIn == false){
      srcDispatch({type:"flashMessage", value:"please login.."});
      navigate("/")
    }
    if (state == null) {
      return navigate("/")
    }
    if (state.acronym == null) {
      return navigate("/")
    }
    setAcronym(state.acronym)
  }

  //useEffect
  useEffect(() => {
    // const getUserInfo = async () => {
    //   if (state == null) {
    //     return navigate("/")
    //   }
    //   if (state.acronym == null) {
    //     return navigate("/")
    //   }

    //   const res = await Axios.post("http://localhost:8080/authtoken/return/userinfo", {}, { withCredentials: true })
    //   if (res.data.success) {
    //     if (res.data.status == 0) navigate("/login")
    //     srcDispatch({ type: "login", value: res.data, admin: res.data.groups.includes("admin") })
    //     setAcronym(state.acronym)
    //     //console.log(state.acronym)
    //   } else {
    //     navigate("/")
    //   }
    // }
    // getUserInfo()
  }, [])

  useEffect(() => {
    console.log("acronym: ", acronym)
    if (acronym != undefined) {
      getApp()
    }
  }, [acronym])

  useEffect(() => {
    if (srcState.username != "nil") {
      setAuthorization()
    }
  }, [srcState.username])

  useEffect(()=>{
    if(srcState.testLoginComplete) authorization();
  },[srcState.testLoginComplete])

  if (onLoad) {
    return (
      <>
        <IsLoadingComponent />
      </>
    )
  } else {
    return (
      <>
        <div className="m-8">
          <div className="flex justify-between mb-7">
            <div>
              <h1 className="text-3xl mb-5">Application: {acronym}</h1>
              <span className="text-md mt-1">Start date: {appStartDate}</span>
              <br />
              <span className="text-md mt-1">End date: {appEndDate}</span>
            </div>
            <div className="grid grid-cols-3">
              <div className="mr-4">
                <p>Plan start date: {startDate}</p>
                <p>Plan end date: {endDate}</p>
                <p className="flex">
                  Plan colour: &nbsp;<div className="w-5 h-5" style={{ background: planColour }}></div>
                </p>
              </div>
              <div>
                <div className="overflow-y-auto">
                  <select multiple={true} className="flex w-32">
                    {plan.map((pl, index) => (
                      //<span>
                      <option
                        key={index}
                        style={{ borderLeft: "5px solid", borderLeftColor: pl.colour }}
                        className="text-sm"
                        onClick={() => displaySEdate(pl.plan_startDate, pl.plan_endDate, pl.colour)}
                      >
                        {pl.plan_MVP_name}
                      </option>
                      //</span>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-rows-2 gap-3">
                {aOpen && (
                  <Link
                    to={"/create/plan"}
                    type="button"
                    className="bg-blue-500 text-center hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                    state={{ acronym: state.acronym, aOpen, appStartDate, appEndDate }}
                  >
                    Create plan
                  </Link>
                )}
                {aCreate && (
                  <Link to={"/create/task"} state={{ acronym: state.acronym, aCreate }} type="button" className="bg-blue-500 text-center hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                    Create Task
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-4 grid-cols-2">
            <div className="">
              <h1 className="text-lg font-bold bg-sky-200 text-center">OPEN</h1>

              {open.map((task, index) => (
                <div key={index} class="w-full overflow-hidden shadow-lg mt-3 border">
                  <div className="w-full h-5" style={{ background: task.colour }}></div>
                  <div className="px-6 py-1">
                    <div className="flex justify-between">
                      <div className="font-bold text-lg mb-1">{task.taskName}</div>
                      <div>
                        <span className="font-bold text-sm">Plan: </span>
                        {task.taskPlan ? task.taskPlan : "No plan"}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 text-sm">
                        <span className="font-bold">ID:</span> {task.taskId}
                      </span>
                      <span className="text-gray-700 text-sm">
                        <span className="font-bold">Owner:</span> {task.taskOwner}
                      </span>
                    </div>
                    <div>
                      <TaskModal
                        Task_name={task.taskName}
                        Task_description={task.taskDescription}
                        Task_notes={task.taskNotes}
                        Task_id={task.taskId}
                        Task_plan={task.taskPlan}
                        Task_app_Acronym={task.taskAppAcronym}
                        Task_state={task.taskState}
                        Task_creator={task.taskCreator}
                        Task_owner={task.taskOwner}
                        Task_createDate={task.taskCreateDate}
                      />
                    </div>
                  </div>
                  <div className="px-3 pt-1 pb-1">
                    <div className="flex justify-between">
                      <div></div>

                      {aOpen ? (
                        <Link
                          type="button"
                          className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-4 rounded-full h-7 text-center"
                          to={"/pm-update/task"}
                          state={{ taskId: task.taskId, acronym: state.acronym, newState: "edit" }}
                        >
                          Edit
                        </Link>
                      ) : (
                        <div></div>
                      )}

                      {aOpen && (
                        <Link type="button" to={"/pm-update/task"} state={{ taskId: task.taskId, acronym: state.acronym, newState: "release" }}>
                          <div class="w-5  overflow-hidden inline-block">
                            <div title="RELEASE" class=" h-10 hover:bg-slate-500 bg-black rotate-45 transform origin-top-left"></div>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="">
              <h1 className="text-lg font-bold bg-sky-300 text-center">TODO</h1>

              {todo.map((task, index) => (
                <div className="w-full overflow-hidden shadow-lg mt-3 border">
                  <div className="w-full h-5" style={{ background: task.colour }}></div>
                  <div className="px-6 py-1">
                    <div className="flex justify-between">
                      <div className="font-bold text-lg mb-1">{task.taskName}</div>
                      <div>
                        <span className="font-bold text-sm">Plan: </span>
                        {task.taskPlan ? task.taskPlan : "No plan"}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 text-sm">
                        <span className="font-bold">ID:</span> {task.taskId}
                      </span>
                      <span className="text-gray-700 text-sm">
                        <span className="font-bold">Owner:</span> {task.taskOwner}
                      </span>
                    </div>
                    <div>
                      <TaskModal
                        Task_name={task.taskName}
                        Task_description={task.taskDescription}
                        Task_notes={task.taskNotes}
                        Task_id={task.taskId}
                        Task_plan={task.taskPlan}
                        Task_app_Acronym={task.taskAppAcronym}
                        Task_state={task.taskState}
                        Task_creator={task.taskCreator}
                        Task_owner={task.taskOwner}
                        Task_createDate={task.taskCreateDate}
                      />
                    </div>
                  </div>
                  <div class="px-3 pt-1 pb-1">
                    <div className="flex justify-between">
                      <div></div>

                      {aTodo ? (
                        <Link
                          type="button"
                          className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-4 rounded-full h-7 text-center"
                          to={"/team-update/task"}
                          state={{ taskId: task.taskId, acronym: state.acronym, newState: "edit" }}
                        >
                          Edit
                        </Link>
                      ) : (
                        <div></div>
                      )}

                      {aTodo && (
                        <Link type="button" to={"/team-update/task"} state={{ taskId: task.taskId, acronym: state.acronym, newState: "promote" }}>
                          <div class="w-5  overflow-hidden inline-block">
                            <div title="PROMOTE" class=" h-10 hover:bg-slate-500 bg-black rotate-45 transform origin-top-left"></div>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="">
              <h1 className="text-lg font-bold bg-sky-200 text-center">DOING</h1>

              {doing.map((task, index) => (
                <div className="w-full overflow-hidden shadow-lg mt-3 border">
                  <div className="w-full h-5" style={{ background: task.colour }}></div>
                  <div className="px-6 py-1">
                    <div className="flex justify-between">
                      <div className="font-bold text-lg mb-1">{task.taskName}</div>
                      <div>
                        <span className="font-bold text-sm">Plan: </span>
                        {task.taskPlan ? task.taskPlan : "No plan"}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 text-sm">
                        <span className="font-bold">ID:</span> {task.taskId}
                      </span>
                      <span className="text-gray-700 text-sm">
                        <span className="font-bold">Owner:</span> {task.taskOwner}
                      </span>
                    </div>
                    <div>
                      <TaskModal
                        Task_name={task.taskName}
                        Task_description={task.taskDescription}
                        Task_notes={task.taskNotes}
                        Task_id={task.taskId}
                        Task_plan={task.taskPlan}
                        Task_app_Acronym={task.taskAppAcronym}
                        Task_state={task.taskState}
                        Task_creator={task.taskCreator}
                        Task_owner={task.taskOwner}
                        Task_createDate={task.taskCreateDate}
                      />
                    </div>
                  </div>
                  <div class="px-3 pt-1 pb-1">
                    <div className="flex justify-between">
                      {aDoing ? (
                        <Link type="button" to={"/team-update/task"} className="" state={{ taskId: task.taskId, acronym: state.acronym, newState: "return" }}>
                          <div class="w-5 overflow-hidden inline-block">
                            <div class=" h-10 hover:bg-slate-500 bg-black -rotate-45 transform origin-top-right" title="RETURN"></div>
                          </div>
                        </Link>
                      ) : (
                        <div></div>
                      )}

                      {aDoing ? (
                        <Link
                          type="button"
                          className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-4 rounded-full h-7 text-center"
                          to={"/team-update/task"}
                          state={{ taskId: task.taskId, acronym: state.acronym, newState: "edit" }}
                        >
                          Edit
                        </Link>
                      ) : (
                        <div></div>
                      )}

                      {aDoing && (
                        <Link type="button" to={"/team-update/task"} state={{ taskId: task.taskId, acronym: state.acronym, newState: "promote" }}>
                          <div class="w-5  overflow-hidden inline-block">
                            <div title="PROMOTE" class=" h-10 hover:bg-slate-500 bg-black rotate-45 transform origin-top-left"></div>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="">
              <h1 className="text-lg font-bold bg-sky-300 text-center">DONE</h1>

              {done.map((task, index) => (
                <div className="w-full overflow-hidden shadow-lg mt-3 border">
                  <div className="w-full h-5" style={{ background: task.colour }}></div>
                  <div className="px-6 py-1">
                    <div className="flex justify-between">
                      <div className="font-bold text-lg mb-1">{task.taskName}</div>
                      <div>
                        <span className="font-bold text-sm">Plan: </span>
                        {task.taskPlan ? task.taskPlan : "No plan"}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 text-sm">
                        <span className="font-bold">ID:</span> {task.taskId}
                      </span>
                      <span className="text-gray-700 text-sm">
                        <span className="font-bold">Owner:</span> {task.taskOwner}
                      </span>
                    </div>
                    <div>
                      <TaskModal
                        Task_name={task.taskName}
                        Task_description={task.taskDescription}
                        Task_notes={task.taskNotes}
                        Task_id={task.taskId}
                        Task_plan={task.taskPlan}
                        Task_app_Acronym={task.taskAppAcronym}
                        Task_state={task.taskState}
                        Task_creator={task.taskCreator}
                        Task_owner={task.taskOwner}
                        Task_createDate={task.taskCreateDate}
                      />
                    </div>
                  </div>
                  <div class="px-3 pt-1 pb-1">
                    <div className="flex justify-between">
                      {aDone ? (
                        <Link type="button" to={"/pl-update/task"} className="" state={{ taskId: task.taskId, acronym: state.acronym, newState: "reject" }}>
                          <div class="w-5 overflow-hidden inline-block">
                            <div class=" h-10 hover:bg-slate-500 bg-black -rotate-45 transform origin-top-right" title="REJECT"></div>
                          </div>
                        </Link>
                      ) : (
                        <div></div>
                      )}

                      {aDone ? (
                        <Link
                          type="button"
                          className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-4 rounded-full h-7 text-center"
                          to={"/pl-update/task"}
                          state={{ taskId: task.taskId, acronym: state.acronym, newState: "edit" }}
                        >
                          Edit
                        </Link>
                      ) : (
                        <div></div>
                      )}

                      {aDone && (
                        <Link type="button" to={"/pl-update/task"} state={{ taskId: task.taskId, acronym: state.acronym, newState: "accept" }}>
                          <div class="w-5  overflow-hidden inline-block">
                            <div title="ACCEPT" class=" h-10 hover:bg-slate-500 bg-black rotate-45 transform origin-top-left"></div>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="">
              <h1 className="text-lg font-bold bg-sky-200 text-center">CLOSED</h1>

              {closed.map((task, index) => (
                <div className="w-full overflow-hidden shadow-lg mt-3 border">
                  <div className="w-full h-5" style={{ background: task.colour }}></div>
                  <div class="px-6 py-1">
                    <div className="flex justify-between">
                      <div className="font-bold text-lg mb-1">{task.taskName}</div>
                      <div>
                        <span className="font-bold text-sm">Plan: </span>
                        {task.taskPlan ? task.taskPlan : "No plan"}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 text-sm">
                        <span className="font-bold">ID:</span> {task.taskId}
                      </span>
                      <span className="text-gray-700 text-sm">
                        <span className="font-bold">Owner:</span> {task.taskOwner}
                      </span>
                    </div>
                    <div>
                      <TaskModal
                        Task_name={task.taskName}
                        Task_description={task.taskDescription}
                        Task_notes={task.taskNotes}
                        Task_id={task.taskId}
                        Task_plan={task.taskPlan}
                        Task_app_Acronym={task.taskAppAcronym}
                        Task_state={task.taskState}
                        Task_creator={task.taskCreator}
                        Task_owner={task.taskOwner}
                        Task_createDate={task.taskCreateDate}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default PlanOverview
