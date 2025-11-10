import React from 'react'
import { Button } from './button'
import { ChevronLeftIcon } from 'lucide-react'

const CollapseButton = ({ onClick }) => {
  return <Button variant="outline" className="rounded-full w-1 h-16" onClick={onClick}>
    <ChevronLeftIcon className="w-1 h-4" />
  </Button>
}

export default CollapseButton;
