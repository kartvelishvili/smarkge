import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { 
  Mail, Phone, MapPin, Clock, Send, Loader2, 
  Facebook, Instagram, Linkedin, Youtube, Building2, Hash 
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from "@/components/ui/checkbox";
import AnimatedSection from '@/components/AnimatedSection';
import { usePageContent } from '@/hooks/usePageContent';

// --- TEXT CONSTANTS (defaults) ---
const DEFAULT_TEXTS = {
  ka: {
    heroTitle: "დაგვიკავშირდით",
    heroSubtitle: "ჩვენ მზად ვართ გიპასუხოთ",
    companyInfo: "კომპანიის ინფორმაცია",
    address: "მისამართი",
    phone: "ტელეფონი",
    email: "ელ-ფოსტა",
    hours: "სამუშაო საათები",
    followUs: "გამოგვყევი სოციალურ ქსელებში",
    formTitle: "მოგვწერეთ",
    namePlaceholder: "სახელი",
    phonePlaceholder: "ტელეფონი",
    emailPlaceholder: "ელ-ფოსტა",
    subjectPlaceholder: "საგანი",
    messagePlaceholder: "შეტყობინება",
    privacyPolicy: "ვეთანხმები კონფიდენციალურობის პოლიტიკას",
    sendButton: "გაგზავნა",
    successTitle: "წარმატება",
    successMsg: "წერილი გაიგზავნა წარმატებით",
    errorTitle: "შეცდომა",
    errorMsg: "შეცდომა წერილის გაგზავნისას",
    regPrefix: "ს/ნ"
  },
  en: {
    heroTitle: "Contact Us",
    heroSubtitle: "We are ready to answer your questions",
    companyInfo: "Company Information",
    address: "Address",
    phone: "Phone",
    email: "Email",
    hours: "Business Hours",
    followUs: "Follow Us",
    formTitle: "Send Message",
    namePlaceholder: "Name",
    phonePlaceholder: "Phone",
    emailPlaceholder: "Email",
    subjectPlaceholder: "Subject",
    messagePlaceholder: "Message",
    privacyPolicy: "I agree to the privacy policy",
    sendButton: "Send",
    successTitle: "Success",
    successMsg: "Message sent successfully",
    errorTitle: "Error",
    errorMsg: "Error sending message",
    regPrefix: "ID"
  }
};

const DEFAULT_SOCIAL_LINKS = [
  { platform: 'Facebook', url: 'https://www.facebook.com/smarketeri', icon: Facebook, color: '#1877F2' },
  { platform: 'Instagram', url: 'https://www.instagram.com/smarketer.georgia', icon: Instagram, color: '#E1306C' },
  { platform: 'TikTok', url: 'https://www.tiktok.com/@smarketer.ge', icon: ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.16c0 2.52-1.12 4.84-2.9 6.24-1.72 1.36-4.04 1.86-6.23 1.31-2.42-.6-4.36-2.52-4.99-4.96-.65-2.52.1-5.24 2.1-6.95 1.54-1.32 3.66-1.69 5.57-1.07V13c-1.28-.68-2.9-.6-4.08.18-1.22.81-1.7 2.4-1.13 3.77.63 1.5 2.37 2.27 3.93 1.74 1.3-.44 2.19-1.68 2.19-3.05V.02h1.46z"/></svg>, color: '#000000' },
  { platform: 'Behance', url: 'https://www.behance.net/smarketer', icon: ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.129 1.056.129 1.42h-8.121c.142 1.528 1.169 3.146 3.256 3.146 1.107 0 2.272-.61 2.905-1.137l1.655 1.74zm-2.953-4.326c-.171-1.308-1.206-2.504-2.881-2.504-1.606 0-2.615 1.156-2.912 2.504h5.793zm-12.793-9.569h-7.98v17.895h8.047c3.777 0 6.139-1.928 6.139-5.131 0-2.016-1.174-3.414-2.508-4.148 1.395-.828 2.062-2.195 2.062-3.834 0-2.884-2.228-4.782-5.76-4.782zm-3.829 2.766h2.723c1.942 0 3.018.995 3.018 2.612 0 1.637-1.118 2.651-3.262 2.651h-2.479v-5.263zm0 7.426h3.193c2.202 0 3.535 1.025 3.535 2.986 0 1.956-1.503 2.924-3.529 2.924h-3.199v-5.91z"/></svg>, color: '#1769FF' },
  { platform: 'YouTube', url: 'https://www.youtube.com/@SmarketerGE', icon: Youtube, color: '#FF0000' },
  { platform: 'LinkedIn', url: 'https://www.linkedin.com/company/104962757', icon: Linkedin, color: '#0A66C2' },
  { platform: 'WhatsApp', url: 'https://wa.me/995500702080', icon: ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>, color: '#25D366' },
];

const ContactForm = ({ darkMode, language }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    agreed: false
  });

  const t = DEFAULT_TEXTS[language === 'ka' ? 'ka' : 'en'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreed) {
       toast({ variant: 'destructive', title: t.errorTitle, description: t.privacyPolicy });
       return;
    }
    setLoading(true);
    try {
      // 1. Insert into DB
      const { data: insertedData, error } = await supabase.from('contact_messages').insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        status: 'new'
      }]).select().single();

      if (error) throw error;

      // 2. Invoke Edge Function
      try {
        const { error: funcError } = await supabase.functions.invoke('send-contact-email', {
          body: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message,
            id: insertedData?.id
          }
        });

        if (funcError) {
          console.error("Failed to invoke email function:", funcError);
          // Non-blocking error
        }
      } catch (emailErr) {
        console.error("Email sending exception:", emailErr);
      }

      toast({ title: t.successTitle, description: t.successMsg });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '', agreed: false });

    } catch (error) {
      console.error('Submission error:', error);
      
      let errorTitle = t.errorTitle;
      let errorMsg = t.errorMsg;

      if (error.code === '42501' || (error.message && error.message.includes('row-level security'))) {
        errorTitle = "Permission Denied";
        errorMsg = "Security policy prevented submission. Please try again later.";
      }

      toast({ variant: 'destructive', title: errorTitle, description: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-lg border outline-none transition-all ${
    darkMode 
      ? 'bg-[#0A0F1C] border-white/10 text-white focus:border-[#5468E7]' 
      : 'bg-white border-gray-200 text-gray-900 focus:border-[#5468E7]'
  }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
           <input 
             placeholder={t.namePlaceholder} 
             className={inputClass} 
             value={formData.name}
             onChange={e => setFormData({...formData, name: e.target.value})}
             required
           />
        </div>
        <div>
           <input 
             placeholder={t.phonePlaceholder} 
             className={inputClass} 
             value={formData.phone}
             onChange={e => setFormData({...formData, phone: e.target.value})}
             type="tel"
           />
        </div>
      </div>
      <div>
         <input 
           placeholder={t.emailPlaceholder} 
           className={inputClass} 
           value={formData.email}
           onChange={e => setFormData({...formData, email: e.target.value})}
           type="email"
           required
         />
      </div>
      <div>
         <input 
           placeholder={t.subjectPlaceholder} 
           className={inputClass} 
           value={formData.subject}
           onChange={e => setFormData({...formData, subject: e.target.value})}
           required
         />
      </div>
      <div>
         <textarea 
           placeholder={t.messagePlaceholder} 
           className={`${inputClass} resize-none min-h-[120px]`} 
           value={formData.message}
           onChange={e => setFormData({...formData, message: e.target.value})}
           required
         />
      </div>
      
      <div className="flex items-center gap-2">
         <Checkbox 
           id="privacy" 
           checked={formData.agreed}
           onCheckedChange={(checked) => setFormData({...formData, agreed: checked})}
           className="border-[#5468E7] data-[state=checked]:bg-[#5468E7]"
         />
         <label htmlFor="privacy" className={`text-sm cursor-pointer select-none ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t.privacyPolicy}
         </label>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-[#5468E7] hover:bg-[#4353b8] h-12 text-base">
         {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
         {t.sendButton}
      </Button>
    </form>
  );
};

const MapComponent = ({ companyInfo }) => (
  <AnimatedSection delay={0.4} className="w-full h-[450px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/10 relative group">
     {/* Map Embed - pointing to 33e Ilia Chavchavadze Avenue */}
     <iframe 
       src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.6738947387635!2d44.76495637656156!3d41.70613497126049!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40440ccd910c0e13%3A0x6b772c728373801!2s33e%20Ilia%20Chavchavadze%20Avenue%2C%20Tbilisi!5e0!3m2!1sen!2sge!4v1709421234567!5m2!1sen!2sge"
       width="100%" 
       height="100%" 
       style={{ border: 0 }} 
       allowFullScreen="" 
       loading="lazy" 
       referrerPolicy="no-referrer-when-downgrade"
       title="Smarketer Office Location"
       className="absolute inset-0 grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
     />
     
     {/* Office Image Overlay */}
     {companyInfo.office_image && (
       <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-4 right-4 z-10 w-48 h-32 md:w-64 md:h-40 rounded-xl overflow-hidden shadow-2xl border-4 border-white dark:border-[#0A0F1C] cursor-pointer hover:scale-105 transition-transform"
          onClick={() => window.open(companyInfo.office_image, '_blank')}
       >
          <img 
            src={companyInfo.office_image} 
            alt="Office" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors"></div>
       </motion.div>
     )}
  </AnimatedSection>
);

// --- DESIGN COMPONENTS ---

const MinimalDesign = ({ t, companyInfo, darkMode, language, SOCIAL_LINKS }) => (
  <div className="container mx-auto px-4 lg:px-8 py-20">
    <AnimatedSection className="max-w-4xl mx-auto text-center mb-16">
      <h1 className={`text-4xl lg:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {t.heroTitle}
      </h1>
      <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {t.heroSubtitle}
      </p>
    </AnimatedSection>

    <div className="grid lg:grid-cols-2 gap-16 mb-20">
      <div className="space-y-12">
        <AnimatedSection delay={0.1}>
          <h3 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t.companyInfo}
          </h3>
          <div className="space-y-4">
             <div>
                <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{companyInfo.name}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{companyInfo.reg_number}</p>
             </div>
             <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{companyInfo.address}</p>
             <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <a href={`mailto:${companyInfo.email}`} className="text-[#5468E7] hover:underline hover:text-[#4353b8] transition-colors">{companyInfo.email}</a>
             </p>
             <p className={`text-lg font-bold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{companyInfo.phone}</p>
          </div>
        </AnimatedSection>
        
        <AnimatedSection delay={0.2}>
          <h3 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t.followUs}
          </h3>
          <div className="flex gap-4">
            {SOCIAL_LINKS.map((social, idx) => (
                <a key={idx} href={social.url} target="_blank" rel="noreferrer" 
                   className={`p-3 rounded-full transition-all hover:scale-110 ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  <social.icon className="w-6 h-6" style={{ color: social.color }} />
                </a>
            ))}
          </div>
        </AnimatedSection>
      </div>

      <AnimatedSection delay={0.3} className={`p-8 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
        <ContactForm darkMode={darkMode} language={language} />
      </AnimatedSection>
    </div>
    
    <MapComponent companyInfo={companyInfo} />
  </div>
);

const GradientDesign = ({ t, companyInfo, darkMode, language, SOCIAL_LINKS }) => (
  <div>
    {/* Hero */}
    <div className={`relative pt-40 pb-20 overflow-hidden ${darkMode ? 'bg-gradient-to-b from-[#0D1126] to-[#0A0F1C]' : 'bg-gradient-to-b from-[#F4F7FF] to-white'}`}>
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <AnimatedSection className="container mx-auto px-4 text-center relative z-10">
           <h1 className="text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#5468E7] to-[#3A4BCF]">
              {t.heroTitle}
           </h1>
           <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t.heroSubtitle}
           </p>
        </AnimatedSection>
    </div>

    <div className="container mx-auto px-4 lg:px-8 py-20">
       <div className="grid lg:grid-cols-3 gap-8 mb-20">
          
          {/* Col 1: Info */}
          <AnimatedSection delay={0.1} className={`p-8 rounded-2xl border ${darkMode ? 'bg-[#0D1126]/50 border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}>
             <h3 className="text-xl font-bold mb-6 text-[#5468E7] uppercase tracking-wider">
                {t.companyInfo}
             </h3>
             <div className="space-y-6">
                 <div className="space-y-1">
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{companyInfo.name}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{companyInfo.reg_number}</p>
                 </div>
                 <div className="h-px bg-gray-200 dark:bg-white/10"></div>
                 <div>
                    <span className="text-xs text-gray-500 uppercase block mb-1">{t.address}</span>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{companyInfo.address}</p>
                 </div>
                 <div>
                    <span className="text-xs text-gray-500 uppercase block mb-1">{t.phone}</span>
                    <p className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{companyInfo.phone}</p>
                 </div>
                 <div>
                    <span className="text-xs text-gray-500 uppercase block mb-1">{t.email}</span>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <a href={`mailto:${companyInfo.email}`} className="text-[#5468E7] hover:underline hover:text-[#4353b8] transition-colors">{companyInfo.email}</a>
                    </p>
                 </div>
                 <div>
                    <span className="text-xs text-gray-500 uppercase block mb-1">{t.hours}</span>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{companyInfo.hours}</p>
                 </div>
             </div>
          </AnimatedSection>

          {/* Col 2: Form */}
          <AnimatedSection delay={0.2} className={`lg:col-span-1 p-8 rounded-2xl border ${darkMode ? 'bg-[#0D1126]/50 border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}>
              <h3 className="text-xl font-bold mb-6 text-[#5468E7] uppercase tracking-wider">
                 {t.formTitle}
              </h3>
              <ContactForm darkMode={darkMode} language={language} />
          </AnimatedSection>

          {/* Col 3: Socials */}
          <AnimatedSection delay={0.3} className={`p-8 rounded-2xl border flex flex-col justify-start items-center gap-6 ${darkMode ? 'bg-[#0D1126]/50 border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}>
              <h3 className="text-xl font-bold mb-2 text-[#5468E7] uppercase tracking-wider w-full text-center">
                 {t.followUs}
              </h3>
              <div className="flex flex-col gap-4 w-full">
                 {SOCIAL_LINKS.map((social, idx) => (
                    <a 
                      key={idx} 
                      href={social.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all hover:scale-105 shadow-sm border ${
                        darkMode 
                         ? 'bg-[#0A0F1C] border-white/5 hover:border-white/20' 
                         : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                       <div className="p-2 rounded-full" style={{ backgroundColor: `${social.color}20` }}>
                           <social.icon className="w-6 h-6" style={{ color: social.color }} />
                       </div>
                       <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {social.platform}
                       </span>
                    </a>
                 ))}
              </div>
          </AnimatedSection>
       </div>

       <MapComponent companyInfo={companyInfo} />
    </div>
  </div>
);

const CardDesign = ({ t, companyInfo, darkMode, language, SOCIAL_LINKS }) => {
  const cardClass = `p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col ${
    darkMode 
      ? 'bg-[#0D1126] border-white/10 hover:border-[#5468E7]/30' 
      : 'bg-white border-gray-100 hover:border-[#5468E7]/30'
  }`;

  const iconContainerClass = `w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-[#5468E7] to-[#3A4BCF] text-white shadow-lg`;

  return (
    <div className="pb-20">
      {/* Simple Hero */}
      <div className="py-20 text-center container mx-auto px-4">
        <AnimatedSection>
          <h1 className={`text-4xl lg:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
            {t.heroTitle}
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-[#5468E7] to-[#3A4BCF] mx-auto rounded-full"></div>
        </AnimatedSection>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Company Details Card */}
          <AnimatedSection delay={0.1} className={cardClass}>
             <div className={iconContainerClass}>
                <Building2 className="w-6 h-6" />
             </div>
             <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.companyInfo}</h3>
             <div className="space-y-2 text-sm flex-1">
                <p className={`font-semibold text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{companyInfo.name}</p>
                <div className="flex items-center gap-2 opacity-70">
                   <Hash className="w-4 h-4" />
                   <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{companyInfo.reg_number}</span>
                </div>
                <div className="flex items-start gap-2 mt-4">
                   <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-[#5468E7]" />
                   <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{companyInfo.address}</p>
                </div>
             </div>
          </AnimatedSection>

          {/* Contact Methods Card */}
          <AnimatedSection delay={0.2} className={cardClass}>
             <div className={iconContainerClass}>
                <Phone className="w-6 h-6" />
             </div>
             <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Contact Details</h3>
             <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <Phone className="w-4 h-4 text-[#5468E7]" />
                   </div>
                   <span className={`font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{companyInfo.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <Mail className="w-4 h-4 text-[#5468E7]" />
                   </div>
                   <a href={`mailto:${companyInfo.email}`} className="text-[#5468E7] hover:underline hover:text-[#4353b8] transition-colors font-medium">
                      {companyInfo.email}
                   </a>
                </div>
             </div>
          </AnimatedSection>

          {/* Business Hours Card */}
          <AnimatedSection delay={0.3} className={cardClass}>
             <div className={iconContainerClass}>
                <Clock className="w-6 h-6" />
             </div>
             <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.hours}</h3>
             <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{companyInfo.hours}</span>
                </div>
             </div>
          </AnimatedSection>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
           
           {/* Form Card - Takes 2 cols */}
           <AnimatedSection delay={0.4} className={`lg:col-span-2 ${cardClass}`}>
              <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.formTitle}</h3>
              <ContactForm darkMode={darkMode} language={language} />
           </AnimatedSection>

           {/* Socials Card - Takes 1 col */}
           <AnimatedSection delay={0.5} className={cardClass}>
              <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.followUs}</h3>
              <div className="grid grid-cols-2 gap-4">
                 {SOCIAL_LINKS.map((social, idx) => (
                    <a 
                      key={idx} 
                      href={social.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all hover:scale-105 border ${
                        darkMode 
                         ? 'bg-[#0A0F1C] border-white/5 hover:border-[#5468E7]/50' 
                         : 'bg-gray-50 border-gray-100 hover:border-[#5468E7]/50'
                      }`}
                    >
                       <social.icon className="w-8 h-8 mb-2" style={{ color: social.color }} />
                       <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {social.platform}
                       </span>
                    </a>
                 ))}
              </div>
           </AnimatedSection>

        </div>

        {/* Map Full Width */}
        <MapComponent companyInfo={companyInfo} />

      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

const ContactPage = () => {
  const { darkMode } = useTheme();
  const { language } = useLanguage();
  const { content: pc } = usePageContent('contact', {});

  // Merge DB text overrides over defaults
  const lang = language === 'ka' ? 'ka' : 'en';
  const defaultT = DEFAULT_TEXTS[lang];
  const t = { ...defaultT };
  for (const key of Object.keys(defaultT)) {
    const dbKey = `texts_${lang}_${key}`;
    if (pc[dbKey]) t[key] = pc[dbKey];
  }

  // Social links from DB or defaults
  const SOCIAL_LINKS = (pc.social_links && Array.isArray(pc.social_links) && pc.social_links.length > 0)
    ? pc.social_links.map((sl, i) => ({
        ...DEFAULT_SOCIAL_LINKS[i],
        platform: sl.platform || DEFAULT_SOCIAL_LINKS[i]?.platform || '',
        url: sl.url || DEFAULT_SOCIAL_LINKS[i]?.url || '#',
        color: sl.color || DEFAULT_SOCIAL_LINKS[i]?.color || '#000',
        icon: DEFAULT_SOCIAL_LINKS[i]?.icon || (() => null),
      }))
    : DEFAULT_SOCIAL_LINKS;
  const [designStyle, setDesignStyle] = useState('card'); // Default to card

  // Company Info State with Default Fallback
  const [companyInfo, setCompanyInfo] = useState({
    name: language === 'ka' ? 'შპს „სმარკეტერი"' : 'Smarketer LLC',
    reg_number: language === 'ka' ? 'ს/ნ 443857113' : 'ID 443857113',
    address: language === 'ka' ? 'ილია ჭავჭავაძის გამზირი 33ე, თბილისი, საქართველო. 0179' : '33e Ilia Chavchavadze Avenue, Tbilisi 0179, Georgia',
    phone: '+995 500 70 20 80',
    email: 'info@smarketer.ge',
    hours: language === 'ka' ? 'ორშაბათი - პარასკევი 10:00-19:00' : 'Monday - Friday 10:00-19:00',
    office_image: 'https://i.postimg.cc/9FCNL53f/Screenshot-2026-01-03-at-00-51-38.png'
  });

  useEffect(() => {
    const fetchSettings = async () => {
        const { data } = await supabase.from('contact_settings').select('*').limit(1).maybeSingle();
        if (data) {
             setDesignStyle(data.design_style || 'card');
             setCompanyInfo(prev => ({
                 ...prev,
                 name: language === 'ka' ? (data.company_name_ka || 'შპს „სმარკეტერი"') : (data.company_name_en || 'Smarketer LLC'),
                 reg_number: language === 'ka' ? (data.registration_number ? `ს/ნ ${data.registration_number}` : 'ს/ნ 443857113') : (data.registration_number ? `ID ${data.registration_number}` : 'ID 443857113'),
                 address: language === 'ka' ? (data.address_ka || prev.address) : (data.address_en || prev.address),
                 hours: language === 'ka' ? (data.business_hours_ka || 'ორშაბათი - პარასკევი 10:00-19:00') : (data.business_hours_en || 'Monday - Friday 10:00-19:00'),
                 email: data.email || prev.email, // Ensure email is updated from DB as well
                 phone: (data.phone_numbers && data.phone_numbers.length > 0) ? data.phone_numbers[0].number : prev.phone, // Assuming first phone number if available
                 office_image: data.office_image_url || prev.office_image
             }));
        }
    };
    fetchSettings();
    
    // Subscribe to changes
    const subscription = supabase
      .channel('contact_settings_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'contact_settings' }, () => {
        fetchSettings();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    }
  }, [language]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F4F7FF]'}`}>
      <SEO slug="/contact" fallbackTitle={t.heroTitle} />
      <Header />

      {designStyle === 'minimal' && <MinimalDesign t={t} companyInfo={companyInfo} darkMode={darkMode} language={language} SOCIAL_LINKS={SOCIAL_LINKS} />}
      {designStyle === 'gradient' && <GradientDesign t={t} companyInfo={companyInfo} darkMode={darkMode} language={language} SOCIAL_LINKS={SOCIAL_LINKS} />}
      {designStyle === 'card' && <CardDesign t={t} companyInfo={companyInfo} darkMode={darkMode} language={language} SOCIAL_LINKS={SOCIAL_LINKS} />}
      
      <Footer />
    </div>
  );
};

export default ContactPage;