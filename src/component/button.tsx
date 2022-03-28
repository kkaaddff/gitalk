import { useComments } from '@/context/CommentsContext'
import React from 'react'

export default ({ className = '', onClick, onMouseDown = () => {}, text, isLoading = false }) => {
  const { publicBtnEL } = useComments()

  return (
    <button
      ref={publicBtnEL}
      className={`gt-btn ${className}`}
      onClick={onClick}
      onMouseDown={onMouseDown}>
      <span className='gt-btn-text'>{text}</span>
      {isLoading && <span className='gt-btn-loading gt-spinner' />}
    </button>
  )
}
