interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  className?: string;
}

function TagBadge({ tag, onRemove, className = '' }: TagBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 ${className}`}
    >
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-primary-400 hover:bg-primary-200 hover:text-primary-500 focus:outline-none focus:bg-primary-500 focus:text-white"
        >
          <span className="sr-only">Remove tag</span>
          <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
            <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
          </svg>
        </button>
      )}
    </span>
  )
}

export default TagBadge