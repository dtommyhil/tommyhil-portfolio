'use client'

import TextareaAutosize from 'react-textarea-autosize'
import type { ComponentProps } from 'react'

type Props = ComponentProps<typeof TextareaAutosize> & {
  className?: string
}

export default function TextBox({
  minRows = 1,
  maxRows = 10,
  className = '',
  ...props
}: Props) {
  return (
    <TextareaAutosize
      {...props}
      minRows={minRows}
      maxRows={maxRows}
      className={`w-full rounded-xl border-gray-200 px-3 py-2 
                  focus:outline-none 
                  resize-none ${className}`}
    />
  )
}
