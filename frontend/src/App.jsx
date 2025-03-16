import React, { useState, useEffect } from 'react';
import { Check, X, MessageSquare, GitPullRequest, Eye, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import prism from 'prismjs';
import 'prismjs/themes/prism.css';
import axios from 'axios'; // Import axios for making the HTTP request
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import "highlight.js/styles/github.css";

function App() {
  const [code, setCode] = useState("");

  const [approved, setApproved] = useState(null);
  const [review, setReview] = useState('');
  const [loadingReview, setLoadingReview] = useState(false); // Loading state for review

  const [showPopup, setShowPopup] = useState(false); // State to manage popup visibility

  const codeLines = code.split('\n');

  useEffect(() => {
    prism.highlightAll();
  }, []);

  // Function to get the review from the server
  async function reviewCode() {
    setLoadingReview(true); 
    try {
      const response = await axios.post('https://revu-ai-backend.onrender.com/ai/get-review', { code });
      setReview(response.data); // Set the review result from the server
    } catch (error) {
      console.error("Error fetching review:", error);
      setReview("Failed to get review. Please try again.");
    } finally {
      setLoadingReview(false); 
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <GitPullRequest className="h-6 w-6" />
            <h1 className="text-xl font-bold">RevU.ai</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-8 md:px-0 flex flex-col md:flex-row gap-6 flex-grow">
        <section className="md:w-2/3 ml-6 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
            <h2 className="font-mono text-sm">main.js</h2>
            <div className="text-xs bg-gray-700 px-2 py-1 rounded">JavaScript</div>
          </div>

          <div className="overflow-x-auto">
            <div className="flex">
              {/* Line numbers */}
              <div className="bg-gray-200 p-3 pr-4 text-right text-gray-600 font-mono">
                {codeLines.map((_, index) => (
                  <div key={index}>{index + 1}</div>
                ))}
              </div>

              {/* Code with syntax highlighting */}
              <div className="flex-1">
                <Editor
                  value={code}
                  onValueChange={code => setCode(code)}
                  highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
                  padding={10}
                  style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 16,
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    height: "100%",
                    width: "100%"
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <aside className="md:w-1/3 flex flex-col gap-4 mr-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="font-semibold text-lg mb-3">Review Actions</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setApproved(true);
                  setShowPopup(true); 
                }}
                className={`flex items-center justify-center gap-2 p-2 rounded-md border ${
                  approved === true ? 'bg-green-100 border-green-500 text-green-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
                <span>Approve</span>
              </button>

              <button
                onClick={async () => {
                  setApproved(false);
                  await reviewCode();
                  setApproved(null);
                }}
                className={`flex items-center justify-center gap-2 p-2 rounded-md border ${
                  approved === false ? 'bg-red-100 border-red-500 text-red-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ThumbsDown className="h-5 w-5" />
                <span>Request Changes</span>
              </button>

              {/* Review Button */}
              <button
                onClick={reviewCode}
                className={`flex items-center justify-center gap-2 p-2 rounded-md border border-blue-300 bg-blue-100 text-blue-700 hover:bg-blue-200 ${loadingReview ? 'cursor-not-allowed opacity-50' : ''}`}
                disabled={loadingReview} // Disable the button during loading
              >
                <AlertCircle className="h-5 w-5" />
                <span>{loadingReview ? 'Reviewing...' : 'Review Code'}</span>
              </button>
            </div>
          </div>

          {/* Display Review Feedback */}
          {loadingReview ? (
            <div className="bg-white rounded-lg shadow-md p-4 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div> {/* Loader */}
            </div>
          ) : review && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="font-semibold text-lg mb-3">AI Review</h2>
              <p className="text-sm ">
                <Markdown rehypePlugins={[rehypeHighlight]}>
                  {review}
                </Markdown>
              </p>
            </div>
          )}
        </aside>
      </main>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-600/50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xs mx-auto">
            <h2 className="text-lg font-semibold">Thank you for using RevU.ai</h2>
            <p className="text-sm mt-2">Your approval has been recorded successfully.</p>
            <button
              onClick={() => setShowPopup(false)} 
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
