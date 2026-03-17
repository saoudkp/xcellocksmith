'use client'

import React from 'react'

export const AdminLogo: React.FC = () => {
  return (
    <div className="xcel-admin-logo">
      <img src="/xcel-logo.png" alt="Xcel Locksmith" className="xcel-admin-logo-img" />
      <div className="xcel-admin-logo-info">
        <span className="xcel-admin-logo-text">Xcel Dashboard</span>
        <span className="xcel-admin-logo-sub">Content Management</span>
      </div>
    </div>
  )
}

export default AdminLogo
