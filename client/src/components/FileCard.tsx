import { File } from '../types'
import TagBadge from './TagBadge'

interface FileCardProps {
  file: File;
  onClick?: () => void;
}

function FileCard({ file, onClick }: FileCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {file.originalName}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
          </p>
        </div>
        <div className="ml-4">
          <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {file.tags && file.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {file.tags.map((tag, index) => (
            <TagBadge key={index} tag={tag} />
          ))}
        </div>
      )}
    </div>
  )
}

export default FileCard