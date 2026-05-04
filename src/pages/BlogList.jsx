// pages/BlogList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../api/blogService';
import { Eye, Calendar, User, Loader, BookOpen } from 'lucide-react';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 12
  });

  // Inject CSS styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Hide scrollbar for Chrome, Safari and Opera */
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }

      /* Hide scrollbar for IE, Edge and Firefox */
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      /* Line clamp utility */
      .line-clamp-2 {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }

      /* Custom scrollbar for desktop (optional) */
      @media (min-width: 768px) {
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      }

      /* Animation for loading spinner */
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .animate-spin {
        animation: spin 1s linear infinite;
      }

      /* Smooth transitions */
      .transition-shadow {
        transition: box-shadow 0.3s ease;
      }
      .hover\\:shadow-md:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [pagination.currentPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      const data = await blogAPI.getAllBlogs(params);
      setBlogs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, currentPage: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs text-gray-500 mt-2">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-6 rounded-lg shadow-sm max-w-sm mx-3">
          <div className="text-4xl mb-2">😕</div>
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button 
            onClick={fetchBlogs} 
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 py-4 md:px-4 md:py-6 ">
      {/* Article Heading */}
      <div className="text-center mb-4 md:mb-6">
        <div className="inline-flex items-center justify-center gap-2 mb-1 px-3 py-1 bg-white rounded-full shadow-sm">
          <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Articles
          </h1>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Latest articles and insights
        </p>
      </div>

      {/* Blog Content */}
      {blogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm mx-3">
          <div className="text-4xl mb-2">📚</div>
          <p className="text-gray-500 text-sm">No articles found</p>
        </div>
      ) : (
        <>
          {/* Mobile: Horizontal Scroll */}
          <div className="block md:hidden">
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-3 px-3 scrollbar-hide">
              {blogs.map((blog) => (
                <Link
                  key={blog._id}
                  to={`/blog/${blog.slug || blog._id}`}
                  className="flex-shrink-0 w-56 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                  {blog.image?.url ? (
                    <img
                      src={blog.image.url}
                      alt={blog.title}
                      className="w-full h-28 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-28 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white opacity-50" />
                    </div>
                  )}
                  
                  <div className="p-2">
                    <h2 className="font-semibold text-gray-800 text-xs mb-1 line-clamp-2 leading-tight">
                      {blog.title}
                    </h2>
                    <p className="text-gray-600 text-xs mb-1.5 line-clamp-2 leading-relaxed">
                      {blog.question}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                      <div className="flex items-center gap-0.5">
                        <User className="w-2.5 h-2.5" />
                        <span className="text-xs">{blog.createdBy?.name?.split(' ')[0] || 'User'}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5" />
                        <span>{blog.views.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop: Grid View */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {blogs.map((blog) => (
              <Link
                key={blog._id}
                to={`/blog/${blog.slug || blog._id}`}
                className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                {blog.image?.url ? (
                  <img
                    src={blog.image.url}
                    alt={blog.title}
                    className="w-full h-32 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white opacity-50" />
                  </div>
                )}
                
                <div className="p-2.5">
                  <h2 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2 leading-tight group-hover:text-blue-600 transition">
                    {blog.title}
                  </h2>
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2 leading-relaxed">
                    {blog.question}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1.5 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{blog.createdBy?.name?.split(' ')[0] || 'User'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{blog.views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 md:mt-8">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition text-sm bg-white shadow-sm"
              >
                ← Previous
              </button>
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                <span className="text-xs md:text-sm font-medium text-gray-700">
                  {pagination.currentPage}
                </span>
                <span className="text-gray-400 text-xs">/</span>
                <span className="text-xs md:text-sm text-gray-600">
                  {pagination.totalPages}
                </span>
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition text-sm bg-white shadow-sm"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogList;