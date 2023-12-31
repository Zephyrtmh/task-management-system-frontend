import React, { useEffect, useContext, useReducer, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import Axios from "axios"

//context
import StateContext from "../../StateContext"
import DispatchContext from "../../DispatchContext"

//Import components
import Modal from "../global/modalComponent"
import PermitModal from "../global/permitModalComponent"

function AppOverview() {
  //navigate
  const navigate = useNavigate()

  //useState fields
  const [applications, setApps] = useState([])

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

    //Get application
    async function getApplication(){
        try{
            const appResult = await Axios.post('http://localhost:8080/getAllApplication', {un:srcState.username}, {withCredentials:true});
            if(appResult.data.success){
                setApps(appResult.data.applications);
            }
            else{
                srcDispatch({type:"flashMessage", value:"Error in getting groups"});
            }
        }
        catch(e){
            console.log(e)
            //srcDispatch({type:"flashMessage", value:"Error in getting groups"});
        }
    }


  //context
  const srcState = useContext(StateContext)
  const srcDispatch = useContext(DispatchContext)

    //useEffect
    useEffect(()=>{
        const getUserInfo = async()=>{
            try{
                const res = await Axios.post("http://localhost:8080/authtoken/return/userinfo", {},{withCredentials:true});
                if(res.data.success){
                    if(res.data.status == 0) navigate("/login");
                    srcDispatch({type:"login", value:res.data, admin:res.data.groups.includes("admin"), isPL:res.data.groups.includes("project leader")});
                    
                }
                else{
                    logoutFunc()
                    navigate("/")
                }
            }
            catch(err){
                if(err.response.data.message === "invalid token"){
                    srcDispatch({type:"flashMessage", value:"Please login first.."})
                    navigate("/login")
                }
                navigate("/login")
            }
        }
        getUserInfo()  
  }, [])

  useEffect(() => {
    getApplication()
    console.log(srcState.isPL)
  }, [srcState.username])

  return (
    <>
      <div className="container mx-auto mt-5">
        <div className="container flex justify-between px-5">
          <div className="mb-4">
            <h1 className="text-xl font-bold">Applications</h1>
          </div>
          {srcState.isPL ? (
            <div>
              <Link className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-full" to={"/create/application"}>
                Create application
              </Link>
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="flex flex-col">
          <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
              <div className="overflow-hidden">
                <table className="min-w-full text-left text-sm font-light">
                  <thead className="border-b font-medium dark:border-neutral-500">
                    <tr>
                      <th scope="col" className="px-6 py-4">
                        App_Acronym
                      </th>
                      <th scope="col" className="px-6 py-4">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-4">
                        Running number
                      </th>
                      <th scope="col" className="px-6 py-4">
                        Start date
                      </th>
                      <th scope="col" className="px-6 py-4">
                        End date
                      </th>
                      <th scope="col" className="px-6 py-4">
                        Application permits
                      </th>

                      <th scope="col" className="px-6 py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app, index) => (
                      <tr key={index} className="hover:bg-stone-300 border-b dark:border-neutral-500">
                        <td className="px-6 py-4 font-medium">{app.app_Acronym}</td>
                        <td className="px-6 py-4">
                          <Modal description={app.app_Description} index={index} appName={app.app_Acronym} />
                        </td>
                        <td className="px-6 py-4">{app.app_Rnumber}</td>
                        <td className="px-6 py-4">{new Date(app.app_startDate).toISOString().substr(0, 10)}</td>

                        <td className="px-6 py-4">{new Date(app.app_endDate).toISOString().substr(0, 10)}</td>

                        <td className="px-6 py-4">
                          <PermitModal
                            appName={app.app_Acronym}
                            open={app.app_permit_Open}
                            create={app.app_permit_Create}
                            todo={app.app_permit_toDoList}
                            doing={app.app_permit_Doing}
                            done={app.app_permit_Done}
                          />
                        </td>

                        <td className="px-6 py-4">
                          {srcState.isPL && (
                            <Link
                              type="button"
                              class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                              to={"/edit-application"}
                              state={{ acronym: app.app_Acronym }}
                            >
                              Edit
                            </Link>
                          )}

                          <Link
                            type="button"
                            class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                            to={"/plan-management"}
                            state={{ acronym: app.app_Acronym }}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AppOverview
