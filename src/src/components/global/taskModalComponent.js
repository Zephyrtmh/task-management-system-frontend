import React, { useEffect, useContext, useReducer, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom";
import Axios from "axios";


const TaskModal = (props) => {
  //Notes history 
  const [historyNotes, setHistoryNotes] = useState([]);

  const [showModal, setShowModal] = useState(false);

  useEffect(()=>{
    if(props.Task_notes){
      //Re-arranging the history notes
      var tempHistory = String(props.Task_notes).split("||");
      tempHistory = tempHistory.reverse()
      for(const k in tempHistory){
          setHistoryNotes(setHistoryNotes=>[...setHistoryNotes, String(tempHistory[k]).split("|")]);
      }
    }
  },[])

    return (
      <>
        <button type="button" class="bg-fuchsia-500 text-white active:bg-fuchsia-600 font-bold uppercase text-xs px-4 py-1 rounded-full shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 w-full hover:bg-fuchsia-700" onClick={() => setShowModal(true)}>View more</button>
        
        {showModal ? (
        <>
          <div
            key={props.index}
            className="justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none mt-2"
          >
            <div className="relative w-auto my-5 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <h3 className="text-3xl font-semibold">
                    {props.Task_name} | details
                  </h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className="relative p-6 flex-auto">
                  <p className="my-4 text-slate-500 text-lg leading-relaxed">
                    <span className="text-md font-semibold">Task ID: </span> {props.Task_id}
                  </p>
                  <p className="my-4 text-slate-500 text-lg leading-relaxed">
                    <span className="text-md font-semibold">Description: </span> {props.Task_description}
                  </p>
                  <p className="my-4 text-slate-500 text-lg leading-relaxed">
                    <span className="text-md font-semibold">Plan: </span> {props.Task_plan ? props.Task_plan : "NULL"}
                  </p>
                  <p className="my-4 text-slate-500 text-lg leading-relaxed">
                    <span className="text-md font-semibold">Application acronym: </span> {props.Task_app_Acronym}
                  </p>
                  <p className="my-4 text-slate-500 text-lg leading-relaxed">
                    <span className="text-md font-semibold">State: </span> {props.Task_state}
                  </p>
                  <p className="my-4 text-slate-500 text-lg leading-relaxed">
                    <span className="text-md font-semibold">Creator: </span> {props.Task_creator}
                  </p>
                  <p className="my-4 text-slate-500 text-lg leading-relaxed">
                    <span className="text-md font-semibold">Owner: </span> {props.Task_owner}
                  </p>
                  <p className="my-4 text-slate-500 text-lg leading-relaxed">
                    <span className="text-md font-semibold">Task created: </span> {new Date(props.Task_createDate).toISOString().substr(0,10)}
                  </p>
                </div>
                
                <div class="mb-4 md:flex md:flex-wrap md:justify-between">
                        <div class="container w-full px-4 sm:px-8">

                        <div class="flex flex-col">
                            <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div class="py-2 inline-block w-full sm:px-6 lg:px-8">

                                <div class="table-wrp block max-h-96">
                                <table class="w-full">
                                    <thead class="bg-white border-b sticky top-0">
                                    <tr>
                                        <th scope="col" class="text-md font-medium text-gray-900 pr-2 text-left">
                                        User
                                        </th>
                                        <th scope="col" class="text-md font-medium text-gray-900 pr-2 text-left">
                                        Task state
                                        </th>
                                        <th scope="col" class="text-md font-medium text-gray-900 text-left pr-2">
                                        Date & Time
                                        </th>
                                        <th scope="col" class="text-md font-medium text-gray-900 text-left pr-2">
                                        Notes
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody class="h-96 overflow-y-auto">
                                        {historyNotes.map((note, index)=>(
                                            <tr key={index} className="p-2">
                                                <td className="bg-stone-100">{note[0]}</td>
                                                <td>{note[1]}</td>
                                                <td className="bg-stone-100">{new Date(note[2]).toLocaleString('en-GB', {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "numeric",
                                                    minute: "2-digit"
                                                })}</td>
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



                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
      </>
    );
  };
  
  export default TaskModal;