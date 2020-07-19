import React, { useEffect, useContext } from "react"
import { useImmer } from "use-immer"
import { withRouter, Link } from "react-router-dom"
import Axios from "axios"
import Page from "./Page"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import TimeAgo from "javascript-time-ago"
import en from "javascript-time-ago/locale/en"

function ViewMyPost(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

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
    if (!appState.loggedIn) {
      props.history.push("/login")
    }
    const ourRequest = Axios.CancelToken.source()
    async function fetchdata() {
      try {
        const response = await Axios.get("/api/v1/posts/me?page=" + state.page, { headers: { Authorization: `Bearer ` + appState.user.token } }, { cancelToken: ourRequest.token })
        setState((draft) => { draft.feedloading = false })
        response.data.data.map((post) => {
          post.isMenuVisible = false;
        }
        )
        if (!response.data.pagination.next) {
          setState((draft) => {
            draft.feedfinished = true
          })
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
    if (!state.feedfinished && appState.loggedIn) {
      fetchdata()
    }
    return () => {
      ourRequest.cancel()
    }
  }, [state.page])

  async function deletepost(id, index) {
    try {
      const response = await Axios.delete("/api/v1/posts/" + id, { headers: { Authorization: `Bearer ` + appState.user.token } })
      if (response.data.success) {
        console.log("deleted successfully")
        setState((draft) => {
          draft.feed = draft.feed.filter((post) => { return post._id != id })
          appDispatch({ type: "flashMessage", data: { type: "alert", body: "Post deleted" } })
        })
      }
      else {
        appDispatch({ type: "flashMessage", data: { type: "danger", body: "unable to delete because the post might not exist or other reasons" } })
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  return (

    <Page title="My Posts">
      <div className="container">
        {state.feed.length > 0 && (
          <>
            {state.feed.map((post, index) => {
              return (
                <div className="card" post={post} key={post._id}>
                  <div className="profile">
                    <div className="profile-photo">
                      <img src={(process.env.BACKENDURL || "https://locnotify.herokuapp.com") + `/uploads/posts/` + appState.user.avatar} />
                    </div>
                    <div className="profile-name">
                      <div className="profile-name-name">{post.authorinfo[0].name}</div>
                      <div className="time">{timeAgo.format(new Date(post.createdAt))}</div>
                    </div>
                    <div className="menu" onClick={(e) => { setState((draft) => { draft.feed[index].isMenuVisible = !draft.feed[index].isMenuVisible }) }}><i className="fas fa-chevron-down"></i></div>
                    {post.isMenuVisible && (
                      <div className="menu-container">
                        <Link to={'/edit/' + post._id} className="menu-item">Edit</Link>
                        <div onClick={(e) => { deletepost(post._id, index) }} className="menu-item">Delete</div>
                      </div>
                    )
                    }
                  </div>
                  <div className="content">
                    <p>{post.body}</p>
                  </div>
                  {post.photo && post.photo != "no-photo.jpg" && (
                    <div className="imgbox">
                      <img src={(process.env.BACKENDURL || "https://locnotify.herokuapp.com") + `/uploads/posts/` + post.photo} />
                    </div>
                  )}

                  <div className="number-section">
                    <div className="hearts">{post.likesCount} likes</div>
                  </div>
                </div>
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

export default withRouter(ViewMyPost)
