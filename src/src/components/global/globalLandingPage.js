import React, { useEffect, useContext, useReducer, useState } from "react"
import { Link, useNavigate } from "react-router-dom";

//Context
import StateContext from "../../StateContext";
import DispatchContext from "../../DispatchContext";
import Axios from "axios";


function GlobalLandingPage() {

    //context
    const srcState = useContext(StateContext);
    const srcDispatch = useContext(DispatchContext);
    const navigate = useNavigate();


    async function authorization(){
        if(srcState.logIn == false){
          srcDispatch({type:"flashMessage", value:"Unauthorized"});
          navigate("/")
        }
      }

    useEffect(()=>{
        const getUserInfo = async()=>{
            
            try{
                const res = await Axios.post("http://localhost:8080/authtoken/return/userinfo", {},{withCredentials:true});
                console.log("test login done success");
                if(res.data.success){
                    console.log("USERRR", res.data.status)
                    if(res.data.status == 0) logoutFunc();
                    //console.log("userstatus", res.data.status)
                    srcDispatch({type:"login", value:res.data, admin:res.data.groups.includes("admin"), isPL:res.data.groups.includes("project leader")});
                    srcDispatch({type:"testLogin"});
                    
                }
                else{
                    dispatch({type:"logout"})
                }
            }
            catch(e){
                console.log("test login done but got error");
                srcDispatch({type:"testLogin"});
            }
        }
        getUserInfo();
    }, [])

    useEffect(()=>{
        if(srcState.testLoginComplete) authorization();
      },[srcState.testLoginComplete])

    return ( 
        <>
            <div className="h-full">
                <h1>Welcome Global landing page</h1>
            </div>
        </>
     );
}

export default GlobalLandingPage;