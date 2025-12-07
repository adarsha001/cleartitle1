import React, { useState } from "react";

// Terms & Conditions component for ClearTitle 1
// Single-file React component using Tailwind CSS for styling.
// Drop this file into your React project and import where needed.

export default function TermsAndConditionsClearTitle1() {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-6 md:p-12 text-gray-900">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-300">
        {/* Header */}
        <header className="px-6 py-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
               <img src="/logo.png" className="w-16 h-auto drop-shadow-xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">ClearTitle 1 — Terms & Conditions</h1>
              <p className="text-sm opacity-90 mt-1 font-light tracking-wide">
                The Ultimate Legal Verification Platform for Property Transactions
              </p>
            </div>
          </div>
          <p className="text-sm opacity-90 font-light">Effective date: <strong>{new Date().toLocaleDateString()}</strong></p>
        </header>

        {/* Alert Banner */}
        <div className="bg-yellow-50 border-y border-yellow-200 px-6 py-3">
          <div className="flex items-center gap-2 text-yellow-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">
              <strong>Important:</strong> This document governs your use of ClearTitle 1's legal verification services
            </p>
          </div>
        </div>

        <main className="p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8">
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">1.</span> Introduction & Platform Overview
            </h2>
            <p className="leading-relaxed text-gray-700">
              Welcome to <strong className="text-blue-600">ClearTitle 1</strong> ("Platform", "Service", "we", "us", "our") - 
              India's premier digital platform for <strong>100% legally verified property transactions</strong>. These Terms & Conditions 
              ("Agreement") govern your access to and use of our verification services, property listings, legal 
              documentation support, and professional network. By creating an account or using our services, you agree 
              to be bound by this Agreement.
            </p>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">2.</span> Key Definitions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-700 mb-2">Verified Property</h4>
                <p className="text-sm text-gray-600">Property that has undergone our 4-step legal verification process and received clearance.</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-700 mb-2">Legal Verification</h4>
                <p className="text-sm text-gray-600">Our comprehensive process including title analysis, encumbrance checks, and statutory compliance review.</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-700 mb-2">Trusted Network</h4>
                <p className="text-sm text-gray-600">Pre-vetted legal experts, financial institutions, and property professionals.</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-700 mb-2">Digital Documentation</h4>
                <p className="text-sm text-gray-600">Secure, encrypted property documents accessible through our platform.</p>
              </div>
            </div>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">3.</span> Our Verification Process
            </h2>
            <div className="space-y-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Title Deed Analysis</h4>
                  <p className="text-gray-600 text-sm">Detailed examination by certified legal experts to verify ownership history and transfer chain.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Encumbrance Verification</h4>
                  <p className="text-gray-600 text-sm">Search for mortgages, liens, legal disputes, and other claims on the property.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Statutory Compliance</h4>
                  <p className="text-gray-600 text-sm">Verification of approvals, permits, and compliance with RERA, local regulations, and zoning laws.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Bank Approval Status</h4>
                  <p className="text-gray-600 text-sm">Confirmation of loan eligibility with our partner financial institutions.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">4.</span> User Accounts & Responsibilities
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>You must provide accurate, complete, and current information during registration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Maintain the confidentiality of your account credentials and notify us immediately of any unauthorized access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>You are responsible for all activities conducted through your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Minimum age requirement: 18 years or the age of majority in your jurisdiction</span>
              </li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">5.</span> Property Listings & Information
            </h2>
            <p className="text-gray-700 mb-3">
              While we verify legal aspects of properties, we do not:
            </p>
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
              <ul className="space-y-2 text-red-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Guarantee property values or investment returns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Endorse individual sellers, buyers, or agents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Conduct physical inspections or structural assessments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Provide financial or investment advice</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">6.</span> Verification Certificates & Reports
            </h2>
            <p className="text-gray-700 mb-3">
              Our verification certificates indicate legal clearance at the time of issuance. They are:
            </p>
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <ul className="space-y-2 text-green-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>Time-bound:</strong> Valid for 90 days from issuance date</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>Non-transferable:</strong> Specific to the property and parties involved</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>Limited scope:</strong> Cover only legal aspects verified by our process</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>Supplemental:</strong> Not a substitute for independent legal advice</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">7.</span> Service Fees & Payment Terms
            </h2>
            <div className="bg-blue-50 rounded-lg p-4 mt-3">
              <p className="text-gray-700">
                Our fees are transparent and displayed before service initiation. They typically include:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm font-medium text-gray-800">Verification Fees</p>
                  <p className="text-xs text-gray-600">For legal verification services</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm font-medium text-gray-800">Platform Subscription</p>
                  <p className="text-xs text-gray-600">Optional premium features</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm font-medium text-gray-800">Documentation Services</p>
                  <p className="text-xs text-gray-600">For document preparation & review</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm font-medium text-gray-800">Professional Referrals</p>
                  <p className="text-xs text-gray-600">Legal & financial expert introductions</p>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">8.</span> Data Privacy & Security
            </h2>
            <p className="text-gray-700 mb-3">
              We implement enterprise-grade security measures to protect your data:
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">256-bit SSL Encryption</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">GDPR Compliance</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Secure Cloud Storage</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Two-Factor Authentication</span>
            </div>
            <p className="text-sm text-gray-600">
              For complete details, please review our <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>.
            </p>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">9.</span> Intellectual Property Rights
            </h2>
            <p className="text-gray-700">
              All platform content, logos, trademarks, verification methodologies, and software are the exclusive property of 
              ClearTitle 1 or its licensors. You may not reproduce, distribute, or create derivative works without express 
              written permission.
            </p>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">10.</span> Limitation of Liability
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Important Notice:</strong> ClearTitle 1 provides legal verification services, but we are not a law firm 
                and do not provide legal advice. Our liability is limited to the fees paid for the specific service. We are not 
                liable for:
              </p>
              <ul className="mt-2 space-y-1 text-yellow-700 text-sm">
                <li>• Property value fluctuations or market conditions</li>
                <li>• Decisions made based on our verification reports</li>
                <li>• Third-party actions or services</li>
                <li>• Force majeure events affecting transactions</li>
              </ul>
            </div>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">11.</span> Dispute Resolution
            </h2>
            <p className="text-gray-700 mb-3">
              We prefer to resolve disputes amicably. If resolution fails:
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Step 1:</strong> Formal complaint through our support portal</p>
              <p><strong>Step 2:</strong> Mediation with our dedicated resolution team</p>
              <p><strong>Step 3:</strong> Arbitration in Bengaluru, Karnataka under Indian Arbitration Act</p>
              <p><strong>Step 4:</strong> Jurisdiction in courts of Bengaluru, Karnataka</p>
            </div>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">12.</span> Termination & Suspension
            </h2>
            <p className="text-gray-700">
              We reserve the right to suspend or terminate accounts for:
            </p>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>• Violation of these terms</li>
              <li>• Fraudulent or illegal activities</li>
              <li>• Providing false information</li>
              <li>• Non-payment of fees</li>
            </ul>
          </section>

          <section className="pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">13.</span> Contact Information
            </h2>
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Legal & Compliance</h4>
                  <address className="not-italic text-gray-600">
                    ClearTitle 1 Legal Department<br />
                    Email: <a href="mailto:legal@cleartitle1.com" className="text-blue-600 hover:underline">legal@cleartitle1.com</a><br />
                    Phone: +91 80 4123 4567
                  </address>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Customer Support</h4>
                  <address className="not-italic text-gray-600">
                    24/7 Support Team<br />
                    Email: <a href="mailto:support@cleartitle1.com" className="text-blue-600 hover:underline">support@cleartitle1.com</a><br />
                    Phone: +91 99000 12345
                  </address>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-sm text-gray-600">
                  <strong>Registered Office:</strong> #123, Tech Park Tower, Outer Ring Road, Bengaluru, Karnataka 560037, India
                </p>
              </div>
            </div>
          </section>

          {/* Acceptance Section */}
          <div className="border-t border-gray-300 pt-8">
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 mb-6">
              <div className="flex items-center gap-3">
                <input
                  id="accept"
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="accept" className="text-gray-800 font-medium">
                  I have read, understood, and agree to be bound by the ClearTitle 1 Terms & Conditions
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2 ml-8">
                By accepting, you acknowledge that you have reviewed our <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> and 
                understand our verification process limitations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                <p>Version 2.1 • Last updated: {new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print / Save PDF
                </button>
                <button
                  disabled={!accepted}
                  onClick={() => alert("Thank you for accepting the ClearTitle 1 Terms & Conditions. You may now proceed.")}
                  className={`px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    accepted 
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl" 
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Accept & Continue
                </button>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              <strong>Legal Disclaimer:</strong> ClearTitle 1 provides legal verification services but does not practice law. 
              Our verification reports supplement but do not replace independent legal advice from qualified attorneys. 
              Property transactions involve significant financial commitments - conduct due diligence accordingly.
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-6 bg-gradient-to-r from-blue-50 to-gray-50 border-t border-gray-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CT1</span>
              </div>
              <div>
                <p className="font-bold text-gray-800">ClearTitle 1</p>
                <p className="text-sm text-gray-600">100% Legal Verification Platform</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} ClearTitle 1 Technologies Private Limited. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}