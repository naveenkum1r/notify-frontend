import React, { useEffect, useContext } from "react"
import { useImmer } from "use-immer"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import TimeAgo from "javascript-time-ago"
import en from "javascript-time-ago/locale/en"
import Axios from "axios"

function Post(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const [state, setState] = useImmer({
    post: props.post,
    clicklike: 0,
    liked: false
  })

  TimeAgo.addLocale(en)
  const timeAgo = new TimeAgo("en-IN")

  function handlelike(e) {
    if (appState.loggedIn) {
      setState((draft) => {
        draft.clicklike++
      })
    }
    else {
      appDispatch({ type: "flashMessage", data: { type: "alert", body: "Please login to like post" } })
    }
  }

  useEffect(() => {
    async function retirevelike() {
      const response2 = await Axios.get("/api/v1/posts/" + state.post._id + "/" + appState.user._id + "/likes", { headers: { 'Authorization': `Bearer ` + appState.user.token } })
      if (response2.data.data) {
        setState((draft) => {
          draft.liked = true
        })
      }
    }
    if (appState.loggedIn) {
      retirevelike()
    }
  }, [])

  useEffect(() => {
    if (state.clicklike > 0) {
      setState((draft) => {
        draft.liked = !draft.liked
      })
      const ourRequest = Axios.CancelToken.source()
      if (!state.liked) {
        //like post
        async function likepost() {
          try {
            const response = await Axios.post("/api/v1/posts/" + state.post._id + "/likes", { author: appState.user._id }, { headers: { 'Authorization': `Bearer ` + appState.user.token, 'Content-Type': 'application/json' } }, { cancelToken: ourRequest.token })
            setState(draft => {
              draft.liked = true
              draft.post.likesCount++
            })
          } catch (e) {
            console.log("there was a problem or the request was cancelled")
          }
        }
        likepost()
      }
      else {
        //dislike post
        async function unlike() {
          const response2 = await Axios.delete("/api/v1/posts/" + state.post._id + "/" + appState.user._id + "/likes", { headers: { 'Authorization': `Bearer ` + appState.user.token } })
          if (response2.data.success) {
            setState((draft) => {
              draft.liked = false
              draft.post.likesCount--
            })
          }
        }
        unlike()
      }
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.clicklike])

  let locationsource = `https://maps.google.com/maps?q=` + state.post.location.coordinates[0] + `%20` + state.post.location.coordinates[1] + `&t=&z=11&ie=UTF8&iwloc=&output=embed`

  return (
    <>
      <div className="card" >
        <div className="profile">
          <div className="profile-photo">
            <img src={(process.env.BACKENDURL || "https://locnotify.herokuapp.com") + `/uploads/posts/` + state.post.authorinfo[0].photo} />
          </div>
          <div className="profile-name">
            <div className="profile-name-name">{state.post.authorinfo[0].name}</div>
            <div className="time">{timeAgo.format(new Date(state.post.createdAt))}</div>
          </div>
        </div>
        <div className="content">
          <p>{state.post.body}</p>
        </div>
        {state.post.photo && state.post.photo != "no-photo.jpg" && (
          <div className="imgbox">
            <img src={(process.env.BACKENDURL || "https://locnotify.herokuapp.com") + `/uploads/posts/` + state.post.photo} />
          </div>
        )}
        <div className="number-section">
          <div className="hearts">{state.post.likesCount} {state.post.likesCount > 1 ? "likes" : "like"}</div>
        </div>
        <div className="button-section">
          <div onClick={handlelike} key={state.liked + state.post._id} className="heart-button">
            <i className={state.liked ? `fas fa-heart red` : `far fa-heart`}></i>
            <div>{state.liked ? "Unlike" : "Like"}</div>
          </div>
          <div onClick={(e) => {
            appDispatch({
              type: "modalMessage", data: (
                <div id="map" className="gmap_canvas">
                  <iframe height="300" width="300" id="gmap_canvas" src={locationsource} frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"></iframe>
                </div>
              )
            })
          }} className="map-button">
            <i className="fas fa-map-marker-alt"></i>
            <div>Location</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Post