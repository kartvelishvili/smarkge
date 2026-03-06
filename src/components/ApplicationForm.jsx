import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const ApplicationForm = ({ onSubmit: parentOnSubmit }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    city: '',
    project_name: '',
    industry: '',
    project_stage: '',
    description: '',
    links: [''],
    participation_types: [],
    participation_details: '',
    start_timeline: '',
    main_goal: '',
    consent_agreed: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateEmail = (email) => {
    // Allow empty email since it's optional
    if (!email) return true;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    // Phone is required
    if (!phone || !phone.trim()) return false;
    const re = /^[\d\s\-\+\(\)]+$/;
    const digitsOnly = phone.replace(/\D/g, '');
    return re.test(phone) && digitsOnly.length >= 4; // Relaxed length check
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'phone':
        if (!validatePhone(value)) error = t('form.errors.phone_required') || "Valid phone number is required";
        break;
      case 'email':
        // Optional but if provided must be valid
        if (value && !validateEmail(value)) error = t('form.errors.email_invalid') || "Invalid email address";
        break;
      // All other fields are optional now
      default:
        break;
    }

    return error;
  };

  const handleBlur = (name) => {
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...formData.links];
    newLinks[index] = value;
    setFormData({ ...formData, links: newLinks });
  };

  const addLink = () => {
    setFormData({ ...formData, links: [...formData.links, ''] });
  };

  const removeLink = (index) => {
    const newLinks = formData.links.filter((_, i) => i !== index);
    setFormData({ ...formData, links: newLinks.length ? newLinks : [''] });
  };

  const handleParticipationToggle = (type) => {
    const current = formData.participation_types;
    const newTypes = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    
    setFormData(prev => ({ ...prev, participation_types: newTypes }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Only strictly validate phone
    const phoneError = validateField('phone', formData.phone);
    if (phoneError) {
      newErrors.phone = phoneError;
      isValid = false;
    }

    // Validate email format if provided
    const emailError = validateField('email', formData.email);
    if (emailError) {
        newErrors.email = emailError;
        isValid = false;
    }

    setErrors(newErrors);
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: t('form.toast_validation_error_title') || "Validation Error",
        description: t('form.toast_validation_error_desc') || "Please provide a valid phone number.",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get current session safely
      const { data: { session } } = await supabase.auth.getSession();
      
      const cleanedLinks = formData.links.filter(link => link && link.trim() !== '');
      
      // Generate UUID client-side for consistent referencing
      const applicationId = window.crypto.randomUUID();

      const submissionData = { 
        id: applicationId,
        ...formData, 
        // Ensure defaults for optional fields if they are empty strings
        full_name: formData.full_name || 'Anonymous',
        email: formData.email || '',
        city: formData.city || '',
        project_name: formData.project_name || 'Untitled Project',
        industry: formData.industry || 'other',
        project_stage: formData.project_stage || 'idea',
        description: formData.description || 'No description provided',
        start_timeline: formData.start_timeline || 'immediately',
        main_goal: formData.main_goal || '',
        links: cleanedLinks, 
        status: 'new',
        // Only attach user_id if we have a valid session
        user_id: session?.user?.id || null 
      };

      // 1. Insert into Supabase
      const { error: insertError } = await supabase
        .from('applications')
        .insert([submissionData]);

      if (insertError) {
        console.error("Supabase Insert Error:", insertError);
        throw insertError;
      }

      // 2. Trigger Email Edge Function
      try {
        console.log("Triggering email notification...");
        const { error: funcError } = await supabase.functions.invoke('send-application-email', {
          body: { ...submissionData } 
        });

        if (funcError) {
          console.error("Failed to invoke email function:", funcError);
          // Show warning toast but don't fail the whole process
          toast({
             variant: "default",
             className: "bg-yellow-600 text-white border-none",
             title: "Notice",
             description: "Application saved, but email notification might be delayed.",
          });
        }
      } catch (emailErr) {
        console.error("Email sending exception:", emailErr);
      }

      setIsSuccess(true);
      
      if (parentOnSubmit) {
        parentOnSubmit(submissionData);
      }
      
      toast({
        title: t('form.toast_success_title') || "Application Submitted!",
        description: t('form.toast_success_description') || "We have received your application and will contact you soon.",
        className: "bg-green-600 text-white border-none"
      });

    } catch (error) {
      console.error('Submission Exception:', error);
      
      let errorTitle = t('form.toast_error_title') || "Submission Failed";
      let errorDesc = error.message || "There was a problem submitting your application.";

      if (error.code === '42501' || error.message?.includes('row-level security')) {
        errorTitle = "Permission Denied";
        errorDesc = "Security policies prevented this submission. Please try again later.";
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorDesc,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className={`max-w-5xl mx-auto p-6 sm:p-8 rounded-xl shadow-lg ${
        isDark ? 'bg-gray-800/50' : 'bg-white'
      }`}
    >
      {isSuccess ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('form.success_title') || "Application Received!"}
          </h3>
          <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('form.success_message') || "Thank you for submitting your project. Our team will review it and get back to you shortly."}
          </p>
          <Button 
            onClick={() => {
              setIsSuccess(false);
              setFormData({
                full_name: '',
                phone: '',
                email: '',
                city: '',
                project_name: '',
                industry: '',
                project_stage: '',
                description: '',
                links: [''],
                participation_types: [],
                participation_details: '',
                start_timeline: '',
                main_goal: '',
                consent_agreed: false
              });
              setErrors({});
              setTouched({});
            }}
            className="bg-[#5468E7] hover:bg-[#4355d6] text-white"
          >
            {t('form.submit_another') || "Submit Another Application"}
          </Button>
        </motion.div>
      ) : (
        <>
           <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#5468E7] to-[#8E54E7] text-transparent bg-clip-text`}>
              {t('form.main_title') || "Apply for Partnership"}
            </h1>
            <div className="w-24 h-1.5 bg-[#5468E7] mx-auto rounded-full"></div>
          </motion.div>
          
          <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('form.title') || "Application Form"}
          </h2>

          {/* Contact Information */}
          <div className={`mb-8 p-6 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
            <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('form.contact_info') || "Contact Information"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name" className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                  {t('form.full_name') || "Full Name"}
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder={t('form.full_name_placeholder') || "John Doe"}
                  className={`mt-1 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900'}`}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="phone" className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                  {t('form.phone') || "Phone Number"} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder={t('form.phone_placeholder') || "+1 (555) 000-0000"}
                  className={`mt-1 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900'} ${
                    errors.phone ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                  {t('form.email') || "Email Address"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder={t('form.email_placeholder') || "john@example.com"}
                  className={`mt-1 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900'} ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="city" className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                  {t('form.city') || "City"}
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder={t('form.city_placeholder') || "New York"}
                  className={`mt-1 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900'}`}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div className={`mb-8 p-6 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
            <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('form.project_info') || "Project Information"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project_name" className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                  {t('form.project_name') || "Project Name"}
                </Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => handleChange('project_name', e.target.value)}
                  placeholder={t('form.project_name_placeholder') || "My Awesome Startup"}
                  className={`mt-1 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900'}`}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="industry" className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                  {t('form.industry') || "Industry"}
                </Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleChange('industry', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    className={`mt-1 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900'}`}
                  >
                    <SelectValue placeholder={t('form.industry_placeholder') || "Select Industry"} />
                  </SelectTrigger>
                  <SelectContent className={isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white'}>
                    <SelectItem value="technology">{t('form.industries.technology') || "Technology"}</SelectItem>
                    <SelectItem value="healthcare">{t('form.industries.healthcare') || "Healthcare"}</SelectItem>
                    <SelectItem value="education">{t('form.industries.education') || "Education"}</SelectItem>
                    <SelectItem value="ecommerce">{t('form.industries.ecommerce') || "E-commerce"}</SelectItem>
                    <SelectItem value="finance">{t('form.industries.finance') || "Finance"}</SelectItem>
                    <SelectItem value="real_estate">{t('form.industries.real_estate') || "Real Estate"}</SelectItem>
                    <SelectItem value="tourism">{t('form.industries.tourism') || "Tourism"}</SelectItem>
                    <SelectItem value="other">{t('form.industries.other') || "Other"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="project_stage" className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                  {t('form.project_stage') || "Project Stage"}
                </Label>
                <Select
                  value={formData.project_stage}
                  onValueChange={(value) => handleChange('project_stage', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    className={`mt-1 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900'}`}
                  >
                    <SelectValue placeholder={t('form.project_stage_placeholder') || "Select Stage"} />
                  </SelectTrigger>
                  <SelectContent className={isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white'}>
                    <SelectItem value="idea">{t('form.stages.idea') || "Idea Phase"}</SelectItem>
                    <SelectItem value="prototype">{t('form.stages.prototype') || "Prototype Ready"}</SelectItem>
                    <SelectItem value="mvp">{t('form.stages.mvp') || "MVP Live"}</SelectItem>
                    <SelectItem value="established">{t('form.stages.established') || "Established Business"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="start_timeline" className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                  {t('form.start_timeline') || "Start Timeline"}
                </Label>
                <Select
                  value={formData.start_timeline}
                  onValueChange={(value) => handleChange('start_timeline', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    className={`mt-1 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900'}`}
                  >
                    <SelectValue placeholder={t('form.start_timeline_placeholder') || "When to start?"} />
                  </SelectTrigger>
                  <SelectContent className={isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white'}>
                    <SelectItem value="immediately">{t('form.timeline.immediately') || "Immediately"}</SelectItem>
                    <SelectItem value="1-3-months">{t('form.timeline.1_3_months') || "1-3 Months"}</SelectItem>
                    <SelectItem value="3-6-months">{t('form.timeline.3_6_months') || "3-6 Months"}</SelectItem>
                    <SelectItem value="6-plus-months">{t('form.timeline.6_plus_months') || "6+ Months"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description" className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                  {t('form.description') || "Project Description"}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder={t('form.description_placeholder') || "Describe your project in detail..."}
                  rows={4}
                  className={`mt-1 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900'}`}
                  disabled={isSubmitting}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="main_goal" className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                  {t('form.main_goal') || "Main Goal"}
                </Label>
                <Textarea
                  id="main_goal"
                  value={formData.main_goal}
                  onChange={(e) => handleChange('main_goal', e.target.value)}
                  placeholder={t('form.main_goal_placeholder') || "What is the primary goal of this project?"}
                  rows={3}
                  className={`mt-1 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900'}`}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Links */}
          <div className={`mb-8 p-6 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
            <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('form.links') || "Relevant Links"}
            </h3>
            <div className="space-y-3">
              {formData.links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    placeholder={t('form.links_placeholder') || "https://..."}
                    className={`flex-1 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900'}`}
                    disabled={isSubmitting}
                  />
                  {formData.links.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeLink(index)}
                      className={isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : ''}
                      disabled={isSubmitting}
                    >
                      {t('form.remove') || "Remove"}
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addLink}
                className={`w-full ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : ''}`}
                disabled={isSubmitting}
              >
                {t('form.add_link') || "Add Another Link"}
              </Button>
            </div>
          </div>

          {/* Participation Types */}
          <div className={`mb-8 p-6 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
            <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('form.participation') || "Desired Participation"}
            </h3>
            <div className="space-y-3">
              {['startup_funding', 'grant_funding', 'investor_funding', 'partnership', 'other'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={formData.participation_types.includes(type)}
                    onCheckedChange={() => handleParticipationToggle(type)}
                    disabled={isSubmitting}
                  />
                  <Label
                    htmlFor={type}
                    className={`cursor-pointer ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                  >
                    {t(`form.participation_types.${type}`) || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Label htmlFor="participation_details" className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                {t('form.participation_details') || "Additional Details (Optional)"}
              </Label>
              <Textarea
                id="participation_details"
                value={formData.participation_details}
                onChange={(e) => handleChange('participation_details', e.target.value)}
                placeholder={t('form.participation_details_placeholder') || "Any specific details about the participation..."}
                rows={3}
                className={`mt-1 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900'}`}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Consent */}
          <div className={`mb-8 p-6 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                checked={formData.consent_agreed}
                onCheckedChange={(checked) => handleChange('consent_agreed', checked)}
                disabled={isSubmitting}
              />
              <Label
                htmlFor="consent"
                className={`cursor-pointer text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
              >
                {t('form.consent_text') || "I agree to the processing of my personal data for the purpose of this application."}
              </Label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#5468E7] hover:bg-[#4355d6] text-white py-6 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t('form.submitting') || "Submitting..."}
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                {t('form.submit') || "Submit Application"}
              </>
            )}
          </Button>
        </>
      )}
    </motion.form>
  );
};

export default ApplicationForm;