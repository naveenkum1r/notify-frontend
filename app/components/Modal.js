import React, { useEffect, useContext } from "react"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function Modal() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  return (
    <div id="myModal" className={appState.modalMessages.length ? "modal" : "hide"}>
      <div className="modal-content">
        <span onClick={(e) => { appDispatch({ type: "removeModalMessage" }) }} className="close">&times;</span>
        {appState.modalMessages[0]}
      </div>

    </div>
  )
}

export default Modal