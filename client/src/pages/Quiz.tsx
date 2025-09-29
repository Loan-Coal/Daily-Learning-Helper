
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TagSelector from '../components/TagSelector';
import { useNavigate } from 'react-router-dom';

const Quiz: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/tags/recommendations').catch(() => ({ data: [] })),
      axios.get('/tags').catch(() => ({ data: [] })),
    ])
      .then(([recRes, allRes]) => {
        setTags(recRes.data?.data || []);
        setAllTags(allRes.data?.data || []);
      })
      .catch(() => setError('Failed to load tags.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStartQuiz = async () => {
    setStarting(true);
    
    try {
      // Validate inputs
      let tagsToSend = tags.length > 0 ? tags : [];
      
      // If no tags selected and we have allTags, use first 3
      if (tagsToSend.length === 0 && allTags.length > 0) {
        tagsToSend = allTags.slice(0, 3);
      }
      
      // If still no tags, provide default fallback tags
      if (tagsToSend.length === 0) {
        tagsToSend = ['science', 'math', 'general']; // Always have fallback tags
      }
      
      const finalQuestionCount = questionCount.trim() !== '' ? Number(questionCount) : 5;

      // Generate a temporary ID for the loading page
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Navigate to generating page with parameters
      const params = new URLSearchParams({
        tags: tagsToSend.join(','),
        questionCount: finalQuestionCount.toString(),
        tempId
      });
      
      navigate(`/quiz/generating?${params.toString()}`);
      
    } catch (e) {
      console.error('Failed to start quiz generation:', e);
      setError('Failed to start quiz generation. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-40"><span className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full"></span></div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Start a Quiz</h1>
      <div className="mb-4">
        <div className="mb-2 text-gray-700">Tags:</div>
        <TagSelector value={tags} onChange={setTags} />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-gray-700">Number of Questions (1-50):</label>
        <input
          type="number"
          min={1}
          max={50}
          value={questionCount}
          onChange={e => {
            const val = e.target.value;
            if (val === '' || (/^\d+$/.test(val) && Number(val) >= 1 && Number(val) <= 50)) {
              setQuestionCount(val);
            }
          }}
          className="border rounded px-2 py-1 w-full"
          placeholder="Leave blank for default"
        />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {(tags.length === 0 ? allTags : tags).map(tag => (
          <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs flex items-center">
            {tag}
            {tags.length > 0 && (
              <button type="button" className="ml-1 text-red-500" onClick={() => setTags(tags.filter(t => t !== tag))}>&times;</button>
            )}
          </span>
        ))}
      </div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        onClick={handleStartQuiz}
        disabled={starting}
      >
        {starting ? 'Starting...' : 'Start Quiz'}
      </button>
    </div>
  );
};

export default Quiz;
