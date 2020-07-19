import React, { useEffect, useContext } from "react"
import { useParams, Link, withRouter } from "react-router-dom"
import { useImmerReducer } from "use-immer"
import Axios from "axios"

import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import Page from "./Page"

function EditPost(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const profilesource = (process.env.BACKENDURL || "https://locnotify.herokuapp.com") + `/uploads/posts/` + appState.user.avatar || (process.env.BACKENDURL || "https://locnotify.herokuapp.com") + `/uploads/posts/no-photo.jpg`
  const initialState = {
    id: useParams().id,
    author: "",
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
      case "updateinit":
        draft.text.value = action.data.data.body
        draft.image.text_value = action.data.data.photo
        draft.author = action.data.data.author
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchdata() {
      try {
        const response = await Axios.get("/api/v1/posts/" + state.id, { cancelToken: ourRequest.token })
        dispatch({ type: "updateinit", data: response.data })
      } catch (e) {
        console.log("there was a problem or the request was cancelled")
        appDispatch({ type: "flashMessage", data: { type: "danger", body: "Unable to get post details" } })
      }
    }
    if (!state.feedfinished && appState.user.location.coordinates[0]) {
      fetchdata()
    }
    return () => {
      ourRequest.cancel()
    }
  }, [])
  useEffect(() => {
    if (state.text.value.length > 500) {
      dispatch({ type: "texthaserrors" })
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
          appDispatch({ type: "flashMessage", data: { type: "danger", body: "Image was not uploaded. Try again!" } })
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
          const response = await Axios.put("/api/v1/posts/" + state.id, { body: state.text.value, photo: state.image.text_value }, { headers: { 'Authorization': `Bearer ` + appState.user.token, 'Content-Type': 'application/json' } })
          response.data.success ? dispatch({ type: "sent" }) : dispatch({ type: "senthaserrros" })
          appDispatch({ type: "flashMessage", data: { type: "ok", body: "Post was updated!" } })
          props.history.push("/")
        }
        catch (err) {
          dispatch({ type: "senthaserrros" })
          appDispatch({ type: "flashMessage", data: { type: "danger", body: "Something went wrong!" } })
        }
      }
      sendpost()
    }
  }, [state.sent.sentcount])

  return (
    <Page title="Edit Post">
      <div className="card-center">
        <div className="full">
          <Link to={"/"}> « Go back to Homepage </Link>
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
              <div className={Boolean(state.image.value) || (Boolean(state.image.text_value) && state.image.text_value != "no-photo.jpg") ? "preview-image" : "hide"}>
                <img id="preview-image-image" src={Boolean(state.image.value) ? URL.createObjectURL(state.image.value) : Boolean(state.image.text_value) ? (process.env.BACKENDURL || "https://locnotify.herokuapp.com") + `/uploads/posts/` + state.image.text_value : ""} alt="your image" />
                <span onClick={(e) => dispatch({ type: "deletepreviewimage" })} ><i id="close-button" className="fa fa-times"></i></span>
              </div>
            </div>
            <div onClick={(e) => dispatch({ type: "sending" })} className="post-button">
              Update<i className="fa fa-paper-plane"></i>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default withRouter(EditPost)