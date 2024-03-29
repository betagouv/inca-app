import type { SearchParamsOption } from 'ky'
import type { JsonArray, JsonObject } from 'type-fest'

export type ApiContext = {
  delete: <T = any>(path: string) => Promise<Api.ResponseBody<T> | null>
  get: <T = any>(path: string, searchParams?: SearchParamsOption) => Promise<Api.ResponseBody<T> | null>
  patch: <T = any>(path: string, data: JsonArray | JsonObject) => Promise<Api.ResponseBody<T> | null>
  post: <T = any>(path: string, data: JsonArray | JsonObject) => Promise<Api.ResponseBody<T> | null>
  put: <T = any>(path: string, formData: BodyInit) => Promise<Api.ResponseBody<T> | null>
}
