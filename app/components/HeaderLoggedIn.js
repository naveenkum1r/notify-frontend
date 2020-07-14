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
        <img src={`http://localhost:5000/uploads/posts/` + appState.user.avatar || "http://localhost:5000/uploads/posts/photo_5f0b0ad986d7bb37348c35bf.png"} />
        <div> {appState.user.name.split(" ")[0]} </div>
      </Link>
    </>
  )
}

export default HeaderLoggedIn


