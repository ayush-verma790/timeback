"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"

export const Pagination = ({ pagination, onPageChange, onLimitChange }) => {
  const { currentPage, totalPages, totalCount, limit } = pagination

  const getPageNumbers = () => {
    const pages = []
    const pageLimit = 5
    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, currentPage + 2)

    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) {
        pages.push("...")
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...")
      }
      pages.push(totalPages)
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <nav
      className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-b-lg"
      aria-label="Pagination"
    >
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * limit, totalCount)}</span> of{" "}
            <span className="font-medium">{totalCount}</span> results
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="limit" className="text-sm text-gray-700">
              Per Page:
            </label>
            <select
              id="limit"
              name="limit"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="p-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-center rounded-md shadow-sm">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {pages.map((page, index) =>
              page === "..." ? (
                <span
                  key={index}
                  className="relative inline-flex items-center px-4 py-2 border-y border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border-y border-gray-300 text-sm font-medium ${
                    currentPage === page
                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ),
            )}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
