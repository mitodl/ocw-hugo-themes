// @ts-nocheck
import React, { useCallback, useState } from "react"

import FacetDisplay from "./FacetDisplay"
import { DESKTOP } from "../lib/constants"
import { useDeviceCategory } from "../hooks/util"

export default function SearchFilterDrawer(props) {
  const deviceCategory = useDeviceCategory()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const openDrawer = useCallback(
    event => {
      event.preventDefault()
      setDrawerOpen(true)
    },
    [setDrawerOpen]
  )

  const closeDrawer = useCallback(
    event => {
      event.preventDefault()
      setDrawerOpen(false)
    },
    [setDrawerOpen]
  )

  if (deviceCategory === DESKTOP) {
    return (
      <div className="col-12 col-lg-3 mt-3 mt-lg-0 facet-display-wrapper">
        <FacetDisplay {...props} />
      </div>
    )
  }

  return drawerOpen ? (
    <div className="search-filter-drawer-open">
      <div className="controls">
        <i className="material-icons" onClick={closeDrawer}>
          close
        </i>
      </div>
      <div className="apply-filters">
        <button onClick={closeDrawer} className="blue-btn">
          Apply Filters
        </button>
      </div>
      <div className="contents">
        <FacetDisplay {...props} />
      </div>
    </div>
  ) : (
    <div className="controls">
      <div onClick={openDrawer} className="filter-controls">
        Filter
        <i className="material-icons">arrow_drop_down</i>
      </div>
    </div>
  )
}
