import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Comment = Database['public']['Tables']['comments']['Row'];

interface CommentsSectionProps {
  postId: string;
}

const COOLDOWN_SECONDS = 30; // 30-second client-side cooldown

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<number | null>(null);

  const LAST_COMMENT_KEY = `bloggerg:last_comment:${postId}`;

  useEffect(() => {
    // Auto-fill name if user is signed in
    if (user?.email) {
      const nameFromEmail = user.email.split('@')[0];
      setAuthorName(nameFromEmail);
    }
  }, [user]);

  useEffect(() => {
    // Load comments
    void loadComments();

    // Restore cooldown from localStorage
    const v = localStorage.getItem(LAST_COMMENT_KEY);
    if (v) {
      const ts = Number(v);
      if (!Number.isNaN(ts)) {
        const elapsed = Math.floor((Date.now() - ts) / 1000);
        const remaining = Math.max(0, COOLDOWN_SECONDS - elapsed);
        if (remaining > 0) startCooldown(remaining);
      }
    }

    // Cleanup timer on unmount
    return () => {
      if (cooldownRef.current) {
        window.clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    };
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

  const startCooldown = (seconds: number) => {
    setCooldown(seconds);
    localStorage.setItem(LAST_COMMENT_KEY, String(Date.now()));

    if (cooldownRef.current) window.clearInterval(cooldownRef.current);
    cooldownRef.current = window.setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (cooldownRef.current) {
            window.clearInterval(cooldownRef.current);
            cooldownRef.current = null;
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) {
      setError(`Please wait ${cooldown}s before posting again.`);
      return;
    }

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

      if (inserted) {
        setComments((c) => [...c, inserted as Comment]);
      } else {
        await loadComments();
      }

      setContent('');
      startCooldown(COOLDOWN_SECONDS);
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
          />
          <div className="text-right text-xs text-gray-400 mt-1">{content.length}/1000</div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || cooldown > 0}
            className="flex items-center gap-2 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Send size={18} />
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>

          {cooldown > 0 && (
            <div className="text-sm text-gray-500">Wait {cooldown}s before posting again</div>
          )}
        </div>
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
