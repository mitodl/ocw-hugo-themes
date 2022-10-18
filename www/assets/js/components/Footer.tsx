import React from "react"

export default function Footer() {
  return (
    <footer className="search-footer px-2">
      <img src="/images/mit-ol.png" width="140px" />
      <div className="mt-4">
        <a
          className="text-muted"
          href="https://accessibility.mit.edu"
          target="_blank"
          rel="noreferrer"
        >
          Accessibility
        </a>
      </div>
      <div className="mt-2">
        <a
          className="text-muted"
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
          target="_blank"
          rel="noreferrer"
        >
          Creative Commons License
        </a>
      </div>
      <div className="mt-2">
        <a className="text-muted" href="/pages/privacy-and-terms-of-use/">
          Terms and Conditions
        </a>
      </div>
      <div className="text-muted mt-4">
        © 2001–{new Date().getFullYear()} Massachusetts Institute of Technology
      </div>
    </footer>
  )
}
