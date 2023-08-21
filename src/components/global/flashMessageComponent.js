import React, { useEffect, useContext, useReducer, useState } from "react";
import { Link } from "react-router-dom";

//Context
import DispatchContext from "../../DispatchContext";


function FlashMessage(props) {

  const [show, setShow] = useState(true);

  //Context
  const srcDispatch = useContext(DispatchContext);

  //handle alert
  function handleAlert(e){
    setShow(false);

  }
  //set show to false
  function setShowToFalse(){
    setShow(false);
  }

  useEffect(()=>{
    setTimeout(setShowToFalse, 2000);
  },[show==true])

  
  if(show){
    return (
      <>

        <div key={props.index} id="alert-1" class="fixed bottom-0 right-0 mb-5 mr-4 p-4 bg-blue-500 text-white rounded-lg shadow-lg flex">
          {props.messages}
        </div>
         
        
      </>
      
    )
  }
}

export default FlashMessage;
