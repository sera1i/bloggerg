import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'];

interface PostEditorProps {
  post: Post | null;
  postDate: string;
  onSave: () => void;
  onCancel: () => void;
}

export function PostEditor({ post, postDate, onSave, onCancel }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setSaving(true);

    try {
      if (post) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            title,
            content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', post.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('posts')
          .insert({
            user_id: user.id,
            title,
            content,
            post_date: postDate,
          });

        if (insertError) throw insertError;
      }

      onSave();
    } catch (err: any) {
  const msg =
    err?.message ||
    err?.error_description ||
    err?.hint ||
    (typeof err === 'string' ? err : JSON.stringify(err));
  console.error('Post save failed:', err);
  setError(msg);
} finally {
  setSaving(false);
}

  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {post ? 'Edit Post' : 'New Post'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your post title..."
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Write your thoughts..."
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Post'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
