// pages/BlogDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogAPI } from '../api/blogService';
import { ArrowLeft, Eye, Calendar, User, Tag, Share2, Heart, Loader, Home, BookOpen } from 'lucide-react';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    fetchBlog();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const data = await blogAPI.getSingleBlog(id);
      setBlog(data.data);
      
      // Fetch related blogs based on keywords
      if (data.data.keywords?.length) {
        const related = await blogAPI.getRelatedBlogs(data.data._id);
        setRelatedBlogs(related.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.question,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  const handleTagClick = (tag) => {
    navigate(`/?tag=${encodeURIComponent(tag)}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Blog not found'}</p>
          <Link to="/" className="text-blue-600 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
          <Home className="w-4 h-4" />
          Home
        </Link>
      </div>

      {/* Blog Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{blog.createdBy?.name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(blog.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{blog.views.toLocaleString()} views</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {blog.title}
        </h1>

        {/* Tags Section */}
        {blog.keywords && blog.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.keywords.map((keyword, idx) => (
              <button
                key={idx}
                onClick={() => handleTagClick(keyword)}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-blue-100 hover:text-blue-700 transition"
              >
                #{keyword}
              </button>
            ))}
          </div>
        )}

        {/* Question Card */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg mb-6">
          <p className="text-blue-900 font-medium">
            {blog.question}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
              liked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            Helpful
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Featured Image */}
      {blog.image?.url && (
        <div className="mb-8">
          <img
            src={blog.image.url}
            alt={blog.image.altText || blog.title}
            className="w-full h-auto rounded-lg shadow-md"
          />
  
        </div>
      )}

      {/* Answer Content */}
      <div 
        className="prose prose-lg max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: blog.answer }}
      />

      {/* Related Articles Section */}
      {relatedBlogs.length > 0 && (
        <div className="pt-6 border-t">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-gray-600" />
            <h3 className="text-xl font-bold text-gray-800">Related Articles</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedBlogs.map((related) => (
              <Link
                key={related._id}
                to={`/blog/${related.slug || related._id}`}
                className="group p-4 bg-white border rounded-lg hover:shadow-md transition"
              >
                <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 mb-1 line-clamp-1">
                  {related.title}
                </h4>
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                  {related.question}
                </p>
                {related.keywords && related.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {related.keywords.slice(0, 2).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Eye className="w-3 h-3" />
                  <span>{related.views} views</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetail;