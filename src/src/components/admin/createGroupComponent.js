import React, { useEffect, useContext, useReducer, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

//Context
import StateContext from "../../StateContext"
import DispatchContext from "../../DispatchContext"
import Axios from "axios"

import CreateAccount from "./createAccountComponent"

function CreateGroup() {
  const [allGroups, setAllGroups] = useState([])
  const [formGroup, setFormGroup] = useState("")

  //context
  const srcState = useContext(StateContext)
  const srcDispatch = useContext(DispatchContext)
  const navigate = useNavigate()

  //Handle Submit
  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const trimmedgroup = formGroup.trim()
      if (trimmedgroup.length === 0) {
        srcDispatch({ type: "flashMessage", value: "Enter group name" })
      } else {
        const res = await Axios.post("http://localhost:8080/createAccGroup", { groupName: trimmedgroup, un: srcState.username, gn: "admin" }, { withCredentials: true })
        if (res.data.success) {
          console.log("res ", res)
          srcDispatch({ type: "flashMessage", value: "Group created" })
          // setFormGroup("test");
          setFormGroup("")
          document.getElementById("groupName").value = ""
          getAllGroups()
        } else {
          srcDispatch({ type: "flashMessage", value: "Group exist, enter another group name" })
        }
      }
    } catch (e) {
      srcDispatch({ type: "flashMessage", value: "Error in creating group" })
    }
  }

  //Get all groups
  async function getAllGroups() {
    try {
      const res = await Axios.post("http://localhost:8080/getAllGroups", { un: srcState.username, gn: "admin" }, { withCredentials: true })
      if (res.data.success) {
        setAllGroups(res.data.groups)
      }
    } catch (e) {
      srcDispatch({ type: "flashMessage", value: "Error in getting users" })
    }
  }

  //useEffect
  useEffect(() => {
    if (srcState.isAdmin) getAllGroups()
  }, [srcState.isAdmin])

  return (
    <>
      <div className="grid grid-cols-4 md:grid-col-3">
        <div>
          <Link
            to="/create/account"
            className="m-3 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          >
            Create account
          </Link>
        </div>
        <div className="lg:visible"></div>
        <div>
          <span className="text-md block">All groups</span>
          <select multiple size={3} id="allgroups" className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-60 p-2.5">
            {allGroups.map((group, index) => (
              <option key={index}>{group}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="text-md block">Create group</span>
          <form onSubmit={handleSubmit}>
            <label htmlFor="groupName">Group name:</label>
            <input
              type="text"
              name="groupName"
              id="groupName"
              maxLength={100}
              onChange={e => setFormGroup(e.target.value)}
              className="px-2 py-1 placeholder-slate-300 text-slate-600 relative bg-white rounded text-sm border-2 mr-2 shadow outline-none focus:outline-none focus:ring"
            />
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 rounded-full text-sm">
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default CreateGroup
