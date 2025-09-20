import React from 'react';

interface QuizQuestionProps {
  question: string;
  options: string[];
  onSelect: (option: string) => void;
  selected?: string;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, options, onSelect, selected }) => (
  <div className="mb-6">
    <div className="font-semibold mb-2">{question}</div>
    <div className="space-y-2">
      {options.map(opt => (
        <button
          key={opt}
          className={`block w-full text-left px-4 py-2 rounded border ${selected === opt ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300'} hover:bg-blue-50`}
          onClick={() => onSelect(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

export default QuizQuestion;
