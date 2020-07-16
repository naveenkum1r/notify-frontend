import React, { useEffect, useContext } from 'react'
import { useImmer } from "use-immer"
import Axios from "axios"
import Page from "./Page"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

function HomeGuest() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  TimeAgo.addLocale(en)
  const timeAgo = new TimeAgo('en-IN')

  const [state, setState] = useImmer({
    page: 1,
    isLoading: true,
    feed: [],
    feedfinished: false
  })

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchdata() {
      try {
        const response = await Axios.post('/api/v1/posts/radius?page=' + state.page, { lng: appState.user.location.coordinates[0], lat: appState.user.location.coordinates[1], distance: appState.userpostradius * 1000 }, { headers: { 'Content-Type': 'application/json' } }, { cancelToken: ourRequest.token })
        if (!response.data.pagination.next) {
          setState((draft) => {
            draft.feedfinished = true
          })
        }
        setState((draft) => {
          draft.isLoading = false
          draft.feed = response.data.data
        })
        console.log(state.feed)
      } catch (e) {
        console.log("there was a problem or the request was cancelled")
      }
    }
    if (!state.feedfinished) {
      fetchdata()
    }
    return () => {
      ourRequest.cancel()
    }
  }, [state.page])

  try {
    navigator.geolocation.getCurrentPosition(
      position => {
        appDispatch({
          type: "setLocation", data: {
            type: "Point",
            coordinates:
              [position.coords.latitude, position.coords.longitude
              ]
          }
        })
      })
  }
  catch (err) {
    console.log("permissions were denied")
  }
  return (
    <Page title="Welcome">
      <div className="container">
        {state.feed.length > 0 && (
          <>
            {state.feed.map((post) => {
              return (
                <div className="card" post={post} key={post._id}>
                  <div className="profile">
                    <div className="profile-photo">
                      <img src={(process.env.BACKENDURL || "http://localhost:5000") + `/uploads/posts/` + post.authorinfo[0].photo} />
                    </div>
                    <div className="profile-name">
                      <div className="profile-name-name">
                        {post.authorinfo[0].name}
                      </div>
                      <div className="time">
                        {timeAgo.format(new Date(post.createdAt))}
                      </div>
                    </div>
                  </div>
                  {post.photo && post.photo != 'no-photo.jpg' && (
                    <div className="imgbox">
                      <img src={(process.env.BACKENDURL || "http://localhost:5000") + `/uploads/posts/` + post.photo} />
                    </div>
                  )}
                  <div className="content">
                    <p>{post.body}</p>
                  </div>
                  <div className="number-section">
                    <div className="hearts">
                      {post.likesCount} likes
            </div>
                    <div className="views">
                      {post.views} views
            </div>
                  </div>
                  <div className="button-section">
                    <div className="heart-button">
                      <i className="far fa-heart" aria-hidden="true"></i>
                      <div>Like</div>
                    </div>
                    <div className="map-button">
                      <i className="fas fa-map-marker-alt"></i>
                      <div>Location</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </Page>
  )
}

export default HomeGuest