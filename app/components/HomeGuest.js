import React, { useEffect, useContext, useRef } from "react"
import { useImmer } from "use-immer"
import Axios from "axios"
import Page from "./Page"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"
import TimeAgo from "javascript-time-ago"
import en from "javascript-time-ago/locale/en"
import Post from "./Post"
import io from "socket.io-client"

function HomeGuest() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  var socket

  TimeAgo.addLocale(en)
  const timeAgo = new TimeAgo("en-IN")

  const [state, setState] = useImmer({
    page: 1,
    isLoading: true,
    feed: [],
    feedfinished: false,
    feedloading: false
  })

  window.onscroll = function (ev) {
    if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
      if (!state.feedloading && !state.feedfinished) {
        setState((draft) => { draft.feedloading = true; draft.page++ })
      }
    }
  };

  useEffect(() => {
    console.log(appState.user.location.coordinates[0])
    if (!appState.user.location.coordinates[0]) {

      console.log("start ran and find location")
      try {
        navigator.geolocation.getCurrentPosition((position) => {
          appDispatch({
            type: "setLocation",
            data: {
              type: "Point",
              coordinates: [position.coords.latitude, position.coords.longitude],
            },
          })
        })
      } catch (err) {
        console.log("permissions were denied")
      }
    }
    socket = io.connect(process.env.BACKENDURL || "http://localhost:5000")
    socket.on("postfromserver", (message) => {
      if (message.message.type == "addpost") {
        setState((draft) => {
          draft.feed.unshift(message.message.value)
        })
      }
    })
    return () => {
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchdata() {

      console.log("Page ran")
      try {
        const response = await Axios.post("/api/v1/posts/radius?page=" + state.page, { lng: Boolean(appState.user.location.coordinates[0]) ? appState.user.location.coordinates[0] : currentlatitude, lat: Boolean(appState.user.location.coordinates[1]) ? appState.user.location.coordinates[1] : currentlongitude, distance: appState.userpostradius * 1000 }, { headers: { "Content-Type": "application/json" } }, { cancelToken: ourRequest.token })
        setState((draft) => { draft.feedloading = false })
        if (!response.data.pagination.next) {
          setState((draft) => {
            draft.feedfinished = true
          })
          appDispatch({ type: "flashMessage", data: { type: "alert", body: "That's all for now" } })
        }
        setState((draft) => {
          draft.isLoading = false
          response.data.data.map((post) => {
            draft.feed.push(post)
          })
        })
      } catch (e) {
        console.log("there was a problem or the request was cancelled")
      }
    }
    if (!state.feedfinished && appState.user.location.coordinates[0] && state.page > 1) {
      fetchdata()
    }
    return () => {
      ourRequest.cancel()
    }
  }, [state.page])

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchdata() {

      console.log("location ran with value of" + appState.user.location.coordinates[0])
      try {
        const response = await Axios.post("/api/v1/posts/radius?page=" + state.page, { lng: Boolean(appState.user.location.coordinates[0]) ? appState.user.location.coordinates[0] : currentlatitude, lat: Boolean(appState.user.location.coordinates[1]) ? appState.user.location.coordinates[1] : currentlongitude, distance: appState.userpostradius * 1000 }, { headers: { "Content-Type": "application/json" } }, { cancelToken: ourRequest.token })
        if (!response.data.pagination.next) {
          setState((draft) => {
            draft.feedfinished = true
          })
        }
        setState((draft) => {
          draft.isLoading = false
          draft.feed = response.data.data
        })
      } catch (e) {
        console.log("there was a problem or the request was cancelled")
      }
    }
    if (!state.feedfinished && appState.user.location.coordinates[0]) {
      fetchdata()
    }
    return () => {
      ourRequest.cancel()
    }
  }, [appState.user.location.coordinates[0]])

  return (
    <Page title="Welcome">
      <div className="container">
        {state.feed.length > 0 && (
          <>
            {state.feed.map((post, index) => {
              return (
                <Post index={index} post={post} key={post._id} />
              )
            })}
          </>
        )}
      </div>
      {!state.feedfinished ? (<div className="spinner">
        <div className="bounce1"></div>
        <div className="bounce2"></div>
        <div className="bounce3"></div>
      </div>) : "That's all for now."}
    </Page>
  )
}

export default HomeGuest
