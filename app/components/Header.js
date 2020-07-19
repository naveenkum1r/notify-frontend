import React, { useState, useContext, useEffect } from "react"
import { Link } from "react-router-dom"
import { useImmer } from "use-immer"
import Axios from "axios"

//components
import HeaderLoggedOut from "./HeaderLoggedOut"
import HeaderLoggedIn from "./HeaderLoggedIn"
import Post from "./Post"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function Header() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither",
    requestCount: 0,
  })

  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState((draft) => {
        draft.show = "loading"
      })
      const delay = setTimeout(() => {
        setState((draft) => {
          draft.requestCount++
        })
      }, 750)
      return () => clearTimeout(delay)
    } else {
      setState((draft) => {
        draft.show = "neither"
      })
    }
  }, [state.searchTerm])

  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler)
    return () => {
      document.removeEventListener("keyup", searchKeyPressHandler)
    }
  }, [])

  function searchKeyPressHandler(e) {
    if (e.keyCode == 27) {
      appDispatch({ type: "closeSearch" })
    }
  }

  useEffect(() => {
    if (state.requestCount) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.get("/api/v1/posts/search", { params: { searchterm: state.searchTerm } }, { cancelToken: ourRequest.token })
          setState((draft) => {
            draft.results = response.data.data
            draft.show = "results"
          })
        } catch (e) {
          console.log("There was a problem or the request was cancelled")
        }
      }
      fetchResults()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.requestCount])

  function handleSearchIcon(e) {
    e.preventDefault()
    appDispatch({ type: "openSearch" })
  }

  function handleCloseSearch(e) {
    e.preventDefault()
    setState((draft) => {
      draft.searchTerm = ""
    })
    appDispatch({ type: "closeSearch" })
  }

  function handleInput(e) {
    const value = e.target.value
    setState((draft) => {
      draft.searchTerm = value
    })
  }

  function openpost(post) {
    appDispatch({ type: "closeSearch" })
    appDispatch({
      type: "modalMessage", data: (
        <div className="container">
          <Post index={1} post={post} />
        </div>
      )
    })
  }

  const headerContent = appState.loggedIn ? <HeaderLoggedIn /> : <HeaderLoggedOut />
  return (
    <div className="navbar">
      <Link to={"/"} className="home">
        <i className="fa fa-home"></i>
      </Link>
      <div className={window.innerWidth > 600 ? "search" : appState.isSearchOpen ? "search-2" : "search"} >
        <div className=" search-icon" onClick={handleSearchIcon}>
          <i className="fa fa-search"></i>
        </div>
        {(window.innerWidth > 600 || appState.isSearchOpen) && (
          <div className="search-box" onClick={handleSearchIcon} >
            {appState.isSearchOpen ? (<input onBlur={(e) => { e.target.value = "" }} onChange={handleInput} placeholder=" Search..." autoFocus />) : (<input placeholder=" Search..." />)}
          </div>
        )}
        {appState.isSearchOpen && (
          <div onClick={handleCloseSearch} className="closebutton" id="closebutton">
            <i className="fa fa-times"></i>
          </div>
        )}
      </div>
      {appState.isSearchOpen && (
        <div className="search-modal" id="search-modal">
          {
            Boolean(state.results.length) && state.show == "results" ? (
              <div className="result-number">
                {state.results.length} results found
              </div>
            ) : state.show == "results" ?
                <div className="result-number-not-found">
                  0 result found
          </div> : ""
          }<div className="search-items">

            {state.show == "results" &&
              state.results.map((post, index) => {
                return (
                  <div onClick={(e) => openpost(post)} key={index} className="search-item">
                    <div className="search-item-name">
                      {post.authorinfo[0].name}
                    </div>
                    <p className="search-item-body">
                      {post.body}
                    </p>
                  </div>
                )
              })
            }

          </div>
        </div>
      )}
      {headerContent}
    </div>
  )
}

export default Header
