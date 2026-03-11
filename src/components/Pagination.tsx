import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  total: number
  pageSize: number
  onPage: (p: number) => void
}

export default function Pagination({ page, total, pageSize, onPage }: Props) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to   = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-gray-700">
      <p className="text-xs text-slate-400 dark:text-gray-500">
        {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft size={14} className="text-slate-600 dark:text-gray-300" />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
          .reduce<(number | '…')[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…')
            acc.push(p)
            return acc
          }, [])
          .map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="px-1.5 text-xs text-slate-400 dark:text-gray-500">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p as number)}
                className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-medium transition-colors ${
                  page === p
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300'
                }`}
              >
                {p}
              </button>
            )
          )}
        <button
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          disabled={page === pages}
          onClick={() => onPage(page + 1)}
        >
          <ChevronRight size={14} className="text-slate-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  )
}
