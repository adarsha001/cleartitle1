import { useEffect, useState } from "react";
import { Building2, Home, Star, Award, CheckCircle2, ArrowRight, Shield, FileCheck, BadgeCheck } from "lucide-react";
import { getProperties } from "../api/axios"
import PropertyCard from "../components/PropertyCard";

// Main Component
export default function FeaturedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await getProperties();
        console.log("featured", res)
        const featured = res.data.properties.filter((p) => p.isFeatured);
        setProperties(featured);
      } catch (err) {
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-blue-600 tracking-wide uppercase text-sm font-semibold">
            Loading Verified Properties
          </p>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Legal Verification Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full mb-6 shadow-lg">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-widest uppercase">
              100% Legal Verification
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            <span className="text-blue-600">Featured</span>{" "}
            <span className="text-yellow-500">Properties</span>
          </h1>
          
          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-transparent" />
            <FileCheck className="w-6 h-6 text-blue-600" />
            <div className="w-24 h-1 bg-gradient-to-l from-blue-600 to-transparent" />
          </div>

          {/* Subtitle */}
          <p className="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed">
            Discover our carefully selected properties with complete legal verification. 
            Each property undergoes rigorous title checks and legal due diligence for your peace of mind.
          </p>

          {/* Property Count & Verification Badge */}
          <div className="mt-8 inline-flex items-center gap-3 bg-white border-2 border-blue-600 px-8 py-4 rounded-xl shadow-md">
            <BadgeCheck className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-semibold tracking-wider uppercase text-gray-900">
              {properties.length} Legally Verified {properties.length === 1 ? "Property" : "Properties"} Available
            </span>
          </div>

          {/* Legal Assurance Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { icon: FileCheck, text: "Title Verification" },
              { icon: Shield, text: "Encumbrance Free" },
              { icon: BadgeCheck, text: "Legal Compliance" }
            ].map((feature, index) => (
              <div key={index} className="flex items-center justify-center gap-2 bg-blue-100/50 backdrop-blur-sm px-4 py-3 rounded-lg border border-blue-200">
                <feature.icon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>

        {/* Legal Assurance CTA */}
        <div className="mt-20 text-center border-t-2 border-blue-200 pt-12">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white max-w-4xl mx-auto">
            <Shield className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Complete Legal Protection Guaranteed</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Every property in our featured collection comes with comprehensive legal verification, 
              including title checks, encumbrance certificates, and regulatory compliance documentation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "✓ Clear Title Verification",
                "✓ No Legal Disputes", 
                "✓ Proper Documentation",
                "✓ Regulatory Approvals"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-blue-500/30 px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}