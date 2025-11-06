import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CommentsSection } from './CommentsSection';
import type { Database } from '../lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'];

export function BlogView() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('post_date', { ascending: false });

    if (data) {
      setPosts(data);
    }
    setLoading(false);
  };

  const currentPost = posts[currentIndex];
  const hasNext = currentIndex < posts.length - 1;
  const hasPrev = currentIndex > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Posts Yet</h2>
        <p className="text-gray-600">Check back soon for the first post!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentPost.title}</h1>
          <p className="text-sm text-gray-500">
            {new Date(currentPost.post_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="prose max-w-none mb-8">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{currentPost.content}</p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            disabled={!hasNext}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">Older</span>
          </button>

          <span className="text-sm text-gray-500">
            {currentIndex + 1} of {posts.length}
          </span>

          <button
            onClick={() => setCurrentIndex(currentIndex - 1)}
            disabled={!hasPrev}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span className="font-medium">Newer</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <CommentsSection postId={currentPost.id} />
    </div>
  );
}
