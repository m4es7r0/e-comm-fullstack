// ── UI State & Actions ──────────────────────────────────────────────

export type UIState = {
  disabled?: boolean
  readonly?: boolean
  loading?: boolean
  error?: string | null
}

export type UIActions<TValue = unknown> = {
  onChange?: (next: TValue) => void
  onSubmit?: () => void
  onReset?: () => void
  onRemove?: () => void
}

export type UIContract<TValue = unknown, TMeta = unknown> = {
  value: TValue
  state: UIState
  actions: UIActions<TValue>
  meta?: TMeta
}

// ── List Contract ───────────────────────────────────────────────────

export type ListMeta = {
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export type ListState = UIState & {
  empty?: boolean
  refreshing?: boolean
}

export type ListContract<TItem> = {
  items: TItem[]
  state: ListState
  actions: {
    onLoadMore?: () => void
    onRefresh?: () => void
    onSort?: (field: string, direction: 'asc' | 'desc') => void
    onFilter?: (filters: Record<string, unknown>) => void
  }
  meta: ListMeta
}

// ── Form Contract ───────────────────────────────────────────────────

export type FieldError = {
  field: string
  message: string
}

export type FormState = UIState & {
  dirty?: boolean
  submitting?: boolean
  submitted?: boolean
}

export type FormContract<TValues> = {
  values: TValues
  state: FormState
  errors: FieldError[]
  actions: {
    onChange: (field: keyof TValues, value: unknown) => void
    onSubmit: () => void
    onReset: () => void
  }
}

// ── Base Entity ─────────────────────────────────────────────────────

export type BaseEntity = {
  id: string
  createdAt: string
  updatedAt: string
}
