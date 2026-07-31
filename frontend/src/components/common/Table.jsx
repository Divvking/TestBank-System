import { useState } from 'react'
import { ChevronUp, ChevronDown, Search } from 'lucide-react'

export default function Table({ columns, data, searchKeys = [], actions }) {
  const [search, setSearch] = useState('')
  const [sort,   setSort]   = useState({ key: null, dir: 'asc' })

  const filtered = data?.filter(row =>
    searchKeys.length === 0 || searchKeys.some(k =>
      String(row[k] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  ) ?? []

  const sorted = sort.key
    ? [...filtered].sort((a, b) => {
        const av = a[sort.key] ?? '', bv = b[sort.key] ?? ''
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
        return sort.dir === 'asc' ? cmp : -cmp
      })
    : filtered

  const toggleSort = (key) => setSort(s =>
    s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
  )

  return (
    <div className="space-y-3">
      {searchKeys.length > 0 && (
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search…" value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
              {columns.map(col => (
                <th key={col.key}
                  className={`px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap
                              ${col.sortable ? 'cursor-pointer select-none hover:text-gray-800 dark:hover:text-gray-200' : ''}`}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}>
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sort.key === col.key
                      ? (sort.dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)
                      : col.sortable ? <ChevronDown size={13} className="opacity-30" /> : null}
                  </span>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {sorted.length === 0 ? (
              <tr><td colSpan={columns.length + (actions ? 1 : 0)}
                className="px-4 py-10 text-center text-gray-400 dark:text-gray-600">No records found</td></tr>
            ) : sorted.map((row, i) => (
              <tr key={i} className="bg-white dark:bg-gray-900 hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400">{sorted.length} record{sorted.length !== 1 ? 's' : ''}</p>
    </div>
  )
}
