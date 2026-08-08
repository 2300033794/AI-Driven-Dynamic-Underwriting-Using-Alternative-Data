import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Apply from './pages/Apply';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import ChatbotWidget from './components/ChatbotWidget';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <ChatbotWidget />
    </BrowserRouter>
  );
}
