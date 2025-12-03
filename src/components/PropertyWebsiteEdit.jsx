// components/PropertyWebsiteEdit.jsx
import React, { useState } from 'react';

const PropertyWebsiteEdit = ({ property, onUpdate }) => {
  const [visibleOnCleartitle, setVisibleOnCleartitle] = useState(property.visibleOnCleartitle);
  const [visibleOnSaimr, setVisibleOnSaimr] = useState(property.visibleOnSaimr);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Call API to update property
      const response = await axios.put(`/api/properties/${property._id}/websites`, {
        visibleOnCleartitle,
        visibleOnSaimr
      });
      
      if (response.data.success) {
        onUpdate(response.data.property);
        alert('Website visibility updated successfully');
      }
    } catch (error) {
      console.error('Error updating websites:', error);
      alert('Error updating website visibility');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h4 className="font-semibold mb-3">Website Visibility</h4>
      
      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={visibleOnCleartitle}
            onChange={(e) => setVisibleOnCleartitle(e.target.checked)}
            className="mr-2"
          />
          <span className="flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Visible on ClearTitle (Parent)
          </span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={visibleOnSaimr}
            onChange={(e) => setVisibleOnSaimr(e.target.checked)}
            className="mr-2"
          />
          <span className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Visible on SAIMR (Child)
          </span>
        </label>
        
        <div className="mt-4 pt-3 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};