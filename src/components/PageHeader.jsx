import React from 'react'

export default function PageHeader({ title, subtitle, action, gradient = true }) {
  return (
    <div className={`px-4 pt-12 pb-6 ${gradient ? 'gradient-main' : 'bg-white border-b border-gray-100'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${gradient ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`text-sm mt-0.5 ${gradient ? 'text-primary-200' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}
