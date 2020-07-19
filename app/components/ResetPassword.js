import React, { useEffect, useContext } from "react"
import { useImmerReducer } from "use-immer"
import { useParams, withRouter } from "react-router-dom"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"
import Axios from "axios"

function Resetpassword(props) {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  const initalState = {
    newpassword: {
      value: ""
    },
    confirmpassword: {
      value: ""
    },
    submitCount: 0,
    token: useParams().id
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "newPasswordImmediately":
        draft.newpassword.value = action.value
        break
      case "confirmpasswordDelay":
        draft.confirmpassword.value = action.value
        break
      case "submitForm":
        draft.submitCount++
        break
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, initalState)

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    if (state.submitCount > 0) {
      if (state.newpassword.value == state.confirmpassword.value) {
        async function submitpasswordchange() {
          try {
            const response = await Axios.put("/api/v1/auth/resetpassword/" + state.token, { password: state.newpassword.value }, { headers: { "Content-Type": "application/json" } }, { cancelToken: ourRequest.token })
            if (response.data.success) {
              console.log(response.data)
              appDispatch({ type: "login", data: response.data })
              appDispatch({ type: "flashMessage", data: { type: "ok", body: "Kindly refresh screen and login" } })
            }
            else {
              appDispatch({ type: "flashMessage", data: { type: "danger", body: "Old Password is wrong" } })
            }
          }
          catch (err) {
            console.log(err)
          }
        }
        submitpasswordchange()
      }
    }
    return () => {
      ourRequest.cancel()
    }
  }, [state.submitCount])

  return (
    <>
      <section>
        <div className="card-login">
          <div id="signinbox" className="user signinBx">
            <div className="about">
              <p>sdfsdfsfs</p>
            </div>
            <div className="formBx">
              <form>
                <h2>Change Your Password</h2>
                <input onChange={(e) => dispatch({ type: "newPasswordImmediately", value: e.target.value })} type="password" name="" placeholder="New Password" autoFocus />
                <input onChange={(e) => dispatch({ type: "confirmpasswordDelay", value: e.target.value })} type="password" name="" placeholder="Confirm Password" />
                <input onClick={(e) => { dispatch({ type: "submitForm" }); e.preventDefault() }} type="submit" name="" value="Change" />
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default withRouter(Resetpassword)