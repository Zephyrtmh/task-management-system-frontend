import React, { useEffect, useReducer, useState } from "react"
import ReactDom from "react-dom"
import ReactDomClient from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { useImmerReducer } from "use-immer"
import Axios from "axios"
import { useNavigate } from "react-router-dom"

//components
import Footer from "./components/global/footerComponent"
import Header from "./components/global/headerComponent"
import GlobalLandingPage from "./components/global/globalLandingPage"
import LoginForm from "./components/login/loginComponent"
import FlashMessage from "./components/global/flashMessageComponent"
import AccountsOverview from "./components/admin/accountsOverviewComponent"
import AdminEditUser from "./components/admin/adminEditUserComponent"
import CreateAccount from "./components/admin/createAccountComponent"
import CreateApp from "./components/application/createAppComponent"
import AppOverview from "./components/application/applicationOverviewComponent"
import EditApp from "./components/application/editAppComponent"
import PlanOverview from "./components/plan/planOverviewComponent"
import CreatePlan from "./components/plan/createPlanComponent"
import CreateTask from "./components/task/createTask"
import PlEditTask from "./components/task/plEditTask"
import PmEditTask from "./components/task/pmEditTask"
import TeamEditTask from "./components/task/teamEditTask"

//Tailwindcss
import "./main.css"

//Contexts
import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"
import FunctionContext from "./FunctionContext"
import MyProfile from "./components/profile/myProfileComponent"

function MainComponent() {
  const [logoutRedirect, setLogoutRedirect] = useState(false)

    //initState
    const initialState ={
        logIn: false,
        flashMessage : [],
        username: "nil",
        group: [],
        isAdmin : false,
        isPL: false,
        ableToAccessApp: true,
        testLoginComplete: false
    }

  //Reducer
  const [state, dispatch] = useImmerReducer(mainReducer, initialState)

    function mainReducer(draft, action){
        switch(action.type){
            case"login":
                draft.logIn = true;
                draft.username = action.value.username
                draft.isAdmin = action.admin
                draft.group = action.value.groups
                draft.isPL = action.isPL
                draft.ableToAccessApp = action.value.planAssoisated
                return
            case"logout":
                draft.logIn = false
                draft.isAdmin = false
                draft.isPL = false
                draft.isPM = false
                draft.isDev = false
                return
            case "flashMessage":                
                draft.flashMessage.push(action.value);
                return
            case "removeFlashMessage":
                draft.flashMessage = []
                return
            case "toogleAdmin":
                if(draft.isAdmin == true) draft.isAdmin = false
                else draft.isAdmin = true
                return
            case "testLogin":
                draft.testLoginComplete = true;
                return
        }
    }

    //Logout
    async function logoutFunc(){

        const logoutResult = await Axios.post("http://localhost:8080/logout", {}, {withCredentials: true});
        if(logoutResult.data.success){
        //Clear localstorage
        localStorage.clear();

        //Set useState logIn to false
        dispatch({type:"logout"});

        localStorage.removeItem('authToken');

        }
        //Clear localstorage
        localStorage.clear();

        //Set useState logIn to false
        dispatch({type:"logout"});

        //redirect to login
        //navigate("/login")

    }

    //useEffect
    useEffect(()=>{
        const getUserInfo = async()=>{
            
            try{
                const res = await Axios.post("http://localhost:8080/authtoken/return/userinfo", {},{withCredentials:true});
                console.log("test login done success");
                if(res.data.success){
                    if(res.data.status == 0) logoutFunc();
                    //console.log("userstatus", res.data.status)
                    dispatch({type:"login", value:res.data, admin:res.data.groups.includes("admin"), isPL:res.data.groups.includes("project leader")});
                    dispatch({type:"testLogin"});
                    
                }
                else{
                    dispatch({type:"logout"})
                }
            }
            catch(e){
                //console.log(e.response.status);
                // if(e.response.status == 403){
                    
                // }
                console.log("test login done but got error");
                dispatch({type:"testLogin"});
            }
        }
        getUserInfo();
    }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <Header />
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<GlobalLandingPage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/profile" element={<MyProfile />} />
              <Route path="/user-management" element={<AccountsOverview />} />
              <Route path="/admin/user/profile" element={<AdminEditUser />} />
              <Route path="/create/account" element={<CreateAccount />} />
              <Route path="/create/application" element={<CreateApp />} />
              <Route path="/application-management" element={<AppOverview />} />
              <Route path="/edit-application" element={<EditApp />} />
              <Route path="/plan-management" element={<PlanOverview />} />
              <Route path="/create/plan" element={<CreatePlan />} />
              <Route path="/create/task" element={<CreateTask />} />
              <Route path="/pl-update/task" element={<PlEditTask />} />
              <Route path="/pm-update/task" element={<PmEditTask />} />
              <Route path="/team-update/task" element={<TeamEditTask />} />
            </Routes>
          </div>
          {state.flashMessage.length != 0 ? state.flashMessage.map((alert, index) => <FlashMessage messages={alert} index={index} />) : null}
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

  const root = ReactDomClient.createRoot(document.querySelector("#app"))
  root.render(<MainComponent />)


if (module.hot) {
  module.hot.accept();
}