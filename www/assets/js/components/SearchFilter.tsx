interface Props {
  value: string
  labelFunction?: (value: string) => string
  clearFacet: () => void
}

export default function SearchFilter(props: Props) {
  const { value, clearFacet, labelFunction } = props

  return (
    <div className="active-search-filter">
      <div>{labelFunction ? labelFunction(value) : value}</div>
      <button
        className="remove-filter-button"
        type="button"
        onClick={clearFacet}
        aria-label="clear filter"
      >
        <span className="material-icons" aria-hidden="true">
          close
        </span>
      </button>
    </div>
  )
}
