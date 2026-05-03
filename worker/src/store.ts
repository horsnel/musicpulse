/**
 * KV Store Helpers
 *
 * Simple read/write wrappers for Cloudflare KV.
 * Data is stored as JSON with an updatedAt timestamp.
 */

import { Env } from './index'

interface KVData<T> {
  items: T[]
  updatedAt: string
}

export async function writeKV<T>(env: Env, key: string, items: T[]): Promise<void> {
  const data: KVData<T> = {
    items,
    updatedAt: new Date().toISOString(),
  }
  await env.DATA.put(key, JSON.stringify(data))
}

export async function writeKVMeta(env: Env, key: string, meta: any): Promise<void> {
  await env.DATA.put(key, JSON.stringify({
    ...meta,
    updatedAt: new Date().toISOString(),
  }))
}

export async function readKV<T>(env: Env, key: string): Promise<KVData<T> | null> {
  const raw = await env.DATA.get(key, 'json')
  if (!raw) return null
  return raw as KVData<T>
}
