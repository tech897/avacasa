import { Suspense } from "react";

export default function ForumsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Forums
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with other property owners and share experiences
          </p>
          <div className="bg-white rounded-2xl p-12 shadow-sm">
            <p className="text-gray-500">
              Forums section coming soon. Stay tuned for community discussions,
              property insights, and expert advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
