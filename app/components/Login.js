import React, { useEffect, useContext, useState } from "react"
import { withRouter } from "react-router-dom"
import Axios from "axios"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"
import Page from "./Page"
import { useImmerReducer } from "use-immer"

function Login(props) {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()
  const [formactive, setFormActive] = useState()
  const [forgetactive, setForgetActive] = useState()

  const initalStateforregister = {
    name: {
      value: ""
    },
    username: {
      value: ""
    },
    email: {
      value: ""
    },
    password: {
      value: ""
    },
    confirmpassword: {
      value: ""
    },
    submitCount: 0,
  }

  function reducerForRegister(draft, action) {
    switch (action.type) {
      case "usernameImmediately":
        draft.username.value = action.value
        break
      case "nameImmediately":
        draft.name.value = action.value
        break
      case "emailImmediately":
        draft.email.value = action.value
        break
      case "passwordImmediately":
        draft.password.value = action.value
        break
      case "confirmpasswordDelay":
        draft.confirmpassword.value = action.value
        break
      case "submitForm":
        draft.submitCount++
        break
    }
  }

  const [registerstate, registerdispatch] = useImmerReducer(reducerForRegister, initalStateforregister)

  useEffect(() => {
    if (registerstate.submitCount) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/api/v1/auth/register", { name: registerstate.name.value, username: registerstate.username.value, email: registerstate.email.value, password: registerstate.password.value, location: appState.user.location }, { cancelToken: ourRequest.token })
          try {
            const response2 = await Axios.get("/api/v1/auth/me", { headers: { 'Authorization': `Bearer ` + response.data.token } })
            appDispatch({ type: "setUserInfo", data: response2.data })
            appDispatch({ type: "login", data: response.data })
            props.history.push("/")
          }
          catch (err) {
            console.log(err)
          }
        } catch (e) {
          console.log("There was a problem or the request was cancelled")
        }
      }
      fetchResults()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [registerstate.submitCount])

  async function handleLoginSubmit(e) {
    e.preventDefault()
    try {
      const response = await Axios.post("/api/v1/auth/login", { username, password })
      try {
        const response2 = await Axios.get("/api/v1/auth/me", { headers: { 'Authorization': `Bearer ` + response.data.token } })
        appDispatch({ type: "setUserInfo", data: response2.data })
        appDispatch({ type: "login", data: response.data })
        props.history.push("/")
      }
      catch (err) {
        console.log(err)
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  function handleRegisterSubmit(e) {
    e.preventDefault()
    if (registerstate.password.value == registerstate.confirmpassword.value) {
      registerdispatch({ type: "submitForm" })
    }
  }

  return (
    <Page title="Login">
      <section>
        <div className={formactive ? `card-login active` : `card-login`} >
          <div id="signinbox" className="user signinBx">
            <div className="about">
              <p>sdfsdfsfs</p>
            </div>
            <div className="formBx">
              <form onSubmit={handleLoginSubmit}>
                <h2>Sign In</h2>
                <input onChange={(e) => setUsername(e.target.value)} type="text" name="" placeholder="Username" />
                <input onChange={(e) => setPassword(e.target.value)} type="password" name="" placeholder="Password" />
                <input type="submit" name="" value="Login" />
                <p className="signup">Don't have an account ? <a href="#" onClick={(e) => { setFormActive(!formactive); setForgetActive(false) }}>Sign Up</a></p>
                <p className="forgot"><a href="#" onClick={(e) => { setFormActive(!formactive); setForgetActive(true) }}>Forgot Password ?</a></p>
              </form>
            </div>
          </div>

          <div className="user signupBx">
            <div className="formBx">
              <form onSubmit={handleRegisterSubmit}>
                <h2>Create an account</h2>
                <input onChange={(e) => registerdispatch({ type: "nameImmediately", value: e.target.value })} type="text" name="" placeholder="Name" />
                <input onChange={(e) => registerdispatch({ type: "usernameImmediately", value: e.target.value })} type="text" name="" placeholder="Username" />
                <input onChange={(e) => registerdispatch({ type: "emailImmediately", value: e.target.value })} type="text" name="" placeholder="Email Address" />
                <input onChange={(e) => registerdispatch({ type: "passwordImmediately", value: e.target.value })} type="password" name="" placeholder="Create Password" />
                <input onChange={(e) => registerdispatch({ type: "confirmpasswordDelay", value: e.target.value })} type="password" name="" placeholder="Confirm Password" />
                <input type="submit" name="" value="Sign Up" />
                <p className="signup">Already have an account ? <a href="#" onClick={(e) => setFormActive(!formactive)}>Log In</a></p>
              </form>
            </div>
            <div className="about">
              <p>sdfsdfsfs</p>
            </div>
          </div>

          {forgetactive && (
            <div className="user signupBx">
              <div className="formBx">
                <form>
                  <h2>Forgot Password</h2>
                  <h4>An email will be sent to your email id with password reset link.</h4>
                  <input type="text" name="" placeholder="Email Address" />
                  <input type="submit" name="" value="Send" />
                  <p className="signup">Already have an account ? <a href="#" onClick={(e) => setFormActive(!formactive)}>Log In</a></p>
                </form>
              </div>
              <div className="about">
                <p>sdfsdfsfs</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </Page>
  )
}

export default withRouter(Login)