import React, { useEffect, useContext } from "react"
import { useImmerReducer } from "use-immer"
import { withRouter } from "react-router-dom"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"
import Axios from "axios"

function ChangePassword(props) {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  const initalState = {
    oldpassword: {
      value: ""
    },
    newpassword: {
      value: ""
    },
    confirmpassword: {
      value: ""
    },
    submitCount: 0,
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "oldPasswordImmediately":
        draft.oldpassword.value = action.value
        break
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
            const response = await Axios.put("/api/v1/auth/updatepassword", { currentPassword: state.oldpassword.value, newPassword: state.newpassword.value }, { headers: { 'Authorization': `Bearer ` + appState.user.token, "Content-Type": "application/json" } }, { cancelToken: ourRequest.token })
            if (response.data.success) {
              appDispatch({ type: "updateToken", data: response.data })
              appDispatch({ type: "flashMessage", data: { type: "ok", body: "Password Updated" } })
              props.history.push("/")
            }
            else {
              appDispatch({ type: "flashMessage", data: { type: "danger", body: "Old Password is wrong" } })
            }
          }
          catch (err) {
            appDispatch({ type: "flashMessage", data: { type: "danger", body: "Unable to set new password" } })
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
                <input onChange={(e) => dispatch({ type: "oldPasswordImmediately", value: e.target.value })} type="password" name="" placeholder="Old Password" autoFocus />
                <input onChange={(e) => dispatch({ type: "newPasswordImmediately", value: e.target.value })} type="password" name="" placeholder="New Password" />
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

export default withRouter(ChangePassword)