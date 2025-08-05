import { Suspense } from "react";

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Resources</h1>
          <p className="text-xl text-gray-600 mb-8">
            Helpful guides, tools, and resources for property investment
          </p>
          <div className="bg-white rounded-2xl p-12 shadow-sm">
            <p className="text-gray-500">
              Resources section coming soon. Find investment guides, market
              reports, legal documentation, and helpful tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
