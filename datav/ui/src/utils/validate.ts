// Copyright 2023 xObserve.io Team

import { isArray, isObject, isEmpty as _isEmpty, isString } from 'lodash'

export function isEmpty(value) {
  if (
    value === null ||
    (isString(value) && value.trim() === '') ||
    value === undefined
  ) {
    return true
  }

  if (isArray(value) || isObject(value)) {
    return _isEmpty(value)
  }

  return false
}

/* ================================================
 below is simply the functions developed by React 
 pertaining to shallow comparison 
 ================================================= */

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x, y) {
  return (
    (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y) // eslint-disable-line no-self-compare
  )
}

const objectIs = (x, y) => (typeof Object.is === 'function' ? Object.is : is)

const hasOwnProperty = Object.prototype.hasOwnProperty

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
export function shallowEqual(objA, objB) {
  if (is(objA, objB)) {
    return true
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (
      !hasOwnProperty.call(objB, keysA[i]) ||
      !is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false
    }
  }

  return true
}
