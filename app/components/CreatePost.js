import React, { useEffect, useContext, useRef } from "react"
import { useImmerReducer } from "use-immer"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import Axios from "axios"
import { withRouter } from "react-router-dom"
import io from "socket.io-client"

import Page from "./Page"

function CreatePost(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  var socket
  const profilesource = (process.env.BACKENDURL || "https://locnotify.herokuapp.com") + `/uploads/posts/` + appState.user.avatar || (process.env.BACKENDURL || "https://locnotify.herokuapp.com") + `/uploads/posts/no-photo.jpg`
  const initialState = {
    text: {
      hasErrors: false,
      value: ""
    },
    image: {
      hasErrors: false,
      isLoading: false,
      value: "",
      text_value: ""
    },
    sent: {
      hasErrors: false,
      isLoading: false,
      sentcount: 0
    }
  }
  function ourReducer(draft, action) {
    switch (action.type) {
      case "updatetext":
        draft.text.value = action.data
        break
      case "texthaserrors":
        draft.text.hasErrors = true
        break
      case "textnoerrors":
        draft.text.hasErrors = false
        break
      case "updateImage":
        draft.image.isLoading = true
        draft.image.hasErrors = false
        draft.image.value = action.data
        break
      case "ImageUpdated":
        draft.image.isLoading = false
        draft.image.text_value = action.data
        break
      case "Imagehaserrors":
        draft.image.value = ""
        draft.image.hasErrors = true
        break
      case "sending":
        draft.sent.isLoading = true
        draft.sent.sentcount++
        break
      case "sent":
        draft.sent.isLoading = false
        break
      case "senthaserrros":
        draft.sent.hasErrors = false
        break
      case "deletepreviewimage":
        draft.image.hasErrors = false
        draft.image.isLoading = false
        draft.image.value = ""
        draft.image.text_value = ""
        break
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.text.value.length > 500) {
      dispatch({ type: "texthaserrors" })
      appDispatch({ type: "flashMessage", data: { type: "danger", body: "Post can't have more than 500 characters" } })
    }
    else {
      dispatch({ type: "textnoerrors" })
    }
  }, [state.text.value])

  useEffect(() => {
    if (state.image.value) {
      var formdata = new FormData()
      formdata.append("file", state.image.value)
      async function updateimage() {
        try {
          const response = await Axios.post("/api/v1/photo", formdata, { headers: { 'Authorization': `Bearer ` + appState.user.token, 'Content-Type': state.image.value.type } })
          response.data.success ? dispatch({ type: "ImageUpdated", data: response.data.data }) : dispatch({ type: "Imagehaserrors" })
        }
        catch (err) {
          appDispatch({ type: "flashMessage", data: { type: "danger", body: "Unable to get upload image. Try again!" } })
          dispatch({ type: "Imagehaserrors" })
        }
      }
      updateimage()
    }
  }, [state.image.value])

  useEffect(() => {
    if (Boolean(state.text.value) && state.sent.sentcount && !state.image.hasErrors && !state.text.hasErrors) {
      async function sendpost() {
        try {
          const response = await Axios.post("/api/v1/posts/", { body: state.text.value, photo: state.image.text_value, location: appState.user.location }, { headers: { 'Authorization': `Bearer ` + appState.user.token, 'Content-Type': 'application/json' } })
          response.data.success ? dispatch({ type: "sent" }) : dispatch({ type: "senthaserrros" })
          socket = io.connect(process.env.BACKENDURL || "https://locnotify.herokuapp.com")
          socket.on("postfromserver", data => {
            console.log(data.message)
          })
          socket.emit("postfrombrowser", { message: { type: "addpost", value: response.data.data }, token: appState.user.token })
          appDispatch({ type: "flashMessage", data: { type: "ok", body: "Post Successfull!" } })
          props.history.push("/")
        }
        catch (err) {
          dispatch({ type: "senthaserrros" })
          appDispatch({ type: "flashMessage", data: { type: "danger", body: "Unable to post now. Try Later!" } })
        }
      }
      sendpost()
    }
  }, [state.sent.sentcount])

  return (
    <Page title="Write a post">
      <div className="card-center">
        <div className="full">
          <div className="post-profile-pic">
            <img src={profilesource} />
            <div>
              {appState.user.name}
            </div>
          </div>
          <textarea onChange={(e) => dispatch({ type: "updatetext", data: e.target.value })} autoFocus placeholder="Please Write your post here." value={state.text.value}></textarea>
          <div className="post-bottom">
            <div className="image-upload-button">
              <label className="hand-cursor">
                <input onChange={(e) => dispatch({ type: "updateImage", data: e.target.files[0] })} id="uploadCaptureInputFile" type="file"
                  accept="image/*" className="hide" />
                <i className="fa fa-camera"></i>
                <span>Add image</span>
              </label>
              <div className={Boolean(state.image.value) ? "preview-image" : "hide"}>
                <img id="preview-image-image" src={Boolean(state.image.value) ? URL.createObjectURL(state.image.value) : ""} alt="your image" />
                <span onClick={(e) => dispatch({ type: "deletepreviewimage" })} ><i id="close-button" className="fa fa-times"></i></span>
              </div>
            </div>
            <div onClick={(e) => { dispatch({ type: "sending" }) }} className="post-button">
              Add Post<i className="fa fa-paper-plane"></i>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default withRouter(CreatePost)