import React, { useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import ReactTooltip from "react-tooltip"

import StateContext from "../StateContext"

function HeaderLoggedOut() {
  const appState = useContext(StateContext)

  return (
    <>
      <Link to={"/login"} className="nav-profile">
        <img src="https://locnotify.herokuapp.com/uploads/posts/no-photo.jpg" />
        <div> Log In  </div>
      </Link>
    </>
  )
}

export default HeaderLoggedOut


