export type RequestHeader = {
  'Content-Type'?: ContentType
  Range?: string
  Authroization?: string
}

export type ContentType =
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'application/json'
  | 'text/xml'

export type AxiosConfig = {
  baseURL?: string
  header?: RequestHeader
  timeout?: number //请求的超时时长
}

export type AxiosOptions = {
  header?: RequestHeader //请求头
  query?: { [props: string]: any } // get请求的查询参数
}
