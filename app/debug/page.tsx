"use client";

import Link from "next/link";

export default function DebugPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      <p className="mb-4">This is a simple debug page to test routing.</p>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-medium mb-2">Test Links</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <Link href="/fix-role" className="text-blue-500 hover:underline">
                Fix Role Page
              </Link>
            </li>
            <li>
              <Link href="/admin/force" className="text-blue-500 hover:underline">
                Admin Force Page
              </Link>
            </li>
            <li>
              <Link href="/api/check-routes" className="text-blue-500 hover:underline">
                Check Routes API
              </Link>
            </li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-xl font-medium mb-2">Direct URLs (Copy and Paste)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000/fix-role</code>
            </li>
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000/admin/force</code>
            </li>
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000/api/check-routes</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 