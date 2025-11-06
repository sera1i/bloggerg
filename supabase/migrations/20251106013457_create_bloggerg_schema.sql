/*
  # Bloggerg Database Schema

  ## Overview
  Creates the core schema for Bloggerg, a minimalist daily-blogging platform with one author and public readership.

  ## New Tables

  ### `posts`
  - `id` (uuid, primary key) - Unique identifier for each post
  - `user_id` (uuid, foreign key to auth.users) - Author's user ID
  - `title` (text) - Post title
  - `content` (text) - Post content
  - `post_date` (date, unique) - Date of the post (one post per day constraint)
  - `created_at` (timestamptz) - Timestamp when post was created
  - `updated_at` (timestamptz) - Timestamp when post was last updated

  ### `comments`
  - `id` (uuid, primary key) - Unique identifier for each comment
  - `post_id` (uuid, foreign key to posts) - Reference to the post being commented on
  - `author_name` (text) - Name of the commenter
  - `content` (text) - Comment content
  - `created_at` (timestamptz) - Timestamp when comment was created

  ## Security

  ### Posts Table
  - RLS enabled
  - Public SELECT access for all posts
  - INSERT/UPDATE/DELETE restricted to authenticated owner (dev.serali@gmail.com)
  - Unique constraint on post_date to enforce one post per day

  ### Comments Table
  - RLS enabled
  - Public SELECT access for all comments
  - Public INSERT access for anyone to add comments
  - No UPDATE/DELETE access (comments are immutable once posted)

  ## Important Notes
  - The owner email (dev.serali@gmail.com) must be registered in Supabase Auth
  - Only one post can exist per calendar date
  - Comments are public and cannot be edited or deleted once posted
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  post_date date NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_post_date ON posts(post_date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view all posts"
  ON posts
  FOR SELECT
  USING (true);

CREATE POLICY "Owner can insert posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'email' = 'dev.serali@gmail.com'
  );

CREATE POLICY "Owner can update their posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'dev.serali@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'dev.serali@gmail.com');

CREATE POLICY "Owner can delete their posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'dev.serali@gmail.com');

CREATE POLICY "Anyone can view all comments"
  ON comments
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert comments"
  ON comments
  FOR INSERT
  WITH CHECK (true);
