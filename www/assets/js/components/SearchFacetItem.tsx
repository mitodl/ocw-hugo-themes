// @ts-nocheck
import React from "react"
import Dotdotdot from "react-dotdotdot"

import { slugify } from "../lib/util"

const featuredFacetNames = ["audience", "certification"]

export default function SearchFacetItem(props) {
  const { facet, isChecked, onUpdate, labelFunction, name } = props

  const labelText = labelFunction ? labelFunction(facet.key) : facet.key

  const facetId = slugify(`${name}-${facet.key}`)

  return (
    <div className={isChecked ? "facet-visible checked" : "facet-visible"}>
      <input
        type="checkbox"
        id={facetId}
        name={name}
        value={facet.key}
        checked={isChecked}
        onChange={onUpdate}
      />
      <div className="facet-label-div">
        <label
          htmlFor={facetId}
          className={
            featuredFacetNames.includes(name) ?
              "facet-key facet-key-large" :
              "facet-key"
          }
        >
          <Dotdotdot clamp={1}>{labelText}</Dotdotdot>
        </label>
        <div className="facet-count">{facet.doc_count}</div>
      </div>
    </div>
  )
}
