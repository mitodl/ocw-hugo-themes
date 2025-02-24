import { MouseEventHandler } from "react"

const getClassName = (className: string | undefined): string => {
  const classes = ["card", className || ""]

  return classes.join(" ").trim().replace(/\s+/g, " ")
}

interface Props {
  children?: React.ReactNode
  className?: string
  title?: string
  onClick?: MouseEventHandler<HTMLDivElement>
}

export default function Card(props: Props) {
  const { children, className, title, onClick } = props

  return (
    <div className={getClassName(className)} onClick={onClick}>
      <div className="card-contents">
        {title ? <div className="title">{title}</div> : null}
        {children}
      </div>
    </div>
  )
}
