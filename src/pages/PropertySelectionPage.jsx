import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PropertySelectionPage = () => {
  const navigate = useNavigate();

  const propertyTypes = [
    {
      id: 'property',
      title: 'Property',
      icon: '🏢',
      description: 'Commercial, Farmland, Outright, JD/JV properties',
      features: [
        'Large plots, farms, commercial spaces',
        'Single listing for entire property',
        'Perfect for developers and investors',
        'Suitable for joint ventures'
      ],
      route: '/add-property'
    },
    {
      id: 'property-unit',
      title: 'Property Unit',
      icon: '🏠',
      description: 'Apartments, Villas, Houses, Studio, Penthouses',
      features: [
        'Individual units within building/project',
        'Perfect for residential listings',
        'Can be part of larger projects',
        'Suitable for rental, sale, lease, PG'
      ],
      route: '/add-property-unit'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Add New Listing
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the type of property you want to list. Select the option that best matches your property.
          </p>
        </div>

        {/* Property Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {propertyTypes.map((type) => (
            <div
              key={type.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
            >
              <div className="p-8">
                {/* Icon and Title */}
                <div className="flex items-center mb-6">
                  <div className="text-5xl mr-4">{type.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {type.title}
                    </h2>
                    <p className="text-gray-600 mt-1">{type.description}</p>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {type.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button
                  onClick={() => navigate(type.route)}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                >
                  <span>Select {type.title}</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Decorative Bottom */}
              <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 bg-gray-50">Feature</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 bg-gray-50">Property</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 bg-gray-50">Property Unit</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Best For', 'Investors & Developers', 'Individual Buyers & Tenants'],
                  ['Property Types', 'Commercial, Farmland, Plots', 'Apartments, Villas, Houses'],
                  ['Listing Types', 'Sale, JD/JV', 'Sale, Rent, Lease, PG'],
                  ['Typical Size', 'Large (acres/hectares)', 'Individual units'],
                  ['Examples', 'Office Buildings, Farms', '3BHK Flat, Villa, Studio']
                ].map(([feature, property, unit], index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-4 px-6 font-medium text-gray-900">{feature}</td>
                    <td className="py-4 px-6 text-center text-gray-700">{property}</td>
                    <td className="py-4 px-6 text-center text-gray-700">{unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center">
          <div className="inline-flex items-center text-gray-600 bg-gray-100 rounded-full px-6 py-3">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>Not sure which to choose? Property is for large plots/entire buildings, Property Unit is for individual apartments/houses.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySelectionPage;