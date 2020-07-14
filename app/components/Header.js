import React, { useState, useContext } from "react"
import { Link } from "react-router-dom"

//components
import HeaderLoggedOut from "./HeaderLoggedOut"
import HeaderLoggedIn from "./HeaderLoggedIn"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function Header() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  function handleSearchIcon(e) {
    e.preventDefault()
    appDispatch({ type: "openSearch" })
  }

  function handleCloseSearch(e) {
    e.preventDefault()
    appDispatch({ type: "closeSearch" })
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
            {appState.isSearchOpen ? (<input placeholder=" Search..." autoFocus />) : (<input placeholder=" Search..." />)}
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
          <div className="result-number">
          </div>
          <div className="search-item">
          </div>
          <div className="search-item">
          </div>
        </div>
      )}
      {headerContent}
    </div>
  )
}

export default Header
