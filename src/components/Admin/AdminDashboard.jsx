import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Globe, LogOut, Layout, ExternalLink, PenTool, Layers, BarChart, Search, Languages, Factory, LayoutGrid, Users, Quote, Newspaper, MessageSquare, ClipboardList, Wrench, FileImage, Mail, FileEdit, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAdminSessionExpiry } from '@/hooks/useAdminSessionExpiry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnimatedSection from '@/components/AnimatedSection';
import TestimonialsTab from './Tabs/TestimonialsTab';
import FooterTab from './Tabs/FooterTab';
import GlobalTab from './Tabs/GlobalTab';
import TranslationTab from './Tabs/TranslationTab';
import HeaderTab from './Tabs/HeaderTab';
import HeroTab from './Tabs/HeroTab';
import PartnersTab from './Tabs/PartnersTab';
import ServicesTab from './Tabs/ServicesTab';
import IndustriesTab from './Tabs/IndustriesTab';
import PortfolioTab from './Tabs/PortfolioTab';
import WebPageTab from './Tabs/WebPageTab';
import SeoTab from './Tabs/SeoTab';
import ContactSettingsTab from './Tabs/ContactSettingsTab';
import NewsTab from './Tabs/NewsTab';
import AnalyticsFaviconTab from './Tabs/AnalyticsFaviconTab';
import ApplicationsTab from './Tabs/ApplicationsTab';
import EmailUtilityTab from './Tabs/EmailUtilityTab';
import PortfolioPageTab from './Tabs/PortfolioPageTab';
import ContactMessagesTab from './Tabs/ContactMessagesTab';
import PagesContentTab from './Tabs/PagesContentTab';
import SeoProposalsTab from './Tabs/SeoProposalsTab';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // 24-hour inactivity auto-logout
  useAdminSessionExpiry();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/paneli', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
            <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4"> 
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <Button variant="ghost" onClick={() => window.open('/', '_blank')} className="text-[#5468E7] hover:bg-[#5468E7]/10 p-2"><ExternalLink className="w-5 h-5 mr-2" /> View Website</Button>
                <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:bg-red-500/10 p-2"><LogOut className="w-5 h-5 mr-2" /> Logout</Button>
            </div>
            </div>
        </AnimatedSection>

        <Tabs defaultValue="applications" className="space-y-6">
          <AnimatedSection delay={0.1}>
              <TabsList className="bg-[#0D1126] border border-[#5468E7]/30 p-1 flex-wrap h-auto w-full justify-start">
                <TabsTrigger value="applications" className="data-[state=active]:bg-[#5468E7] data-[state=active]:text-white"><ClipboardList className="w-4 h-4 mr-2" /> Applications</TabsTrigger>
                <TabsTrigger value="email-utility" className="data-[state=active]:bg-[#5468E7] data-[state=active]:text-white"><Wrench className="w-4 h-4 mr-2" /> Email Utils</TabsTrigger>
                <TabsTrigger value="news"><Newspaper className="w-4 h-4 mr-2" /> News Management</TabsTrigger>
                <TabsTrigger value="analytics"><BarChart className="w-4 h-4 mr-2" /> Analytics & Favicon</TabsTrigger>
                <TabsTrigger value="contact"><MessageSquare className="w-4 h-4 mr-2" /> Contact</TabsTrigger>
                <TabsTrigger value="global"><Settings className="w-4 h-4 mr-2" /> Global</TabsTrigger>
                <TabsTrigger value="seo"><Search className="w-4 h-4 mr-2" /> SEO</TabsTrigger>
                <TabsTrigger value="translate"><Languages className="w-4 h-4 mr-2" /> Translate</TabsTrigger>
                <TabsTrigger value="header"><Layout className="w-4 h-4 mr-2" /> Header</TabsTrigger>
                <TabsTrigger value="hero"><Layers className="w-4 h-4 mr-2" /> Hero</TabsTrigger>
                <TabsTrigger value="services"><PenTool className="w-4 h-4 mr-2" /> Services</TabsTrigger>
                <TabsTrigger value="industries"><Factory className="w-4 h-4 mr-2" /> Industries</TabsTrigger>
                <TabsTrigger value="portfolio"><LayoutGrid className="w-4 h-4 mr-2" /> Portfolio</TabsTrigger>
                <TabsTrigger value="portfolio-page"><FileImage className="w-4 h-4 mr-2" /> Portfolio Page</TabsTrigger>
                <TabsTrigger value="contact-messages"><Mail className="w-4 h-4 mr-2" /> Messages</TabsTrigger>
                <TabsTrigger value="web"><Globe className="w-4 h-4 mr-2" /> Web</TabsTrigger>
                <TabsTrigger value="partners"><Users className="w-4 h-4 mr-2" /> Partners</TabsTrigger>
                <TabsTrigger value="testimonials"><Quote className="w-4 h-4 mr-2" /> Testimonials</TabsTrigger>
                <TabsTrigger value="footer"><Layout className="w-4 h-4 mr-2" /> Footer</TabsTrigger>
                <TabsTrigger value="pages-content" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"><FileEdit className="w-4 h-4 mr-2" /> Pages Content</TabsTrigger>
                <TabsTrigger value="seo-proposals" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"><AlertTriangle className="w-4 h-4 mr-2" /> SEO Proposals</TabsTrigger>
              </TabsList>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
              <TabsContent value="applications">
                <ApplicationsTab />
              </TabsContent>

              <TabsContent value="email-utility">
                <EmailUtilityTab />
              </TabsContent>

              <TabsContent value="news">
                <NewsTab />
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsFaviconTab />
              </TabsContent>

              <TabsContent value="contact">
                <ContactSettingsTab />
              </TabsContent>

              <TabsContent value="global">
                <GlobalTab />
              </TabsContent>

              <TabsContent value="seo">
                <SeoTab />
              </TabsContent>

              <TabsContent value="translate">
                <TranslationTab />
              </TabsContent>

              <TabsContent value="header">
                <HeaderTab />
              </TabsContent>

              <TabsContent value="hero">
                <HeroTab />
              </TabsContent>

              <TabsContent value="services">
                <ServicesTab />
              </TabsContent>
              
              <TabsContent value="industries">
                <IndustriesTab />
              </TabsContent>

              <TabsContent value="portfolio">
                <PortfolioTab />
              </TabsContent>

              <TabsContent value="portfolio-page">
                <PortfolioPageTab />
              </TabsContent>

              <TabsContent value="contact-messages">
                <ContactMessagesTab />
              </TabsContent>
              
              <TabsContent value="web">
                <WebPageTab />
              </TabsContent>
              
              <TabsContent value="partners">
                <PartnersTab />
              </TabsContent>

              <TabsContent value="testimonials">
                <TestimonialsTab />
              </TabsContent>

              <TabsContent value="footer">
                <FooterTab />
              </TabsContent>

              <TabsContent value="pages-content">
                <PagesContentTab />
              </TabsContent>

              <TabsContent value="seo-proposals">
                <SeoProposalsTab />
              </TabsContent>
          </AnimatedSection>

        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;