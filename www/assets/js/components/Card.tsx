const getClassName = (className: string | undefined): string => {
  const classes = ["card", className || ""]

  return classes.join(" ").trim().replace(/\s+/g, " ")
}

interface Props extends React.HTMLProps<HTMLDivElement> {
  children?: React.ReactNode
  className?: string
  title?: string
}

export default function Card(props: Props) {
  const { children, className, title, ...others } = props

  return (
    <div className={getClassName(className)} {...others}>
      <div className="card-contents">
        {title ? <div className="title">{title}</div> : null}
        {children}
      </div>
    </div>
  )
}
