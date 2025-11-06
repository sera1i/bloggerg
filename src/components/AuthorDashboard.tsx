import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PostEditor } from './PostEditor';
import type { Database } from '../lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'];

export function AuthorDashboard() {
  const [todayPost, setTodayPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const loadTodayPost = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('post_date', today)
      .maybeSingle();

    setTodayPost(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTodayPost();
  }, []);

  const handleDelete = async () => {
    if (!todayPost || !confirm('Are you sure you want to delete this post?')) return;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', todayPost.id);

    if (!error) {
      setTodayPost(null);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    loadTodayPost();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <PostEditor
        post={todayPost}
        postDate={today}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (!todayPost) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Post Today</h2>
        <p className="text-gray-600 mb-6">You haven't written your daily post yet.</p>
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={18} />
          Create Today's Post
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{todayPost.title}</h1>
          <p className="text-sm text-gray-500">
            {new Date(todayPost.post_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit post"
          >
            <Edit2 size={20} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete post"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="prose max-w-none">
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{todayPost.content}</p>
      </div>
    </div>
  );
}
