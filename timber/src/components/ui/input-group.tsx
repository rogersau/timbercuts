import * as React from 'react'
import { Input } from './input'

export interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export function InputGroup({ prefix, suffix, className = '', ...props }: InputGroupProps) {
  return (
    <div className={`flex items-center rounded-md border border-input bg-background px-2 py-1 ${className}`}>
      {prefix && <span className="text-sm text-muted-foreground mr-2">{prefix}</span>}
      <Input className="border-none bg-transparent px-0 py-1" {...props} />
      {suffix && <span className="text-sm text-muted-foreground ml-2">{suffix}</span>}
    </div>
  )
}

export default InputGroup
