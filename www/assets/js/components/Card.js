// @flow
import React from "react"

const getClassName = className => {
  const classes = ["card", className || ""]

  return classes
    .join(" ")
    .trim()
    .replace(/\s+/g, " ")
}

export default function Card(props) {
  const { children, className, title, onClick } = props

  return (
    <div className={getClassName(className)} onClick={onClick || null}>
      <div className="card-contents">
        {title ? <div className="title">{title}</div> : null}
        {children}
      </div>
    </div>
  )
}
