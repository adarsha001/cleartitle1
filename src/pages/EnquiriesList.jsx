import { useState } from 'react';
import { MessageSquare, User, Phone, Calendar, Trash2 } from 'lucide-react';
import API from '../api/axios.js';

export default function EnquiriesList({ enquiries, onDelete, loading }) {
  const [deletingId, setDeletingId] = useState(null);

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleDelete = async (enquiryId) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    setDeletingId(enquiryId);
    try {
      await API.delete(`/enquiries/${enquiryId}`);
      onDelete(enquiryId);
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      alert('Error deleting enquiry');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        <p className="mt-4 text-gray-600">Loading enquiries...</p>
      </div>
    );
  }

  if (enquiries.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No enquiries made yet</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-blue-900" />
        My Enquiries ({enquiries.length})
      </h2>
      
      <div className="space-y-4">
        {enquiries.map((enquiry) => (
          <div key={enquiry._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{enquiry.property?.title || 'Property'}</h3>
                <p className="text-gray-600 text-sm">ID: {enquiry._id?.slice(-8)}</p>
              </div>
              <button
                onClick={() => handleDelete(enquiry._id)}
                disabled={deletingId === enquiry._id}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center text-gray-700">
                  <User className="w-4 h-4 mr-2 text-blue-900" />
                  <span className="font-medium">Name:</span>
                  <span className="ml-2">{enquiry.name}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Phone className="w-4 h-4 mr-2 text-blue-900" />
                  <span className="font-medium">Phone:</span>
                  <span className="ml-2">{enquiry.phoneNumber}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-blue-900" />
                  <span className="font-medium">Date:</span>
                  <span className="ml-2">{new Date(enquiry.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(enquiry.status)}`}>
                    {enquiry.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{enquiry.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}