import React, { useCallback, useState } from "react"

import FacetDisplay from "./FacetDisplay"
import { DESKTOP } from "../lib/constants"
import { useDeviceCategory } from "../hooks/util"
import { Aggregation, Facets } from "@mitodl/course-search-utils"
import { FacetManifest } from "../LearningResources"
import { SEARCH_COMPACT_UI, SEARCH_LIST_UI } from "../lib/constants"

interface Props {
  facetMap: FacetManifest
  facetOptions: (group: string) => Aggregation | null
  activeFacets: Facets
  onUpdateFacets: React.ChangeEventHandler<HTMLInputElement>
  clearAllFilters: () => void
  toggleFacet: (name: string, value: string, isEnabled: boolean) => void
  updateUI: (newUI: string) => void
}

export default function SearchFilterDrawer(props: Props) {
  const deviceCategory = useDeviceCategory()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { updateUI } = props

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
      <div className="col-12 col-lg-3 mt-3 mt-lg-0 facet-display-wrapper pt-3">
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
    <div className="controls-outer">
      <div className="controls">
        <div onClick={openDrawer} className="filter-controls">
          Filter
          <i className="material-icons">arrow_drop_down</i>
        </div>
      </div>
      <div className="layout-buttons layout-buttons-mobile">
        <button
          onClick={() => updateUI(SEARCH_LIST_UI)}
          className="layout-button-left"
        >
          <img
            src="/images/icons/list_ui_icon.png"
            alt="search results with thumbnails"
          />
        </button>
        <button
          onClick={() => updateUI(SEARCH_COMPACT_UI)}
          className="layout-button-right"
        >
          <img
            src="/images/icons/compact_ui_icon.png"
            alt="compact search results"
          />
        </button>
      </div>
    </div>
  )
}
