export const PARTITIONS = [
  { id: 0, name: '全部' },
  { id: 1, name: '动画' },
  { id: 2, name: '游戏' },
  { id: 3, name: '音乐' },
  { id: 4, name: '知识' },
  { id: 5, name: '生活' },
] as const

export type PartitionId = (typeof PARTITIONS)[number]['id']

export function getPartitionName(id: number) {
  return PARTITIONS.find((p) => p.id === id)?.name ?? '未分区'
}
