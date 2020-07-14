import React, { useEffect, useContext } from 'react'
import { useImmer } from "use-immer"
import Page from "./Page"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"



function HomeGuest() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

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
    <Page title="Welcome">Sorry But no data yet.</Page>
  )
}

export default HomeGuest