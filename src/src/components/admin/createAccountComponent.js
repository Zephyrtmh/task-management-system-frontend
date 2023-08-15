import React, { useEffect, useContext, useReducer, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

//Context
import StateContext from "../../StateContext";
import DispatchContext from "../../DispatchContext";
import Axios from "axios";

function CreateAccount() {

    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [email, setEmail] = useState();
    const [allGroups, setAllGroups] = useState([]);
    const [groups, setGroups] = useState([]);
    const[status, setStatus] = useState(1);
    const navigate = useNavigate();

    //Contexts
    const srcDispatch = useContext(DispatchContext);
    const srcState = useContext(StateContext);

    //handleSubmit
    async function handleSubmit(e){
        e.preventDefault();
        try{
            const res = await Axios.post("http://localhost:3000/register", {username, password, email, groups, un:srcState.username, gn:"admin", status}, {withCredentials:true});
            if(res.data.success){
                srcDispatch({type:"flashMessage", value:"account created"});
                //Reset useState fields and reset input fields
                setUsername("");
                setPassword("");
                setEmail("");
                setGroups([]);
                setStatus(1);
                document.getElementById("floating_username").value ="";
                document.getElementById("floating_email").value ="";
                document.getElementById("floating_password").value ="";
                document.getElementById("groups_multiple").value ="";

                navigate("/create/account");
            }
        }
        catch(e){
          console.log(e.response.data.message)
          if(e.response.data.message === "Invalid password input"){
            srcDispatch({type:"flashMessage", value:"Invalid password, must contains 8 to 10 chars comprise of alphabets , numbers, and special character  "});
          }
          else if(e.response.data.message === "Invalid email input"){
            srcDispatch({type:"flashMessage", value:"Invalid email"});
          }
          else if(e.response.data.message === "Invalid username input"){
            srcDispatch({type:"flashMessage", value:"Invalid username"});
          }
          else{
            srcDispatch({type:"flashMessage", value:"Username taken, please try again..."});
          }
        }
    }

    //Get all groups
    async function getAllgroups(){
      const res = await Axios.post("http://localhost:3000/allgroups",{un:srcState.username, gn:"admin"},{withCredentials:true});
        if(res.data.success){
          setAllGroups(res.data.groups);
        }
    }

    //update selected group onChange
    function handleGroupChange(tt){
      const updatedOptions = [...tt.target.options].filter(option => option.selected)
      .map(x => x.value);
      console.log(updatedOptions);
      
      setGroups(updatedOptions);
  }

    //useEffect
    useEffect(()=>{
      const getUserInfo = async()=>{
        const res = await Axios.post("http://localhost:3000/authtoken/return/userinfo", {},{withCredentials:true});
        if(res.data.success){
            srcDispatch({type:"login", value:res.data, admin:res.data.groups.includes("admin")});
            if(!await res.data.groups.includes("admin")){
              return navigate("/")
            }
        }else{
          return navigate("/")
        }
      }
      getUserInfo();
        
    }, []);

    useEffect(()=>{
      if(srcState.isAdmin) getAllgroups();
    },[srcState.isAdmin])

  return (
    <>
        <h1 className="p-5">Create account (Admin only)</h1>
      <form className="p-5" onSubmit={handleSubmit}>
        <div className="relative z-0 w-full mb-6 group">
          <input
            type="text"
            name="floating_username"
            id="floating_username"
            className="block py-2.5 px-0 w-full text-sm text-stone-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-stone-900 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            onChange={(e)=>setUsername(e.target.value)}
            required
          />
          <label
            htmlFor="floating_username"
            className="peer-focus:font-medium absolute text-sm text-stone-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Username
          </label>
        </div>
        <div className="relative z-0 w-full mb-6 group">
          <input
            type="email"
            name="floating_email"
            id="floating_email"
            className="block py-2.5 px-0 w-full text-sm text-stone-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-stone-900 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            onChange={(e)=>setEmail(e.target.value)}
          />
          <label
            htmlFor="floating_email"
            className="peer-focus:font-medium absolute text-sm text-stone-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Email address
          </label>
        </div>
        <div className="relative z-0 w-full mb-6 group">
          <input
            type="password"
            name="floating_password"
            id="floating_password"
            className="block py-2.5 px-0 w-full text-sm text-stone-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-stone-900 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            onChange={(e)=>setPassword(e.target.value)}
            required
          />
          <label
            htmlFor="floating_password"
            className="peer-focus:font-medium absolute text-sm text-stone-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Password
          </label>
        </div>
        <div className="relative z-0 w-full mb-6 group">
          <label for="countries" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Status</label>
          <select id="countries" onChange={(e)=>{setStatus(e.target.value)}} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option value={1} selected>Active</option>
            <option value={0}>Disable</option>
          </select>
        </div>
        <div className="relative z-0 w-full mb-6 group">
          <label for="groups_multiple" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select group/s</label>
          <select multiple onChange={handleGroupChange} id="groups_multiple" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            {allGroups.map((group, index)=>(
              <option key={index} value={group.groupName}>{group.groupName}</option>
            ))}
          </select>
        </div>

        <Link to="/user-management" className="text-white bg-stone-500 hover:bg-stone-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-stone-600 dark:hover:bg-stone-700 dark:focus:ring-blue-800 mr-5">Cancel</Link>
       
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Submit
        </button>
      </form>
    </>
  );
}

export default CreateAccount;
