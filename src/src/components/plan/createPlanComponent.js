import React, { useEffect, useContext, useReducer, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom";
import Axios from "axios";

//context
import StateContext from "../../StateContext";
import DispatchContext from "../../DispatchContext";

function CreatePlan() {

    //react useLocation to get the state and retrieve the app acronym
    const {state} = useLocation();

    //required variables 
    const [planName, setPlanName] = useState();
    const [acronym, setAcronym] = useState();
    const [planStartDate, setPlanStartDate] = useState();
    const [planEndDate, setPlanEndDate] = useState();
    const [planColour, setPlanColour] = useState("#000000");
    const [appStartDate, setAppStartDate] = useState();
    const [appEndDate, setAppEndDate] = useState();
    const [gn, setGn] = useState();

    //navigate
    const navigate = useNavigate();

    //Navigate to previous page
    async function backPrev(){
      return navigate("/plan-management", {state:{acronym:acronym}});
    }

    //handle submit
    async function onSubmit(e){
      e.preventDefault();
      
      //create plan
      try{
        const result = await Axios.post("http://localhost:8080/create-plan", {planName, startDate:planStartDate, endDate:planEndDate, appAcronym:acronym, colour:planColour, un:srcState.username, gn}, {withCredentials:true});

        if(result.data.success){
          //Display message
          srcDispatch({type:"flashMessage", value:"Plan created"});

          //Clear fields
          setPlanName("");
          setPlanStartDate("");
          setPlanEndDate("");
          setPlanColour("#000000");
          document.getElementById("planName").value ="";
          document.getElementById("startdate").value ="";
          document.getElementById("enddate").value ="";
          document.getElementById("planColour").value ="";
          return navigate("/create/plan", {state:{acronym:acronym}});
        }
      }
      catch(err){

        //console.log(err.response.data.err.code)
        if(err.response.data.message === "missing input"){
          srcDispatch({type:"flashMessage", value:"Missing input"});
        }
        else if(err.response.data.message === "invalid end date"){
          srcDispatch({type:"flashMessage", value:"Invalid end date"});
        }
        else if(err.response.data.message === "invalid application"){
          srcDispatch({type:"flashMessage", value:"Invalid application"});
        }
        else if(err.response.data.message === "date invalid"){
          srcDispatch({type:"flashMessage", value:"Plan start and end date must be in application start and end date"});
        }
        else if(err.response.data.message === "not authorized"){
          srcDispatch({type:"flashMessage", value:"Not authorized"});
          navigate(-1);
        }
        else if(err.response.data.err.code === "ER_DUP_ENTRY"){
          srcDispatch({type:"flashMessage", value:"Plan name exist"});
        }
        else{
          srcDispatch({type:"flashMessage", value:"Create plan error"});
        }

      }
    }

    //check if app exist 
    async function checkApp(){
      if(!state.acronym){
        navigate(-1);
      }
      
      //get app 
      const appResult = await Axios.post("http://localhost:8080/get-application", {acronym:state.acronym},{withCredentials:true});
      if(!appResult.data.success){
        srcDispatch({type:"flashMessage", value:"Invalid app acronym"});
        navigate(-1);
      }
      setGn(appResult.data.apps[0].App_permit_Open);
    }

    //context 
    const srcState = useContext(StateContext);
    const srcDispatch = useContext(DispatchContext);

    //useEffect
    useEffect(()=>{

      const getUserInfo = async()=>{
        //Check if state is null
          if(state == null){
            return navigate(-1)
          }
          if(!state.aOpen || state.aOpen == null){
            return navigate(-1)
          }
          if(!state.appStartDate || state.appStartDate == null){
            return navigate(-1)
          }
          if(!state.appEndDate || state.appEndDate == null){
            return navigate(-1)
          }
          //Get user info
          const res = await Axios.post("http://localhost:8080/authtoken/return/userinfo", {},{withCredentials:true});
          if(res.data.success){
            if(res.data.status == 0) navigate("/login");
              srcDispatch({type:"login", value:res.data, admin:res.data.groups.includes("admin")});
              setAcronym(state.acronym);
              //Set app start date and end date
              setAppStartDate(state.appStartDate);
              setAppEndDate(state.appEndDate);
          }else{
            navigate("/")
          }
      }
      getUserInfo();
    }, [])

    useEffect(()=>{
      if(srcState.username != "nil"){
        checkApp();
      }
    }, [srcState.username]);

  return (
    <>
      <div className="container mx-auto mt-5">
          <div className="mb-4">
              <h1 className="text-xl font-bold">Create plan for Application: {acronym? acronym : null}</h1>
          </div>
          <form onSubmit={onSubmit}>
              <div class="mb-6">
                  <label for="planName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Plan name</label>
                  <input type="text" onChange={(e)=>setPlanName(e.target.value)} id="planName" pattern="^[a-zA-Z0-9_ ]+$" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Plan name (No special charcters)" required />
              </div>
              <div className="mb-6 grid lg:grid-cols-3 gap-4 grid-cols-1">
                  <div>
                      <label for="startdate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Plan start date</label>
                      <input type="date" min={appStartDate} max={appEndDate} id="startdate" onChange={(e)=>setPlanStartDate(e.target.value)} placeholder="mm/dd/yyyy" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                      <p className="text-sm">Application start date: {appStartDate} </p>
                  </div>
                  <div>
                      <label for="enddate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Plan end date</label>
                      <input type="date" min={planStartDate} max={appEndDate} id="enddate" onChange={(e)=>setPlanEndDate(e.target.value)} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                      <p className="text-sm">Application start date: {appEndDate}</p>
                  </div>
                  <div>
                    <label for="planColour" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Plan colour</label>
                    <input type="color" onChange={(e)=>setPlanColour(e.target.value)} id="planColour" className="w-full h-11"required />
                  </div>
                  
              </div>

              <button type="button" onClick={backPrev} className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-blue-800 mr-5">Cancel</button>
              <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
          </form>
      </div>
    </>
  )
}

export default CreatePlan