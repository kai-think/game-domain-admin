
export type SuperFilter = {
  current?: number,
  size?: number,
  filterList?: SuperFilterItem[],
  orderByList?: String,
}

export type SuperFilterItem = {
  logic?: String,
  column?: String,
  compare?: String,
  values?: String[],
}