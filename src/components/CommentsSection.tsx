import { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Comment = Database['public']['Tables']['comments']['Row'];

interface CommentsSectionProps {
  postId: string;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (data) {
      setComments(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_name: authorName,
          content,
        });

      if (insertError) throw insertError;

      setAuthorName('');
      setContent('');
      loadComments();
    } catch (err: any) {
  const msg =
    err?.message ||
    err?.error_description ||
    err?.hint ||
    (typeof err === 'string' ? err : JSON.stringify(err));
  console.error('Comment insert failed:', err);
  setError(msg);
} finally {
  setSubmitting(false);
}

  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={24} className="text-gray-700" />
        <h2 className="text-2xl font-bold text-gray-900">
          Comments ({comments.length})
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            id="authorName"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Comment
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Share your thoughts..."
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <Send size={18} />
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-semibold text-gray-900">{comment.author_name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
