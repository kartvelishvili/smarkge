import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';

const ContactForm = ({ darkMode }) => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    serviceType: '',
    projectDescription: '',
    budget: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Insert into Database
      const { data: insertedData, error } = await supabase.from('contact_messages').insert([{
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        subject: `${formData.serviceType} - ${formData.businessName}`,
        message: `Business: ${formData.businessName}\nService: ${formData.serviceType}\nBudget: ${formData.budget}\n\nDescription:\n${formData.projectDescription}`,
        status: 'new'
      }]).select().single();

      if (error) {
        if (error.code === '42501' || error.message.includes('row-level security')) {
           throw new Error(language === 'ka' ? 'წვდომა შეზღუდულია. გთხოვთ სცადოთ მოგვიანებით.' : 'Permission denied. Please try again later.');
        }
        throw error;
      }

      // 2. Send Email via Edge Function
      try {
        console.log("Triggering contact email notification...");
        const { error: funcError } = await supabase.functions.invoke('send-contact-email', {
          body: { 
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            subject: `${formData.serviceType} - ${formData.businessName}`,
            message: `Business: ${formData.businessName}\nService: ${formData.serviceType}\nBudget: ${formData.budget}\n\nDescription:\n${formData.projectDescription}`,
            id: insertedData?.id
          }
        });

        if (funcError) {
          console.error("Failed to invoke email function:", funcError);
          // Don't throw - allow success message to appear even if email fails
        }
      } catch (emailErr) {
        console.error("Email sending exception:", emailErr);
      }

      toast({
        title: language === 'ka' ? "წარმატება!" : "Success!",
        description: language === 'ka' ? "თქვენი შეტყობინება გაიგზავნა." : "Your message has been sent successfully.",
      });

      setFormData({
        fullName: '',
        businessName: '',
        email: '',
        phone: '',
        serviceType: '',
        projectDescription: '',
        budget: ''
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`py-20 lg:py-32 ${darkMode ? 'bg-[#0D1126]' : 'bg-white'}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className={`text-3xl lg:text-5xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
            {t('contact.title') || (language === 'ka' ? 'დაგვიკავშირდით' : 'Contact Us')}
          </h2>
          <p className={`text-lg lg:text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('contact.subtitle') || (language === 'ka' ? 'მზად ხართ დაიწყოთ პროექტი? შეავსეთ ფორმა.' : 'Ready to start a project? Fill out the form below.')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName" className={`mb-2 block ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                    {language === 'ka' ? 'სახელი *' : 'Full Name *'}
                  </Label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-[#0A0F1C] border-[#5468E7]/30 text-white focus:border-[#5468E7]' 
                        : 'bg-white border-gray-300 text-[#0A0F1C] focus:border-[#5468E7]'
                    } focus:outline-none`}
                  />
                </div>

                <div>
                  <Label htmlFor="businessName" className={`mb-2 block ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                    {language === 'ka' ? 'კომპანია *' : 'Business Name *'}
                  </Label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-[#0A0F1C] border-[#5468E7]/30 text-white focus:border-[#5468E7]' 
                        : 'bg-white border-gray-300 text-[#0A0F1C] focus:border-[#5468E7]'
                    } focus:outline-none`}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email" className={`mb-2 block ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                    {language === 'ka' ? 'ელ-ფოსტა *' : 'Email Address *'}
                  </Label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-[#0A0F1C] border-[#5468E7]/30 text-white focus:border-[#5468E7]' 
                        : 'bg-white border-gray-300 text-[#0A0F1C] focus:border-[#5468E7]'
                    } focus:outline-none`}
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className={`mb-2 block ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                    {language === 'ka' ? 'ტელეფონი' : 'Phone Number'}
                  </Label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-[#0A0F1C] border-[#5468E7]/30 text-white focus:border-[#5468E7]' 
                        : 'bg-white border-gray-300 text-[#0A0F1C] focus:border-[#5468E7]'
                    } focus:outline-none`}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="serviceType" className={`mb-2 block ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                  {language === 'ka' ? 'სერვისის ტიპი *' : 'Service Type *'}
                </Label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-[#0A0F1C] border-[#5468E7]/30 text-white focus:border-[#5468E7]' 
                      : 'bg-white border-gray-300 text-[#0A0F1C] focus:border-[#5468E7]'
                  } focus:outline-none`}
                >
                  <option value="">{language === 'ka' ? 'აირჩიეთ სერვისი' : 'Select a service'}</option>
                  <option value="website">{language === 'ka' ? 'ვებ-დეველოპმენტი' : 'Website Development'}</option>
                  <option value="social">{language === 'ka' ? 'სოციალური მედია' : 'Social Media Campaign'}</option>
                  <option value="both">{language === 'ka' ? 'ვებ + სოციალური' : 'Website + Social Media'}</option>
                  <option value="other">{language === 'ka' ? 'სხვა' : 'Other'}</option>
                </select>
              </div>

              <div>
                <Label htmlFor="projectDescription" className={`mb-2 block ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                  {language === 'ka' ? 'პროექტის აღწერა *' : 'Project Description *'}
                </Label>
                <textarea
                  id="projectDescription"
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleChange}
                  required
                  rows={5}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                    darkMode 
                      ? 'bg-[#0A0F1C] border-[#5468E7]/30 text-white focus:border-[#5468E7]' 
                      : 'bg-white border-gray-300 text-[#0A0F1C] focus:border-[#5468E7]'
                  } focus:outline-none`}
                  placeholder="..."
                />
              </div>

              <div>
                <Label htmlFor="budget" className={`mb-2 block ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                  {language === 'ka' ? 'ბიუჯეტი' : 'Budget Range'}
                </Label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-[#0A0F1C] border-[#5468E7]/30 text-white focus:border-[#5468E7]' 
                      : 'bg-white border-gray-300 text-[#0A0F1C] focus:border-[#5468E7]'
                  } focus:outline-none`}
                >
                  <option value="">{language === 'ka' ? 'აირჩიეთ ბიუჯეტი' : 'Select budget range'}</option>
                  <option value="5k-10k">$5,000 - $10,000</option>
                  <option value="10k-25k">$10,000 - $25,000</option>
                  <option value="25k-50k">$25,000 - $50,000</option>
                  <option value="50k+">$50,000+</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 text-lg bg-gradient-to-r from-[#5468E7] to-[#3A4BCF] hover:from-[#3A4BCF] hover:to-[#5468E7] text-white rounded-lg font-medium transition-all hover:scale-105 shadow-lg"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                {language === 'ka' ? 'გაგზავნა' : 'Send Message'}
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`p-8 rounded-2xl border h-fit ${
              darkMode 
                ? 'bg-gradient-to-br from-[#0A0F1C] to-[#1a1f35] border-[#5468E7]/30' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
            } shadow-xl`}
          >
            <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
              {language === 'ka' ? 'რა ხდება შემდეგ?' : 'What happens next?'}
            </h3>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5468E7] to-[#3A4BCF] flex items-center justify-center text-white font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                    {language === 'ka' ? 'მოთხოვნის მიღება' : 'We receive your request'}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'ka' ? 'ჩვენი გუნდი განიხილავს თქვენს პროექტს.' : 'Our team reviews your project details.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5468E7] to-[#3A4BCF] flex items-center justify-center text-white font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                    {language === 'ka' ? 'უფასო კონსულტაცია' : 'Free Consultation'}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'ka' ? 'დაგიკავშირდებით დეტალების განსახილველად.' : 'We schedule a call to discuss your needs.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5468E7] to-[#3A4BCF] flex items-center justify-center text-white font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                    {language === 'ka' ? 'შეთავაზება' : 'Proposal'}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'ka' ? 'მოგიმზადებთ ინდივიდუალურ შეთავაზებას.' : 'We prepare a tailored proposal for you.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5468E7] to-[#3A4BCF] flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                    {language === 'ka' ? 'დაწყება' : 'Kickoff'}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'ka' ? 'ვიწყებთ მუშაობას თქვენს პროექტზე.' : 'We start working on your project.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;