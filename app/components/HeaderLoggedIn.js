import React, { useEffect, useContext } from "react"
import { Link } from "react-router-dom"

import StateContext from "../StateContext"

function HeaderLoggedIn() {
  const appState = useContext(StateContext)

  return (
    <>
      <Link to={"/createpost"} className="addpost">
        <div className="addpost-icon">
          <i className="fa fa-plus-square"></i>
        </div>
        <div className="addpost-text">
          Add Post
      </div>
      </Link>
      <Link to={"/myprofile"} className="nav-profile">
        <img src={(process.env.BACKENDURL || "https://locnotify.herokuapp.com") + `/uploads/posts/` + appState.user.avatar || (process.env.BACKENDURL || "https://locnotify.herokuapp.com") + `/uploads/posts/no-photo.jpg`} />
        <div> {appState.user.name.split(" ")[0]} </div>
      </Link>
    </>
  )
}

export default HeaderLoggedIn


