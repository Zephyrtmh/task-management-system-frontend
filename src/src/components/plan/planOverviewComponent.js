import React, { useEffect, useContext, useReducer, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom";
import Axios from "axios";

//context
import StateContext from "../../StateContext";
import DispatchContext from "../../DispatchContext";

//import task view more modal
import TaskModal from "../global/taskModalComponent";

//import onload
import IsLoadingComponent from "../global/isLoadingComponent";

function PlanOverview() {
    //useLocation to get the acronym from the Link button
    const {state} = useLocation();

    //navigate
    const navigate = useNavigate();

    //useState fields
    const [acronym, setAcronym] = useState();
    const [startDate, setStartDate] = useState("NULL");
    const [endDate, setEndDate] = useState("NULL");
    const [planColour, setPlanColour] = useState("");
    const [appStartDate, setAppStartDate] = useState();
    const [appEndDate, setAppEndDate] = useState();
    const [open, setOpen] = useState([]);
    const [todo, setTodo] = useState([]);
    const [doing, setDoing] = useState([]);
    const [done, setDone] = useState([]);
    const [closed, setClosed] = useState([]);
    const [plan, setPlan] = useState([]);

    //authorization for tasks
    const [aCreate, setACreate] = useState(false);
    const [aOpen, setAOpen] = useState(false);
    const [aTodo, setATodo] = useState(false);
    const [aDoing, setADoing] = useState(false);
    const [aDone, setADone] = useState(false);

    //Onload 
    const [onLoad, setOnLoad] = useState(true);

    //handle plan start and end date (display)
    async function displaySEdate(startDate, endDate, planColour){
        var tempStartDate = new Date(startDate).toISOString().substr(0,10);
        var tempEndDate = new Date(endDate).toISOString().substr(0,10);
        setStartDate(tempStartDate);
        setEndDate(tempEndDate);
        setPlanColour(planColour);
    }

    //Set authroization
    async function setAuthorization(){
        //Get application
        const appResult = await Axios.post("http://localhost:3000/get-application", {acronym:state.acronym}, {withCredentials:true})

        if(appResult.data.success){
            
            //Check if current user got permission for create 
            if(appResult.data.apps[0].App_permit_Create != null){
                //Checkgroup
                let createR = await Axios.post("http://localhost:3000/cg", {un:srcState.username, gn:appResult.data.apps[0].App_permit_Create});
                if(createR.data.cgResult){
                    setACreate(true);
                }
            }

            //Check if current user got permission for open 
            if(appResult.data.apps[0].App_permit_Open != null){
                //Checkgroup
                let OpenR = await Axios.post("http://localhost:3000/cg", {un:srcState.username, gn:appResult.data.apps[0].App_permit_Open});
                if(OpenR.data.cgResult){
                    setAOpen(true);
                }
            }

            //Check if current user got permission for todo 
            if(appResult.data.apps[0].App_permit_toDoList != null){
                //Checkgroup
                let todoR = await Axios.post("http://localhost:3000/cg", {un:srcState.username, gn:appResult.data.apps[0].App_permit_toDoList});
                if(todoR.data.cgResult){
                    setATodo(true);
                }
            }

            //Check if current user got permission for doing 
            if(appResult.data.apps[0].App_permit_Doing != null){
                //Checkgroup
                let doingR = await Axios.post("http://localhost:3000/cg", {un:srcState.username, gn:appResult.data.apps[0].App_permit_Doing});
                if(doingR.data.cgResult){
                    setADoing(true);
                }
            }

            //Check if current user got permission for done 
            if(appResult.data.apps[0].App_permit_Done != null){
                //Checkgroup
                let doneR = await Axios.post("http://localhost:3000/cg", {un:srcState.username, gn:appResult.data.apps[0].App_permit_Done});
                if(doneR.data.cgResult){
                    setADone(true);
                }
            }
        }
        else{
            navigate("/")
        }
    }

    //get application, plan and task
    async function getApp(){
        //check state acronym 
        if(!state.acronym){
            srcDispatch({type:"flashMessage", value:"Invalid acronym"});
            navigate(-1);
        }

        //Axios get app
        const appResult = await Axios.post("http://localhost:3000/get-application", {acronym:state.acronym}, {withCredentials:true})
        if(appResult.data.success){
            setAppStartDate(new Date(appResult.data.apps[0].App_startDate).toISOString().substr(0,10));
            setAppEndDate(new Date(appResult.data.apps[0].App_endDate).toISOString().substr(0,10));
            setAcronym(appResult.data.apps[0].App_Acronym);

        }

        //Axios get plan by app acronym
        const planResult = await Axios.post("http://localhost:3000/all-plan/app", {app_Acronym:state.acronym}, {withCredentials:true});
        //console.log(planResult)
        if(planResult.data.success){
            setPlan(planResult.data.plans);
        }


        //Axios get task by app acronym
        const taskResult = await Axios.post("http://localhost:3000/all-task/app", {app_Acronym:state.acronym}, {withCredentials:true});
        if(taskResult.data.success){
            //Set onload to false
            setOnLoad(false);
            //console.log(taskResult.data.tasks);
            //re-arrange tasks into different state
            for(const k in taskResult.data.tasks){
                if(taskResult.data.tasks[k].Task_state === "open"){
                    //Get the colour of the task based on the plan and append to the array 
                    if(taskResult.data.tasks[k].Task_plan){
                        const taskPlanColour = await Axios.post("http://localhost:3000/get-plan/planname", {planName:taskResult.data.tasks[k].Task_plan}, {withCredentials:true});
                        if(taskPlanColour.data.success){
                            taskResult.data.tasks[k]['colour'] = taskPlanColour.data.plan[0].colour;
                            setOpen(setOpen => [...setOpen,  taskResult.data.tasks[k]]);
                        }else{
                            setOpen(setOpen => [...setOpen,  taskResult.data.tasks[k]]);
                        }
                    }
                    else{
                        setOpen(setOpen => [...setOpen, taskResult.data.tasks[k]]);
                    }
                }
                else if(taskResult.data.tasks[k].Task_state === "todo"){

                    //Get the colour of the task based on the plan and append to the array 
                    if(taskResult.data.tasks[k].Task_plan){
                        const taskPlanColour = await Axios.post("http://localhost:3000/get-plan/planname", {planName:taskResult.data.tasks[k].Task_plan}, {withCredentials:true});
                        if(taskPlanColour.data.success){
                            taskResult.data.tasks[k]['colour'] = taskPlanColour.data.plan[0].colour;
                            setTodo(setTodo => [...setTodo,  taskResult.data.tasks[k]]);
                        }else{
                            setTodo(setTodo => [...setTodo,  taskResult.data.tasks[k]]);
                        }
                    }
                    else{
                        setTodo(setTodo => [...setTodo, taskResult.data.tasks[k]]);
                    }

                }
                else if(taskResult.data.tasks[k].Task_state === "doing"){

                    //Get the colour of the task based on the plan and append to the array 
                    if(taskResult.data.tasks[k].Task_plan){
                        const taskPlanColour = await Axios.post("http://localhost:3000/get-plan/planname", {planName:taskResult.data.tasks[k].Task_plan}, {withCredentials:true});
                        if(taskPlanColour.data.success){
                            taskResult.data.tasks[k]['colour'] = taskPlanColour.data.plan[0].colour;
                            setDoing(setDoing => [...setDoing, taskResult.data.tasks[k]]);
                        }else{
                            console.log("enetered else")
                            setDoing(setDoing => [...setDoing, taskResult.data.tasks[k]]);
                        }
                    }
                    else{
                        console.log("teem")
                        setDoing(setDoing => [...setDoing, taskResult.data.tasks[k]]);
                    }

                }
                else if(taskResult.data.tasks[k].Task_state === "done"){

                    //Get the colour of the task based on the plan and append to the array 
                    if(taskResult.data.tasks[k].Task_plan){
                        const taskPlanColour = await Axios.post("http://localhost:3000/get-plan/planname", {planName:taskResult.data.tasks[k].Task_plan}, {withCredentials:true});
                        if(taskPlanColour.data.success){
                            taskResult.data.tasks[k]['colour'] = taskPlanColour.data.plan[0].colour;
                            setDone(setDone => [...setDone,  taskResult.data.tasks[k]]);
                        }else{
                            setDone(setDone => [...setDone,  taskResult.data.tasks[k]]);
                        }
                    }
                    else{
                        setDone(setDone => [...setDone, taskResult.data.tasks[k]]);
                    }

                }
                else if(taskResult.data.tasks[k].Task_state === "closed"){

                    //Get the colour of the task based on the plan and append to the array 
                    if(taskResult.data.tasks[k].Task_plan){
                        const taskPlanColour = await Axios.post("http://localhost:3000/get-plan/planname", {planName:taskResult.data.tasks[k].Task_plan}, {withCredentials:true});
                        if(taskPlanColour.data.success){
                            taskResult.data.tasks[k]['colour'] = taskPlanColour.data.plan[0].colour;
                            setClosed(setClosed => [...setClosed,  taskResult.data.tasks[k]]);
                        }else{
                            setClosed(setClosed => [...setClosed,  taskResult.data.tasks[k]]);
                        }
                    }
                    else{
                        setClosed(setClosed => [...setClosed, taskResult.data.tasks[k]]);
                    }

                }
            }

        }else{
            //Set onload to false
            setOnLoad(false);
        }
        
    }

    //context 
    const srcState = useContext(StateContext);
    const srcDispatch = useContext(DispatchContext);

    //useEffect
    useEffect(()=>{

        const getUserInfo = async()=>{
            if(state == null){
                return navigate("/")
            }
            if(state.acronym == null){
                return navigate("/")
            }

            const res = await Axios.post("http://localhost:3000/authtoken/return/userinfo", {},{withCredentials:true});
            if(res.data.success){
                if(res.data.status == 0) navigate("/login");
                srcDispatch({type:"login", value:res.data, admin:res.data.groups.includes("admin")});
                setAcronym(state.acronym); 
                //console.log(state.acronym)
            }
            else{
                navigate("/")
            }
        }
        getUserInfo();
    }, [])

    useEffect(()=>{
        if(acronym != undefined){
            getApp();
        }
    },[acronym])

    useEffect(()=>{
        if(srcState.username != "nil"){
            setAuthorization();
        }
    },[srcState.username])

    if(onLoad){
        return(
            <>
                <IsLoadingComponent />
            </>
        )
    }else{
        return ( 
            <>
                <div className="m-8">
                    <div className="flex justify-between mb-7">
                        <div>
                            <h1 className="text-3xl mb-5">Application: {acronym}</h1>
                            <span className="text-md mt-1">Start date: {appStartDate}</span><br/>
                            <span className="text-md mt-1">End date: {appEndDate}</span>
                        </div>
                        <div className="grid grid-cols-3">
                            <div className="mr-4">
                                <p>Plan start date: {startDate}</p>
                                <p>Plan end date: {endDate}</p>
                                <p className="flex">Plan colour: &nbsp;<div className="w-5 h-5" style={{background:planColour}}></div></p>
                            </div>
                            <div>
                                <div className="overflow-y-auto">
                                    <select multiple={true} className="flex w-32">
                                        {plan.map((pl, index)=>(
                                            //<span>
                                                <option key={index} style={{borderLeft: '5px solid', borderLeftColor:pl.colour}}className="text-sm" onClick={() => displaySEdate(pl.Plan_startDate, pl.Plan_endDate, pl.colour)}>{pl.Plan_MVP_name}</option>
                                            //</span> 
                                        ))}                                 
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-rows-2 gap-3">
                                {aOpen && <Link to={"/create/plan"} type="button" className="bg-blue-500 text-center hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" state={{acronym:state.acronym, aOpen, appStartDate, appEndDate}}>Create plan</Link>}
                                {aCreate && <Link to={"/create/task"} state={{acronym:state.acronym, aCreate}} type="button" className="bg-blue-500 text-center hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Create Task</Link>}
                            </div>
                        </div>
                    </div>
    
                    
                    <div className="grid lg:grid-cols-5 gap-4 grid-cols-2">
                        <div className="">
                            <h1 className="text-lg font-bold bg-sky-200 text-center">OPEN</h1>
                            
    
                            {open.map((task, index)=>(
                                <div class="w-full overflow-hidden shadow-lg mt-3 border">
                                    <div className="w-full h-5" style={{background:task.colour}}></div>
                                    <div className="px-6 py-1">
                                        <div className="flex justify-between">
                                            <div className="font-bold text-lg mb-1">{task.Task_name}</div>
                                            <div><span className="font-bold text-sm">Plan: </span>{task.Task_plan ? task.Task_plan : "No plan"}</div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700 text-sm">
                                                <span className="font-bold">ID:</span> {task.Task_id}
                                            </span>
                                            <span className="text-gray-700 text-sm">
                                               <span className="font-bold">Owner:</span> {task.Task_owner}
                                            </span>
                                        </div>
                                        <div><TaskModal Task_name={task.Task_name} Task_description={task.Task_description} Task_notes={task.Task_notes} Task_id={task.Task_id} Task_plan={task.Task_plan} Task_app_Acronym={task.Task_app_Acronym} Task_state={task.Task_state} Task_creator={task.Task_creator} Task_owner={task.Task_owner} Task_createDate={task.Task_createDate}/></div>
                                    </div>
                                    <div className="px-3 pt-1 pb-1">
                                        <div className="flex justify-between">
                                            <div></div>
    
                                            {aOpen ? 
                                            <Link type="button" className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-4 rounded-full h-7 text-center" to={"/pm-update/task"} state={{taskId:task.Task_id, acronym:state.acronym, newState:"edit"}}>Edit</Link> 
                                            : 
                                            <div></div>
                                            }
    
                                            {aOpen && <Link type="button" to={"/pm-update/task"} state={{taskId:task.Task_id, acronym:state.acronym, newState:"release"}}><div class="w-5  overflow-hidden inline-block">
                                            <div title="RELEASE" class=" h-10 hover:bg-slate-500 bg-black rotate-45 transform origin-top-left"></div>
                                            </div></Link>}
                                            
                                        </div>
                                        
                                    </div>
                                </div>
                            ))}
    
    
                        </div>
    
                        <div className="">
                            <h1 className="text-lg font-bold bg-sky-300 text-center">TODO</h1>
    
                            {todo.map((task, index)=>(
                                <div className="w-full overflow-hidden shadow-lg mt-3 border">
                                    <div className="w-full h-5" style={{background:task.colour}}></div>
                                    <div className="px-6 py-1">
                                        <div className="flex justify-between">
                                            <div className="font-bold text-lg mb-1">{task.Task_name}</div>
                                            <div><span className="font-bold text-sm">Plan: </span>{task.Task_plan ? task.Task_plan : "No plan"}</div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700 text-sm">
                                                <span className="font-bold">ID:</span> {task.Task_id}
                                            </span>
                                            <span className="text-gray-700 text-sm">
                                               <span className="font-bold">Owner:</span> {task.Task_owner}
                                            </span>
                                        </div>
                                        <div><TaskModal Task_name={task.Task_name} Task_description={task.Task_description} Task_notes={task.Task_notes} Task_id={task.Task_id} Task_plan={task.Task_plan} Task_app_Acronym={task.Task_app_Acronym} Task_state={task.Task_state} Task_creator={task.Task_creator} Task_owner={task.Task_owner} Task_createDate={task.Task_createDate}/></div>
                                    </div>
                                    <div class="px-3 pt-1 pb-1">
                                        <div className="flex justify-between">
                                            <div></div>

                                            {aTodo ? 
                                            <Link type="button" className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-4 rounded-full h-7 text-center" to={"/team-update/task"} state={{taskId:task.Task_id, acronym:state.acronym, newState:"edit"}}>Edit</Link> 
                                            : 
                                            <div></div>
                                            }

                                            {aTodo && <Link type="button" to={"/team-update/task"} state={{taskId:task.Task_id, acronym:state.acronym, newState:"promote"}}><div class="w-5  overflow-hidden inline-block">
                                            <div title="PROMOTE" class=" h-10 hover:bg-slate-500 bg-black rotate-45 transform origin-top-left"></div>
                                            </div></Link>}
                                            
                                        </div>
                                        
                                    </div>
                                </div>
                            ))}
    
    
    
                        </div>
    
                        <div className="">
                            <h1 className="text-lg font-bold bg-sky-200 text-center">DOING</h1>
                            
                            {doing.map((task, index)=>(
                                <div className="w-full overflow-hidden shadow-lg mt-3 border">
                                    <div className="w-full h-5" style={{background:task.colour}}></div>
                                    <div className="px-6 py-1">
                                        <div className="flex justify-between">
                                            <div className="font-bold text-lg mb-1">{task.Task_name}</div>
                                            <div><span className="font-bold text-sm">Plan: </span>{task.Task_plan ? task.Task_plan : "No plan"}</div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700 text-sm">
                                                <span className="font-bold">ID:</span> {task.Task_id}
                                            </span>
                                            <span className="text-gray-700 text-sm">
                                               <span className="font-bold">Owner:</span> {task.Task_owner}
                                            </span>
                                        </div>
                                        <div><TaskModal Task_name={task.Task_name} Task_description={task.Task_description} Task_notes={task.Task_notes} Task_id={task.Task_id} Task_plan={task.Task_plan} Task_app_Acronym={task.Task_app_Acronym} Task_state={task.Task_state} Task_creator={task.Task_creator} Task_owner={task.Task_owner} Task_createDate={task.Task_createDate}/></div>
                                    </div>
                                    <div class="px-3 pt-1 pb-1">
                                        <div className="flex justify-between">
                                            {aDoing ?
                                            <Link type="button" to={"/team-update/task"} className="" state={{taskId:task.Task_id, acronym:state.acronym, newState:"return"}}><div class="w-5 overflow-hidden inline-block">
                                            <div class=" h-10 hover:bg-slate-500 bg-black -rotate-45 transform origin-top-right" title="RETURN"></div>
                                            </div></Link>
                                            :
                                            <div></div>
                                            }

                                            {aDoing ? 
                                            <Link type="button" className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-4 rounded-full h-7 text-center" to={"/team-update/task"} state={{taskId:task.Task_id, acronym:state.acronym, newState:"edit"}}>Edit</Link> 
                                            : 
                                            <div></div>
                                            }

                                            {aDoing && <Link type="button" to={"/team-update/task"} state={{taskId:task.Task_id, acronym:state.acronym, newState:"promote"}}><div class="w-5  overflow-hidden inline-block">
                                            <div title="PROMOTE" class=" h-10 hover:bg-slate-500 bg-black rotate-45 transform origin-top-left"></div>
                                            </div></Link>}
                                            
                                        </div>
                                        
                                    </div>
                                </div>
                            ))}
    
                        </div>
    
                        <div className="">
                            <h1 className="text-lg font-bold bg-sky-300 text-center">DONE</h1>
    
                            {done.map((task, index)=>(
                                <div className="w-full overflow-hidden shadow-lg mt-3 border">
                                    <div className="w-full h-5" style={{background:task.colour}}></div>
                                    <div className="px-6 py-1">
                                        <div className="flex justify-between">
                                            <div className="font-bold text-lg mb-1">{task.Task_name}</div>
                                            <div><span className="font-bold text-sm">Plan: </span>{task.Task_plan ? task.Task_plan : "No plan"}</div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700 text-sm">
                                                <span className="font-bold">ID:</span> {task.Task_id}
                                            </span>
                                            <span className="text-gray-700 text-sm">
                                               <span className="font-bold">Owner:</span> {task.Task_owner}
                                            </span>
                                        </div>
                                        <div><TaskModal Task_name={task.Task_name} Task_description={task.Task_description} Task_notes={task.Task_notes} Task_id={task.Task_id} Task_plan={task.Task_plan} Task_app_Acronym={task.Task_app_Acronym} Task_state={task.Task_state} Task_creator={task.Task_creator} Task_owner={task.Task_owner} Task_createDate={task.Task_createDate}/></div>
                                    </div>
                                    <div class="px-3 pt-1 pb-1">
                                        <div className="flex justify-between">
                                            {aDone ?
                                            <Link type="button" to={"/pl-update/task"} className="" state={{taskId:task.Task_id, acronym:state.acronym, newState:"reject"}}><div class="w-5 overflow-hidden inline-block">
                                            <div class=" h-10 hover:bg-slate-500 bg-black -rotate-45 transform origin-top-right" title="REJECT"></div>
                                            </div></Link>
                                            :
                                            <div></div>
                                            }

                                            {aDone ? 
                                            <Link type="button" className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-4 rounded-full h-7 text-center" to={"/pl-update/task"} state={{taskId:task.Task_id, acronym:state.acronym, newState:"edit"}}>Edit</Link> 
                                            : 
                                            <div></div>
                                            }

                                            {aDone && <Link type="button" to={"/pl-update/task"} state={{taskId:task.Task_id, acronym:state.acronym, newState:"accept"}}><div class="w-5  overflow-hidden inline-block">
                                            <div title="ACCEPT" class=" h-10 hover:bg-slate-500 bg-black rotate-45 transform origin-top-left"></div>
                                            </div></Link>}
                                            
                                        </div>
                                        
                                    </div>
                                </div>
                            ))}
    
    
                        </div>
    
                        <div className="">
                            <h1 className="text-lg font-bold bg-sky-200 text-center">CLOSED</h1>
    
                            {closed.map((task, index)=>(
                                    <div className="w-full overflow-hidden shadow-lg mt-3 border">
                                        <div className="w-full h-5" style={{background:task.colour}}></div>
                                        <div class="px-6 py-1">
                                            <div className="flex justify-between">
                                                <div className="font-bold text-lg mb-1">{task.Task_name}</div>
                                                <div><span className="font-bold text-sm">Plan: </span>{task.Task_plan ? task.Task_plan : "No plan"}</div>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-700 text-sm">
                                                    <span className="font-bold">ID:</span> {task.Task_id}
                                                </span>
                                                <span className="text-gray-700 text-sm">
                                                <span className="font-bold">Owner:</span> {task.Task_owner}
                                                </span>
                                            </div>
                                            <div><TaskModal Task_name={task.Task_name} Task_description={task.Task_description} Task_notes={task.Task_notes} Task_id={task.Task_id} Task_plan={task.Task_plan} Task_app_Acronym={task.Task_app_Acronym} Task_state={task.Task_state} Task_creator={task.Task_creator} Task_owner={task.Task_owner} Task_createDate={task.Task_createDate}/></div>
                                        </div>
                                        
                                    </div>
                                ))}
    
                        </div>
    
                    </div>
                </div>
                
            </>
         );
    }

}

export default PlanOverview;