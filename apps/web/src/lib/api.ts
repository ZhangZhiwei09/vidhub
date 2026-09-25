import { NextResponse } from 'next/server'

export function ok<T>(data?: T, message = 'ok') {
  return NextResponse.json({ code: 0, message, data: data ?? null })
}

export function pageOk<T>(currentPage: number, pageSize: number, list: T[]) {
  const start = (currentPage - 1) * pageSize
  const pageList = list.slice(start, start + pageSize)
  return NextResponse.json({
    code: 0,
    message: 'ok',
    data: {
      list: pageList,
      currentPage,
      pageSize,
      total: list.length,
    },
  })
}

export function fail(message = 'error', status = 400) {
  return NextResponse.json({ code: 1, message, data: null }, { status })
}