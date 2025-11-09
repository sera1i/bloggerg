import { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Comment = Database['public']['Tables']['comments']['Row'];

interface CommentsSectionProps {
  postId: string;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const loadComments = async () => {
    try {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      setComments(data ?? []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const name = (authorName || (user?.email ?? 'Anonymous')).trim();
    const body = (content || '').trim();

    if (body.length < 3) {
      setError('Comment is too short (min 3 characters).');
      setSubmitting(false);
      return;
    }
    if (body.length > 1000) {
      setError('Comment is too long (max 1000 characters).');
      setSubmitting(false);
      return;
    }

    try {
      const payload: Partial<Comment> = {
        post_id: postId,
        author_name: name,
        content: body,
        user_id: user?.id ?? null,
      };

      const { error: insertError, data: inserted } = await supabase
        .from('comments')
        .insert(payload)
        .select()
        .single();

      if (insertError) throw insertError;

      // If insertion returned the new row, append it without refetching
      if (inserted) {
        setComments((c) => [...c, inserted as Comment]);
      } else {
        // fallback: reload all comments
        await loadComments();
      }

      setAuthorName('');
      setContent('');
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
          Comments (<span aria-live="polite">{comments.length}</span>)
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4" aria-label="Add a comment">
        <div>
          <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            id="authorName"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={user?.email ?? 'Enter your name (or leave blank)'}
            aria-label="Your name"
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
            maxLength={1000}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Share your thoughts..."
            aria-label="Comment"
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {content.length}/1000
          </div>
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
