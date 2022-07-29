import type { Option } from '@common/types'

export function mapCollectionToOptions<
  Item = Record<string, any>,
  LabelKey extends keyof Item = keyof Item,
  ValueKey extends keyof Item = keyof Item,
  TagPicker extends (item: Item) => string = (item: Item) => string,
>(collection: Item[], labelKeys: LabelKey[], valueKey: ValueKey, tagPicker?: TagPicker): Option[] {
  return collection.map((item: Item) => ({
    label: labelKeys
      .map(labelKey => item[labelKey])
      .join(' ')
      .concat(tagPicker ? ` [${tagPicker(item)}]` : ''),
    value: String(item[valueKey]),
  }))
}
