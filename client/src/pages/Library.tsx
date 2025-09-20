import { useState, useMemo } from 'react'
import { useFiles } from '../hooks/useApi'
import FileCard from '../components/FileCard'

function LibraryPage() {
  const [sortBy, setSortBy] = useState('uploadedAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterTag, setFilterTag] = useState('')
  
  const { data: files = [], isLoading, error } = useFiles({
    sortBy,
    order: sortOrder,
    tag: filterTag
  })

  // Get unique tags from all files
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    files.forEach(file => {
      file.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [files])

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your library...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Material Library</h1>
          <p className="text-gray-600">
            Manage and organize your uploaded course materials.
          </p>
        </div>
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load library</h3>
          <p className="text-gray-600 mb-4">
            There was an issue connecting to the server. Please check that the backend is running and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Material Library</h1>
        <p className="text-gray-600">
          Manage and organize your uploaded course materials.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Sort Controls */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <div className="flex gap-2">
              {[
                { key: 'originalName', label: 'Name' },
                { key: 'uploadedAt', label: 'Date' },
                { key: 'size', label: 'Size' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleSortChange(key)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    sortBy === key
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {label}
                  {sortBy === key && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter by tag:</span>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Files Grid */}
      {files.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l3-3m-3 3l-3-3m1 9l3-3m-3 3l-3-3m1-4l3-3m-3 3l-3-3m1 9l3-3m-3 3l-3-3m8-12h6m-6 4h6m2 5l3-3m-3 3l-3-3m1 9l3-3m-3 3l-3-3m1-4l3-3m-3 3l-3-3m1 9l3-3m-3 3l-3-3" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filterTag ? 'No files found' : 'No materials yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {filterTag 
              ? `No files found with tag "${filterTag}". Try removing the filter or uploading materials with this tag.`
              : 'Get started by uploading your first course material. You can upload PDFs, documents, and other educational content.'
            }
          </p>
          {!filterTag && (
            <a
              href="/upload"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Upload Your First Material
            </a>
          )}
          {filterTag && (
            <button
              onClick={() => setFilterTag('')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Clear Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map(file => (
            <FileCard
              key={file.id}
              file={file}
              onClick={() => {
                // TODO: Implement file preview/details modal
                console.log('File clicked:', file)
              }}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {files.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{files.length}</p>
              <p className="text-sm text-gray-600">Total Files</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{allTags.length}</p>
              <p className="text-sm text-gray-600">Unique Tags</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024))}MB
              </p>
              <p className="text-sm text-gray-600">Total Size</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {files.filter(file => 
                  new Date(file.uploadedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </p>
              <p className="text-sm text-gray-600">This Week</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LibraryPage