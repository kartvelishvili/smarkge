import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from '@/components/Admin/AdminLogin';
import AdminDashboard from '@/components/Admin/AdminDashboard';
import ProtectedAdminRoute from '@/components/Admin/ProtectedAdminRoute';
import HomePage from '@/components/Pages/HomePage';
import WebDesignPage from '@/components/Pages/WebDesignPage';
import SocialMediaPage from '@/components/Pages/SocialMediaPage';
import ServicesPage from '@/components/Pages/ServicesPage';
import AboutUsPage from '@/components/Pages/AboutUsPage';
import PortfolioPage from '@/components/Pages/PortfolioPage';
import PortfolioDetailPage from '@/components/Pages/PortfolioDetailPage';
import NewsPage from '@/components/Pages/NewsPage';
import NewsDetailPage from '@/components/Pages/NewsDetailPage';
import ContactPage from '@/components/Pages/ContactPage';
import PrivacyPage from '@/components/Pages/PrivacyPage';
import TermsPage from '@/components/Pages/TermsPage';
import SiteMapPage from '@/components/Pages/SiteMapPage';

// Industry Pages
import IndustryHealthcarePage from '@/components/Pages/IndustryHealthcarePage';
import IndustryRealEstatePage from '@/components/Pages/IndustryRealEstatePage';
import IndustryEcommercePage from '@/components/Pages/IndustryEcommercePage';
import IndustryEducationPage from '@/components/Pages/IndustryEducationPage';
import IndustryTourismPage from '@/components/Pages/IndustryTourismPage';
import IndustryB2BPage from '@/components/Pages/IndustryB2BPage';
import NotFoundPage from '@/components/Pages/NotFoundPage';

import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SeoProvider } from '@/contexts/SeoContext';
import HeadManager from '@/components/HeadManager';
import useScrollToTop from '@/hooks/useScrollToTop';

function App() {
  return (
    <ErrorBoundary>
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <SeoProvider>
              <HeadManager />
              <ScrollToTop /> 
              <div className="min-h-screen flex flex-col">
                  <div className="flex-grow">
                      <Routes>
                      <Route path="/paneli" element={<AdminLogin />} />
                      <Route path="/paneli/dashboard" element={
                        <ProtectedAdminRoute>
                          <AdminDashboard />
                        </ProtectedAdminRoute>
                      } />
                      
                      {/* Services Routes */}
                      <Route path="/web-design" element={<WebDesignPage />} />
                      <Route path="/social-media" element={<SocialMediaPage />} />
                      <Route path="/services" element={<ServicesPage />} />
                      <Route path="/services-en" element={<ServicesPage />} />

                      <Route path="/about-us" element={<AboutUsPage />} />
                      <Route path="/portfolio" element={<PortfolioPage />} />
                      <Route path="/portfolio/:slug" element={<PortfolioDetailPage />} />
                      <Route path="/news" element={<NewsPage />} />
                      <Route path="/news/:slug" element={<NewsDetailPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="/sitemap" element={<SiteMapPage />} />
                      
                      {/* Industry Routes */}
                      <Route path="/industry/healthcare" element={<IndustryHealthcarePage />} />
                      <Route path="/industry/real-estate" element={<IndustryRealEstatePage />} />
                      <Route path="/industry/ecommerce" element={<IndustryEcommercePage />} />
                      <Route path="/industry/education" element={<IndustryEducationPage />} />
                      <Route path="/industry/tourism" element={<IndustryTourismPage />} />
                      <Route path="/industry/b2b" element={<IndustryB2BPage />} />

                      <Route path="/" element={<HomePage />} />
                      <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                  </div>
                  <Toaster />
              </div>
            </SeoProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
    </ErrorBoundary>
  );
}

// Wrapper component for the hook to ensure it's called within Router context
const ScrollToTop = () => {
  useScrollToTop();
  return null;
};

export default App;