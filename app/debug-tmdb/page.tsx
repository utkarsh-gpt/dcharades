'use client';

import { useState } from 'react';

export default function DebugTMDbPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async (testType: string, id?: string, query?: string) => {
    setLoading(true);
    setError(null);
    setTestResults(null);

    try {
      let url = `/api/test-tmdb?type=${testType}`;
      if (id) url += `&id=${id}`;
      if (query) url += `&query=${encodeURIComponent(query)}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setTestResults(data);
      } else {
        setError(data.message || data.error || 'Test failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🧪 TMDb API Debug Tool</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Test Controls */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">API Tests</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">1. Test Movie Details</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Movie ID (e.g., 550)"
                    className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-gray-400"
                    id="movieId"
                  />
                  <button
                    onClick={() => {
                      const id = (document.getElementById('movieId') as HTMLInputElement).value || '550';
                      runTest('movie', id);
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Test Movie
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">2. Test Person Details</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Person ID (e.g., 2888)"
                    className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-gray-400"
                    id="personId"
                  />
                  <button
                    onClick={() => {
                      const id = (document.getElementById('personId') as HTMLInputElement).value || '2888';
                      runTest('person', id);
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Test Person
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">3. Test Search</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search query (e.g., Sholay)"
                    className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-gray-400"
                    id="searchQuery"
                  />
                  <button
                    onClick={() => {
                      const query = (document.getElementById('searchQuery') as HTMLInputElement).value || 'Sholay';
                      runTest('search', undefined, query);
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    Test Search
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">4. Test Problematic ID</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Problematic ID (e.g., 325889)"
                    className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-gray-400"
                    id="problemId"
                    defaultValue="325889"
                  />
                  <button
                    onClick={() => {
                      const id = (document.getElementById('problemId') as HTMLInputElement).value;
                      runTest('movie', id);
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Test Problem ID
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
            
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">Testing TMDb API...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <h3 className="text-red-200 font-semibold mb-2">❌ Error</h3>
                <p className="text-red-100">{error}</p>
              </div>
            )}

            {testResults && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <h3 className="text-green-200 font-semibold mb-2">✅ Success</h3>
                <pre className="text-green-100 text-sm overflow-auto">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            )}

            {!loading && !error && !testResults && (
              <div className="text-center py-8 text-gray-400">
                <p>Run a test to see results here</p>
              </div>
            )}
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">🔧 Troubleshooting Guide</h2>
          
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-white font-medium">1. API Key Issues</h3>
              <p className="text-sm">Make sure you have set the <code className="bg-gray-800 px-1 rounded">TMB_READ_ONLY</code> environment variable with your TMDb API key.</p>
            </div>
            
            <div>
              <h3 className="text-white font-medium">2. Invalid Movie IDs</h3>
              <p className="text-sm">Movie ID 325889 might not exist in TMDb. Try searching for the movie first to get the correct ID.</p>
            </div>
            
            <div>
              <h3 className="text-white font-medium">3. Rate Limiting</h3>
              <p className="text-sm">TMDb has rate limits. If you're making too many requests, wait a moment and try again.</p>
            </div>
            
            <div>
              <h3 className="text-white font-medium">4. Network Issues</h3>
              <p className="text-sm">Check your internet connection and ensure the TMDb API is accessible from your location.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 