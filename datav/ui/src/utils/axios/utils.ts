// Copyright 2023 xObserve.io Team

import { ApiConfig } from './config'

export const rewriteUrl = (
  url: string,
  prefix: string = ApiConfig.proxyApi,
) => {
  return url.replace(new RegExp(`^${prefix}`), '')
}

export const isDev = () => process.env.NODE_ENV === 'development'
export const isTest = () => process.env.NODE_ENV === 'testing'
export const isProd = () => process.env.NODE_ENV === 'production'

const META_KEY = '__$$metadata'
export const getMetadata = (resOrReq: any, key: string) => {
  let metadata = {}
  if (typeof resOrReq === 'object') {
    if ('config' in resOrReq) {
      metadata = resOrReq?.config?.[META_KEY]
    } else {
      metadata = resOrReq?.[META_KEY]
    }
    return metadata?.[key]
  }
}

export const setMetadata = (resOrReq: any, key: string, value: any) => {
  let metadata = {}
  if (typeof resOrReq === 'object') {
    if ('config' in resOrReq) {
      metadata = resOrReq?.config?.[META_KEY] ?? {}
    } else {
      metadata = resOrReq?.[META_KEY] ?? {}
    }
    metadata[key] = value
    resOrReq[META_KEY] = metadata
  }
}

/**
 * cors
 */
export const getOrigin = () => ApiConfig.allowOrigin
