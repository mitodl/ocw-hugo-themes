import React, {ReactNode, useEffect, useRef, useState} from 'react';
import { useHotkeys } from 'react-hotkeys-hook'
import mergeRefs from "react-merge-refs";

interface ListProps {
  label: string
  children: ReactNode
  className?: string
}

type RefMap = Map<number, HTMLLIElement>

export function ListBox (props: ListProps) {
  const { label, children } = props

  const optionRefs = useRef<RefMap>(new Map)

  const [focusedIndex, setFocusedIndex] = useState(0)

  const mainRef = useRef<HTMLUListElement | null>(null)

  // TODO limit this so you can't go off the end
  const upRef = useHotkeys('up', (e) => {
    e.preventDefault()
    console.log('index going up');
    setFocusedIndex(current => Math.max(current - 1, 0))
  }, [setFocusedIndex])

  const downRef = useHotkeys('down', (e) => {
    e.preventDefault()
    setFocusedIndex(current => current + 1)
    console.log('index going up');
  }, [setFocusedIndex])

  const selectRef = useHotkeys('ctrl+space', (e) => {
    e.preventDefault()
    let el = optionRefs.current.get(focusedIndex)

    if (el) {
      let input = el.querySelector("input")!
      let event = new MouseEvent('click', {
        'view': window, 
        'bubbles': true, 
        'cancelable': false
      });
      input.dispatchEvent(event);
    }
  }, [focusedIndex, optionRefs.current])
  
  useEffect(() => {
    upRef.current = mainRef.current
    downRef.current = mainRef.current
    selectRef.current = mainRef.current
  }, [mainRef.current])

  useEffect(() => {
    let el = optionRefs.current.get(focusedIndex)

    if (el) {
      el.focus()
    }
  }, [optionRefs, focusedIndex])

  const [activeDescendentId, setActiveDescendentId] = useState("")
  // useEffect(() => {
    

  return <ul
    role="listbox"
    aria-multiselectable="true"
    aria-label={label}
    tabIndex={0}
    ref={mainRef}
    aria-activedescendent={activeDescendentId}
  >
    {React.Children.map(children, (child, index) => (
      <li role="option"
        ref={el => {
          if (el) {
            optionRefs.current.set(index,el)
          }
        }}
      >
        { child }
      </li>
    ))}
  </ul>
}




interface ListBoxOptionProps {
  children: ReactNode
  className?: string
  index: number
}

export function ListBoxOption (props: ListBoxOptionProps) {
  const { children, className } = props

  return <li role="option" className={className ?? ""}>
    { children }
  </li>
}
