'use client'

import React from 'react'

export const NavLogo: React.FC = () => {
  return (
    <a href="/admin" className="xcel-nav-logo" style={{ textDecoration: 'none' }}>
      <img src="/xcel-logo.png" alt="Xcel Locksmith" className="xcel-nav-logo-img" />
      <div className="xcel-nav-logo-info">
        <span className="xcel-nav-logo-text">Xcel Dashboard</span>
        <span className="xcel-nav-logo-sub">Content Management</span>
      </div>
    </a>
  )
}

export default NavLogo
