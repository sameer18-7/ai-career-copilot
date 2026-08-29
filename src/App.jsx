import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import DashboardPage from './pages/DashboardPage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import SkillGapPage from './pages/SkillGapPage';
import InterviewCoachPage from './pages/InterviewCoachPage';
import JobRecommendationsPage from './pages/JobRecommendationsPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resume" element={<ResumeAnalyzerPage />} />
        <Route path="/skills" element={<SkillGapPage />} />
        <Route path="/interview" element={<InterviewCoachPage />} />
        <Route path="/jobs" element={<JobRecommendationsPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
}
