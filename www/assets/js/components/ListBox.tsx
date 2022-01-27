import React from 'react';


export function ListBox (props) {

  const { label, children } = props

  return <ul role="listbox" >
    { children }
  </ul>
}

export function ListBoxOption (props) {
  const { children } = props

  return <li role="option">
    { children }
  </li>
}
