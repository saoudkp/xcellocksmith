'use client'

import React from 'react'

export const DashboardFooter: React.FC = () => {
  const year = new Date().getFullYear()
  return (
    <footer className="xcel-footer">
      <div className="xcel-footer-inner">
        <div className="xcel-footer-brand">
          <img src="/xcel-logo.png" alt="Xcel" className="xcel-footer-logo" />
          <span className="xcel-footer-name">Xcel Locksmith Dashboard</span>
        </div>
        <div className="xcel-footer-copy">
          &copy; {year} Xcel Locksmith. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default DashboardFooter
