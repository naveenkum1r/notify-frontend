import React, { Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useImmerReducer } from "use-immer"
import { BrowserRouter, Switch, Router, Route } from "react-router-dom"
import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"
import Axios from "axios"
import Cookies from 'js-cookie';
Axios.defaults.baseURL = process.env.BACKENDURL || "http://localhost:5000"

//Components
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import NotFound from "./components/NotFound"
import Login from "./components/Login"
const MyProfile = React.lazy(() => import("./components/MyProfile"))
const CreatePost = React.lazy(() => import("./components/CreatePost"))
const ViewMyPost = React.lazy(() => import("./components/ViewMyPost"))
import ChangePassword from './components/ChangePassword'
const EditPost = React.lazy(() => import("./components/EditPost"))
import Modal from './components/Modal'
const ResetPassword = React.lazy(() => import("./components/ResetPassword"))
import FlashMessage from './components/FlashMessage'

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("Token")),
    flashMessages: [],
    modalMessages: [],
    user: {
      _id: localStorage.getItem("id"),
      token: localStorage.getItem("Token"),
      name: localStorage.getItem("Name"),
      avatar: localStorage.getItem("Avatar"),
      location: {
        type: localStorage.getItem("locationType"),
        coordinates: [
          localStorage.getItem("Latitude"),
          localStorage.getItem("Longitude")
        ]
      }
    },
    userpostradius: localStorage.getItem("radius") || 0.5,
    isSearchOpen: false
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true
        draft.user.token = action.data.token
        break
      case "updateToken":
        draft.user.token = action.data.token
        break
      case "logout":
        draft.loggedIn = false
        draft.user._id = ""
        draft.user.token = ""
        break
      case "flashMessage":
        draft.flashMessages.push(action.data)
        break
      case "deleteflashMessage":
        draft.flashMessages.pop()
        break
      case "modalMessage":
        draft.modalMessages.push(action.data)
        break
      case "removeModalMessage":
        draft.modalMessages.pop()
        break
      case "openSearch":
        draft.isSearchOpen = true
        break
      case "closeSearch":
        draft.isSearchOpen = false
        break
      case "setPostRadius":
        draft.userpostradius = action.data
        break
      case "setUserInfo":
        draft.user._id = action.data.data._id
        draft.user.location = action.data.data.location
        draft.user.name = action.data.data.name
        draft.user.avatar = action.data.data.photo
        break
      case "setLocation":
        draft.user.location = action.data
        break
      case "updateprofilepicture":
        draft.user.avatar = action.data.data
        break
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("Token", state.user.token)
      localStorage.setItem("Name", state.user.name)
      localStorage.setItem("id", state.user._id)
      localStorage.setItem("Avatar", state.user.avatar)
    } else {
      localStorage.removeItem("Token")
      localStorage.removeItem("Name")
      localStorage.removeItem("id")
      localStorage.removeItem("Avatar")
      localStorage.removeItem("radius")
    }
  }, [state.loggedIn])

  useEffect(() => {
    localStorage.setItem("radius", state.userpostradius)
  }, [state.userpostradius])

  useEffect(() => {
    localStorage.setItem("Avatar", state.user.avatar)
  }, [state.user.avatar])
  //check if token has expired or not on first render

  useEffect(() => {
    console.log("Main ran")
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.get("/api/v1/auth/me", { headers: { 'Authorization': `Bearer ` + state.user.token } }, { cancelToken: ourRequest.token })
          if (!response.data) {
            dispatch({ type: "logout" })
            dispatch({ type: "flashMessage", value: "Your session has expired. Please log in again." })
          }
          dispatch({ type: "setUserInfo", data: response.data })
        } catch (e) {
          console.log("There was a problem or the request was cancelled")
        }
      }
      fetchResults()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <Header />
          <Modal />
          <FlashMessage messages={state.flashMessages} />
          <Suspense fallback="">
            <Switch>
              <Route path="/" exact>
                <HomeGuest />
              </Route>
              <Route path="/login">
                <Login />
              </Route>
              <Route path="/myprofile">
                <MyProfile />
              </Route>
              <Route path="/createpost">
                <CreatePost />
              </Route>
              <Route path="/myposts">
                <ViewMyPost />
              </Route>
              <Route path="/changepassword">
                <ChangePassword />
              </Route>
              <Route path="/edit/:id">
                <EditPost />
              </Route>
              <Route path="/resetpassword/:id">
                <ResetPassword />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

ReactDOM.render(<Main />, document.querySelector('#app'))

if (module.hot) {
  module.hot.accept()
}