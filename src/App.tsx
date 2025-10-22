import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { AllQuestions } from './pages/AllQuestions';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* Header with Navigation */}
          <Header />

          {/* Main Content */}
          <main className="py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/all-questions" element={<AllQuestions />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
              <p>Powered by OpenAI GPT-4 • Built with React + TypeScript + Tailwind CSS</p>
            </div>
          </footer>
        </div>
      </ProtectedRoute>
    </BrowserRouter>
  );
}

export default App;
