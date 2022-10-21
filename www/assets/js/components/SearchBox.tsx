import React from "react"

export interface SearchBoxProps {
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  onSubmit: React.FormEventHandler<HTMLFormElement>
}

export default function SearchBox(props: SearchBoxProps) {
  const { value, onChange, onSubmit } = props

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="search-box d-flex flex-direction-row"
    >
      <input
        className="w-100 pl-2"
        type="search"
        onChange={onChange}
        value={value ?? ""}
        placeholder="Search OpenCourseWare"
        aria-label="Search OpenCourseWare"
      />
      <button type="submit" className="py-2 px-3">
        Search
      </button>
    </form>
  )
}
