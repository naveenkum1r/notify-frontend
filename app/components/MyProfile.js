import React, { useEffect, useContext } from "react"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import Axios from "axios"
import { Link, withRouter } from "react-router-dom"

import Page from "./Page"

function MyProfile() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  let locationsource = `https://maps.google.com/maps?q=` + appState.user.location.coordinates[0] + `%20` + appState.user.location.coordinates[1] + `&t=&z=11&ie=UTF8&iwloc=&output=embed`
  let profilesource = (process.env.BACKENDURL || "http://localhost:5000") + `/uploads/posts/` + appState.user.avatar || (process.env.BACKENDURL || "http://localhost:5000") + `/uploads/posts/no-photo.jpg`

  async function handledpupload(e) {
    e.preventDefault()
    if (e.target.files[0]) {
      var formdata = new FormData()
      formdata.append("file", e.target.files[0])
      try {
        const response = await Axios.put("/api/v1/auth/photo", formdata, { headers: { 'Authorization': `Bearer ` + appState.user.token, 'Content-Type': e.target.files[0].type } })
        appDispatch({ type: "updateprofilepicture", data: response.data })
        console.log("dp upload successfull")
      }
      catch (err) {
        console.log("error happened during dp upload")
      }
    }
  }

  async function handlelocationupdate(e) {
    e.preventDefault()
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          appDispatch({
            type: "setLocation", data: {
              type: "Point",
              coordinates:
                [position.coords.latitude, position.coords.longitude
                ]
            }
          })
          try {
            const response = await Axios.put("/api/v1/auth/updatedetails", appState.user.location, { headers: { 'Authorization': `Bearer ` + appState.user.token } })
            console.log(response.data.success)
          }
          catch (err) {
            console.log(err)
          }
        })
    }
    catch (err) {
      console.log("permissions were denied")
    }
  }



  useEffect(() => {
    locationsource = `https://maps.google.com/maps?q=` + appState.user.location.coordinates[0] + `%20` + appState.user.location.coordinates[1] + `&t=&z=11&ie=UTF8&iwloc=&output=embed`
  }, [appState.user.location])

  useEffect(() => {
    profilesource = (process.env.BACKENDURL || "http://localhost:5000") + `/uploads/posts/` + appState.user.avatar || (process.env.BACKENDURL || "http://localhost:5000") + `/uploads/posts/no-photo.jpg`
  }, [appState.user.avatar])

  return (
    <Page title={appState.user.name}>
      <div className="card-center">
        {appState.loggedIn && (
          <>
            <div className="profile-profile-picture">
              <img id="profile-image" src={profilesource} />
              <label>
                <input onChange={handledpupload} className="hide" type="file" accept="image/gif, image/jpeg, image/png" />
                <i className="fa fa-camera"></i>
              </label>
            </div>
            <div className="name">
              {appState.user.name}
            </div>
          </>
        )}
        <div className="pane">
          <div className="left-pane">
            <div id="map" className="gmap_canvas"><iframe height="300" width="300" id="gmap_canvas"
              src={locationsource}
              frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"></iframe>
            </div>
            <div className="location-name">Your Default location</div>
            <div className="value">{appState.userpostradius} Km</div>
            <input onChange={(e) => appDispatch({ type: "setPostRadius", data: e.target.value })} id="range" type="range" min="0.5" max="10" step="0.5" value={appState.userpostradius} />
            <div className="set-locaton-name">Range of posts in your feed</div>
          </div>
          <div className="right-pane">
            {appState.loggedIn ? (<> <div className="view-my-post">View my posts</div>
              <div onClick={handlelocationupdate} className="set-current-location">Set current location as default location</div>
              <div className="change-password">Change password</div>
              <div onClick={(e) => appDispatch({ type: "logout" })} className="log-out"><Link to={"/"}  >Log Out</Link>
              </div></>) : (<>
                <Link to={"/login"} className="log-out">Log In</Link>
              </>)}
          </div>
        </div>
      </div>
    </Page>
  )
}

export default MyProfile