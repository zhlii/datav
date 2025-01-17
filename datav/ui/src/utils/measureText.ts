// Copyright 2023 xObserve.io Team

import { canvasCtx } from 'src/App'

const cache = new Map<string, TextMetrics>()
const cacheLimit = 500
let ctxFontStyle = ''

/**
 * @internal
 */
export function getCanvasContext() {
  return canvasCtx
}

/**
 * @beta
 */
export function measureText(
  text: string,
  fontSize = 16,
  fontWeight = 400,
): TextMetrics {
  const fontStyle = `${fontWeight} ${fontSize}px 'Inter'`
  const cacheKey = text + fontStyle
  const fromCache = cache.get(cacheKey)

  if (fromCache) {
    return fromCache
  }

  const context = getCanvasContext()

  if (ctxFontStyle !== fontStyle) {
    context.font = fontStyle
  }

  const metrics = context.measureText(text)

  if (cache.size === cacheLimit) {
    cache.clear()
  }

  cache.set(cacheKey, metrics)

  return metrics
}

/**
 * @beta
 */
export function calculateFontSize(
  text: string,
  width: number,
  height: number,
  lineHeight: number,
  maxSize?: number,
) {
  // calculate width in 14px
  const textSize = measureText(text, 14)
  // how much bigger than 14px can we make it while staying within our width constraints
  const fontSizeBasedOnWidth = (width / (textSize.width + 2)) * 14
  const fontSizeBasedOnHeight = height / lineHeight

  // final fontSize
  const optimalSize = Math.min(fontSizeBasedOnHeight, fontSizeBasedOnWidth)
  return Math.min(optimalSize, maxSize ?? optimalSize)
}
