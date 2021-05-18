import React from "react"

export default function SearchBox(props) {
  const { value, onChange, onSubmit } = props

  return (
    <form onSubmit={onSubmit} className="search-box d-flex flex-direction-row">
      <input
        className="w-100 pl-2"
        type="text"
        onChange={onChange}
        value={value ?? ""}
        placeholder="Enter Course Name, Department, Course Number..."
        aria-label="Enter Course Name, Department, Course Number"
      />
      <button type="submit" className="py-2 px-3">
        Search
      </button>
    </form>
  )
}
