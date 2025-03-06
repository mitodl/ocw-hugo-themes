import { useState } from "react"

const useLocalStorage = <T>(key: string, defaultValue: T) => {
  // Create state variable to store
  // localStorage value in state
  const [localStorageValue, setLocalStorageValue] = useState<T>(() => {
    try {
      const value = localStorage.getItem(key)
      // If value is already present in
      // localStorage then return it

      // Else set default value in
      // localStorage and then return it
      if (value) {
        return JSON.parse(value) as T
      } else {
        localStorage.setItem(key, JSON.stringify(defaultValue))
        return defaultValue
      }
    } catch (error) {
      localStorage.setItem(key, JSON.stringify(defaultValue))
      return defaultValue
    }
  })

  // this method update our localStorage and our state
  const setLocalStorageStateValue = (value: T) => {
    localStorage.setItem(key, JSON.stringify(value))
    setLocalStorageValue(value)
  }

  return [localStorageValue, setLocalStorageStateValue] as [
    T,
    (value: T) => void
  ]
}

export default useLocalStorage
