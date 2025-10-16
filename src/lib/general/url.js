'use client'

export function changeUrl(urlPath) {
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', urlPath)
    }
  }