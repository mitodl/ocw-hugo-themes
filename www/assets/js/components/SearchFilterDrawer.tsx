import React, { useCallback, useState } from "react"

import FacetDisplay from "./FacetDisplay"
import { DESKTOP } from "../lib/constants"
import { useDeviceCategory } from "../hooks/util"
import { Aggregation, Facets } from "@mitodl/course-search-utils"
import { FacetManifest } from "../LearningResources"
import { SEARCH_COMPACT_UI } from "../lib/constants"
import Footer from "./Footer"

interface Props {
  facetMap: FacetManifest
  facetOptions: (group: string) => Aggregation | null
  activeFacets: Facets
  onUpdateFacets: React.ChangeEventHandler<HTMLInputElement>
  clearAllFilters: () => void
  toggleFacet: (name: string, value: string, isEnabled: boolean) => void
  updateUI: (newUI: string | null) => void
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
        <div className="col-12">
          <Footer />
        </div>
      </div>
    )
  }

  return drawerOpen ? (
    <div className="search-filter-drawer-open">
      <div className="controls">
        <button
          className="bg-transparent border-0"
          onClick={closeDrawer}
          type="button"
        >
          <span className="material-icons">close</span>
        </button>
      </div>
      <div className="apply-filters">
        <button onClick={closeDrawer} className="blue-btn" type="button">
          Apply Filters
        </button>
      </div>
      <div className="contents">
        <FacetDisplay {...props} />
      </div>
      <div className="col-12 px-5 mt-3 pb-5">
        <Footer />
      </div>
    </div>
  ) : (
    <div className="controls-outer">
      <div className="controls">
        <button
          className="filter-drawer-button"
          type="button"
          onClick={openDrawer}
        >
          Filter
          <i className="material-icons" aria-hidden="true">
            arrow_drop_down
          </i>
        </button>
      </div>
      <div className="layout-buttons layout-buttons-mobile">
        <button
          onClick={() => updateUI(null)}
          className="layout-button-left"
          type="button"
          aria-label="show detailed results"
        >
          <img src="/images/icons/list_ui_icon.png" alt="" aria-hidden="true" />
        </button>
        <button
          onClick={() => updateUI(SEARCH_COMPACT_UI)}
          className="layout-button-right"
          type="button"
          aria-label="show compact results"
        >
          <img
            src="/images/icons/compact_ui_icon.png"
            alt=""
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  )
}
