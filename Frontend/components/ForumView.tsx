import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Plus, Search, User, Globe, Trash2, ArrowLeft, Send, 
  ShieldCheck, Eye, EyeOff, MessageCircle, AlertCircle, Heart
} from 'lucide-react';
import type { User as UserType } from '../types';

interface Post {
  id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  comment_count: number;
  authorName: string;
  authorRole: string;
  canDelete: boolean;
  isAuthor?: boolean;
  user_id?: string;
}

interface Comment {
  id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  authorName: string;
  authorRole: string;
  canDelete: boolean;
}

interface PostDetail extends Post {
  comments: Comment[];
}

interface ForumViewProps {
  currentUser: UserType;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const ForumView: React.FC<ForumViewProps> = ({ currentUser, apiFetch }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'my-posts'>('all');
  
  // Post Creator Form State
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [postAnonymously, setPostAnonymously] = useState(false);
  
  // Comment Creator Form State
  const [newCommentContent, setNewCommentContent] = useState('');
  const [commentAnonymously, setCommentAnonymously] = useState(false);
  
  // Async Loading / Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all posts
  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/forum/posts');
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load discussion posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch single post depth (to get comments)
  const fetchPostDetails = async (postId: string) => {
    setError(null);
    try {
      const data = await apiFetch(`/forum/posts/${postId}`);
      if (data && data.id) {
        setSelectedPost(data);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load discussion thread.');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [apiFetch]);

  // Handle post submit
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await apiFetch('/forum/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          is_anonymous: postAnonymously
        })
      });
      
      // Reset form & reload
      setNewTitle('');
      setNewContent('');
      setPostAnonymously(false);
      setIsCreatingPost(false);
      await fetchPosts();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle comment submit
  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !newCommentContent.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const addedComment = await apiFetch(`/forum/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content: newCommentContent,
          is_anonymous: commentAnonymously
        })
      });

      // Update Selected Post's comments array locally
      setSelectedPost(prev => {
        if (!prev) return null;
        return {
          ...prev,
          comment_count: prev.comment_count + 1,
          comments: [...prev.comments, addedComment]
        };
      });

      // Update posts main view comment counter
      setPosts(prev => prev.map(p => {
        if (p.id === selectedPost.id) {
          return { ...p, comment_count: p.comment_count + 1 };
        }
        return p;
      }));

      setNewCommentContent('');
      setCommentAnonymously(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this discussion post?')) return;
    try {
      await apiFetch(`/forum/posts/${postId}`, { method: 'DELETE' });
      
      // If currently looking at it, go back
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete post');
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await apiFetch(`/forum/comments/${commentId}`, { method: 'DELETE' });
      
      if (selectedPost) {
        setSelectedPost(prev => {
          if (!prev) return null;
          return {
            ...prev,
            comment_count: Math.max(0, prev.comment_count - 1),
            comments: prev.comments.filter(c => c.id !== commentId)
          };
        });

        setPosts(prev => prev.map(p => {
          if (p.id === selectedPost.id) {
            return { ...p, comment_count: Math.max(0, p.comment_count - 1) };
          }
          return p;
        }));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  // Date Formatting Helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Recent';
    }
  };

  // Client-side search and Tab filtering
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = activeTab === 'all' || post.isAuthor || (post.user_id === currentUser.id);
      
      return matchesSearch && matchesTab;
    });
  }, [posts, searchQuery, activeTab]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white font-sans tracking-tight">
              Community Support Forum
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">
              A peer network to discuss experiences safely and anonymously. Speak, share, and heal together.
            </p>
          </div>
          {!selectedPost && !isCreatingPost && (
            <button
              onClick={() => setIsCreatingPost(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-all duration-150 gap-2 shrink-0 active:scale-95 text-sm"
              id="btn-create-discussion"
            >
              <Plus className="h-4 w-4" />
              Start Discussion
            </button>
          )}
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Action Issue</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content Areas */}
        <AnimatePresence mode="wait">
          
          {/* 1. VIEW SINGLE POST DEPTH & REPLIES */}
          {selectedPost ? (
            <motion.div
              key="post-detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Back Button */}
              <button
                onClick={() => {
                  setSelectedPost(null);
                  setError(null);
                }}
                className="inline-flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to discussions
              </button>

              {/* Main Expanded Thread Post */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      {selectedPost.is_anonymous ? '?' : selectedPost.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedPost.authorName}
                        </span>
                        {selectedPost.is_anonymous && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
                            Anonymous
                          </span>
                        )}
                        {selectedPost.authorRole === 'admin' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            Admin Staff
                          </span>
                        )}
                        {selectedPost.authorRole === 'psychiatrist' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Clinical Specialist
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 block mt-0.5">
                        {formatDate(selectedPost.created_at)}
                      </span>
                    </div>
                  </div>

                  {selectedPost.canDelete && (
                    <button
                      onClick={() => handleDeletePost(selectedPost.id)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {selectedPost.title}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                    {selectedPost.content}
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  Replies
                </h3>

                {/* Comments List */}
                <div className="space-y-3">
                  {selectedPost.comments.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <p className="text-gray-400 dark:text-gray-500 text-sm">
                        No replies yet. Be the first to offer supportive words!
                      </p>
                    </div>
                  ) : (
                    selectedPost.comments.map(comment => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-4">
                           <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 flex items-center justify-center text-xs font-bold">
                              {comment.is_anonymous ? '?' : comment.authorName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-gray-900 dark:text-white">
                                  {comment.authorName}
                                </span>
                                {comment.is_anonymous && (
                                  <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 dark:bg-gray-900/50 dark:text-gray-400 text-[10px] font-semibold">
                                    Anonymous
                                  </span>
                                )}
                                {comment.authorRole === 'admin' && (
                                  <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-[10px] font-semibold">
                                    Admin
                                  </span>
                                )}
                                {comment.authorRole === 'psychiatrist' && (
                                  <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px] font-semibold gap-0.5">
                                    <ShieldCheck className="h-2.5 w-2.5" />
                                    Specialist
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 block select-none">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                          </div>

                          {comment.canDelete && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-lg transition-colors"
                              title="Delete Comment"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed pl-1">
                          {comment.content}
                        </p>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Reply Form */}
                <form 
                  onSubmit={handleCreateComment}
                  className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4"
                >
                  <div className="space-y-1">
                    <label htmlFor="reply-content" className="sr-only">Reply message</label>
                    <textarea
                      id="reply-content"
                      value={newCommentContent}
                      onChange={e => setNewCommentContent(e.target.value)}
                      placeholder="Offer your support, kind advice, or shared perspective..."
                      rows={3}
                      maxLength={1000}
                      className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none leading-relaxed"
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCommentAnonymously(prev => !prev)}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 select-none cursor-pointer self-start sm:self-auto"
                    >
                      {commentAnonymously ? (
                        <EyeOff className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-blue-500" />
                      )}
                      <span>
                        {commentAnonymously ? 'Replying anonymously' : 'Replying with your username'}
                      </span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || !newCommentContent.trim()}
                      className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow transition-all duration-150 gap-2 active:scale-95"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {isSubmitting ? <span className="loading-skeleton-on-accent inline-block h-3 w-16 rounded" /> : 'Send Reply'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          ) : isCreatingPost ? (
            
            /* 2. CREATING A DISCUSSION THREAD FORM */
            <motion.div
              key="create-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6"
            >
              <div className="border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Start a Community Discussion
                </h2>
                <button
                  onClick={() => {
                    setIsCreatingPost(false);
                    setError(null);
                  }}
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="post-title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Discussion Title
                  </label>
                  <input
                    id="post-title"
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Enter a descriptive topic title (e.g. Coping with social anxiety)..."
                    className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="post-content" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Message Body
                  </label>
                  <textarea
                    id="post-content"
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="Describe your situation, share an insight, or raise a supportive query..."
                    rows={6}
                    className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                    maxLength={5000}
                    required
                  />
                </div>

                {/* Anonymous Posting Options */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setPostAnonymously(prev => !prev)}
                    className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer select-none"
                  >
                    <div className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-colors ${postAnonymously ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 text-orange-500' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 text-gray-400'}`}>
                      {postAnonymously ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-left">Post Anonymously</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {postAnonymously ? 'Your name will not be shared with peers.' : 'Your username will be displayed (standard).'}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingPost(false);
                        setError(null);
                      }}
                      className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold rounded-lg transition-all"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}
                      className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-45 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      Post Thread
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          ) : (
            
            /* 3. DISCUSSION FORUM MAIN HUB */
            <motion.div
              key="main-hub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Tab Selector & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                
                {/* Tabs */}
                <div className="inline-flex bg-gray-200/60 dark:bg-gray-900 p-0.5 rounded-lg select-none">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      activeTab === 'all' 
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-100/10' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    All Discussions
                  </button>
                  <button
                    onClick={() => setActiveTab('my-posts')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      activeTab === 'my-posts' 
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-100/10' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    My Posts
                  </button>
                </div>

                {/* Search Term Bar */}
                <div className="relative flex-1 max-w-sm sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="search"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full text-xs rounded-lg pl-9 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Forum Listings */}
              {isLoading ? (
                <div className="space-y-3" role="status" aria-label="Loading community boards">
                  {[0, 1, 2, 3].map(item => (
                    <div key={item} className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                      <div className="space-y-3">
                        <div className="loading-skeleton h-5 w-2/3 rounded" />
                        <div className="loading-skeleton h-3 w-full rounded" />
                        <div className="loading-skeleton h-3 w-1/3 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
                  <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-650 mb-3" />
                  <p className="font-bold text-gray-700 dark:text-gray-300">No Postings Found</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 max-w-sm">
                    {searchQuery ? "We couldn't find any threads matching your search. Try adjusting terms." : "The forum is currently quiet. Start a discussion to say hello!"}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setIsCreatingPost(true)}
                      className="mt-4 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Start First Discussion
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPosts.map(post => {
                    const postExcerpt = post.content.length > 220 
                      ? `${post.content.substring(0, 220)}...` 
                      : post.content;
                    
                    return (
                      <motion.div
                        key={post.id}
                        onClick={() => {
                          setSelectedPost({ ...post, comments: [] });
                          fetchPostDetails(post.id);
                        }}
                        className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-150 cursor-pointer flex flex-col gap-3 group"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            {/* Author Row */}
                            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-400 flex-wrap">
                              <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                {post.is_anonymous ? '?' : post.authorName.charAt(0).toUpperCase()} • {post.authorName}
                              </span>
                              {post.is_anonymous && (
                                <span className="px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 dark:bg-gray-900/50 dark:text-gray-400 text-[10px] font-semibold">
                                  Anonymous
                                </span>
                              )}
                              {post.authorRole === 'admin' && (
                                <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-[10px] font-semibold">
                                  Staff
                                </span>
                              )}
                              {post.authorRole === 'psychiatrist' && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px] font-semibold gap-0.5 inline-flex items-center">
                                  <ShieldCheck className="h-2.5 w-2.5" />
                                  Specialist
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400">• {formatDate(post.created_at)}</span>
                            </div>

                            <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                              {post.title}
                            </h3>
                          </div>

                          {/* Comment Counter Tab */}
                          <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg shrink-0 select-none">
                            <MessageSquare className="h-3.5 w-3.5 fill-current opacity-60" />
                            <span className="text-xs font-bold">{post.comment_count}</span>
                          </div>
                        </div>

                        {/* Article Excerpt */}
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          {postExcerpt}
                        </p>

                        {/* Actions line */}
                        <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-700/50 pt-2 text-xs">
                          <span className="text-blue-500 font-semibold group-hover:underline inline-flex items-center gap-1">
                            Read discussion thread
                          </span>
                          
                          {/* Inner delete shortcut */}
                          {post.canDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePost(post.id);
                              }}
                              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              title="Delete Post"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ForumView;
