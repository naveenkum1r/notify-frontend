import React, { useEffect, useContext } from "react"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"

function FlashMessage(props) {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  return (
    <>
      {props.messages.map((msg, index) => {
        return (
          <div key={index} className={`flashmessage ` + msg.type}>
            <p> {msg.body} </p>
          </div>
        )
      })}
    </>
  )
}

export default FlashMessage