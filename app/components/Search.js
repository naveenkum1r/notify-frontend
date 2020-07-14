import React, { useEffect, useContext } from "react"
import DispatchContext from "../DispatchContext"

function Search() {
  const appDispatch = useContext(DispatchContext)

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

  return (<>
    <div className="search-modal" id="search-modal">
      <div className="result-number">
      </div>
      <div className="search-item">
      </div>
      <div className="search-item">
      </div>
    </div>
  </>
  )

}

export default Search