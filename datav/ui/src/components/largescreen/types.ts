// Copyright 2023 xObserve.io Team

export interface DecorationProps {
  reverse?: boolean
  dur?: number
  className?: string
  style?: React.CSSProperties
  color?: string[]
  children?: any
  scanDur?: number
  haloDur?: number
  margin?: string
}

export interface BorderBoxProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  color?: string[]
  backgroundColor?: string
  reverse?: boolean
  dur?: number
  title?: string
  titleWidth?: number
}
