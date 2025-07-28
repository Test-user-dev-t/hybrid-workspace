import React from 'react';
import Editor from './components/Editor';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Hybrid Workspace</h1>
        </div>
      </header>
      <main className="py-8">
        <Editor />
      </main>
    </div>
  );
};

export default App;
