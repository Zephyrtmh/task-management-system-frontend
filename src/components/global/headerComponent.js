import React, { useEffect, useContext, useReducer, useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import Axios from "axios";

//Import contexts
import StateContext from "../../StateContext";
import DispatchContext from "../../DispatchContext";
import FunctionContext from "../../FunctionContext";

function Header() {
 
  const srcContext = useContext(StateContext);
  const srcDispatch = useContext(DispatchContext);
  const srcFunction = useContext(FunctionContext);
  const navigate = useNavigate();

  //Logout
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

  return (
    <>
      <nav className="navbar">
        <div className="logo"><Link to="/">TMS</Link></div>

        <ul className="nav-links">

          <div className="menu">
            {srcContext.logIn ? <li><Link to="/application-management">Application management</Link></li> : ""}
            {srcContext.isAdmin ? <li><Link to="/user-management">User management page</Link></li> : ""}

            {srcContext.logIn ? <li><Link to="/profile">Profile</Link></li> : ""}


            <li>
              {srcContext.logIn ? <button onClick={logoutFunc}>Logout</button> : <Link to="/login">Login</Link>}
            </li>

          </div>
        </ul>
      </nav>
    </>
  );
}

export default Header