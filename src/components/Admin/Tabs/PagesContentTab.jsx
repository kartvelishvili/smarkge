import React, { useState, useEffect, useCallback } from 'react';
import {
  Save, ChevronDown, ChevronUp, Plus, Trash2, Upload, Image as ImageIcon,
  FileText, Globe, Building2, Shield, Scale, Phone, MessageCircle,
  Layers, Zap, BarChart, RefreshCw, Check, AlertCircle, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

// ═══════════════════════════════════════════
// PAGE DEFINITIONS — all editable pages
// ═══════════════════════════════════════════
const PAGE_DEFINITIONS = [
  {
    key: 'services',
    label: 'სერვისები / Services',
    icon: Layers,
    category: 'pages',
    fields: [
      { section: 'SEO & Meta', fields: [
        { key: 'meta_title_ka', label: 'Meta Title (KA)', type: 'text' },
        { key: 'meta_title_en', label: 'Meta Title (EN)', type: 'text' },
        { key: 'meta_desc_ka', label: 'Meta Description (KA)', type: 'textarea' },
        { key: 'meta_desc_en', label: 'Meta Description (EN)', type: 'textarea' },
      ]},
      { section: 'Hero', fields: [
        { key: 'hero_badge_ka', label: 'Badge (KA)', type: 'text' },
        { key: 'hero_badge_en', label: 'Badge (EN)', type: 'text' },
        { key: 'hero_title_start_ka', label: 'Title Start (KA)', type: 'text' },
        { key: 'hero_title_start_en', label: 'Title Start (EN)', type: 'text' },
        { key: 'hero_title_end_ka', label: 'Title End (Gradient) (KA)', type: 'text' },
        { key: 'hero_title_end_en', label: 'Title End (Gradient) (EN)', type: 'text' },
        { key: 'hero_text_ka', label: 'Hero Text (KA)', type: 'textarea' },
        { key: 'hero_text_en', label: 'Hero Text (EN)', type: 'textarea' },
        { key: 'cta_services_ka', label: 'CTA Button 1 (KA)', type: 'text' },
        { key: 'cta_services_en', label: 'CTA Button 1 (EN)', type: 'text' },
        { key: 'cta_consultation_ka', label: 'CTA Button 2 (KA)', type: 'text' },
        { key: 'cta_consultation_en', label: 'CTA Button 2 (EN)', type: 'text' },
      ]},
      { section: 'Web Design Section', fields: [
        { key: 'web_badge_ka', label: 'Badge (KA)', type: 'text' },
        { key: 'web_badge_en', label: 'Badge (EN)', type: 'text' },
        { key: 'web_title_start_ka', label: 'Title Start (KA)', type: 'text' },
        { key: 'web_title_start_en', label: 'Title Start (EN)', type: 'text' },
        { key: 'web_title_end_ka', label: 'Title End (KA)', type: 'text' },
        { key: 'web_title_end_en', label: 'Title End (EN)', type: 'text' },
        { key: 'web_text_ka', label: 'Description (KA)', type: 'textarea' },
        { key: 'web_text_en', label: 'Description (EN)', type: 'textarea' },
        { key: 'speed_title_ka', label: 'Speed Card Title (KA)', type: 'text' },
        { key: 'speed_title_en', label: 'Speed Card Title (EN)', type: 'text' },
        { key: 'speed_desc_ka', label: 'Speed Card Desc (KA)', type: 'text' },
        { key: 'speed_desc_en', label: 'Speed Card Desc (EN)', type: 'text' },
        { key: 'seo_card_title_ka', label: 'SEO Card Title (KA)', type: 'text' },
        { key: 'seo_card_title_en', label: 'SEO Card Title (EN)', type: 'text' },
        { key: 'seo_card_desc_ka', label: 'SEO Card Desc (KA)', type: 'text' },
        { key: 'seo_card_desc_en', label: 'SEO Card Desc (EN)', type: 'text' },
      ]},
      { section: 'Web Design Service Card', fields: [
        { key: 'web_card_title_ka', label: 'Card Title (KA)', type: 'text' },
        { key: 'web_card_title_en', label: 'Card Title (EN)', type: 'text' },
        { key: 'web_card_desc_ka', label: 'Card Description (KA)', type: 'textarea' },
        { key: 'web_card_desc_en', label: 'Card Description (EN)', type: 'textarea' },
        { key: 'web_card_features_ka', label: 'Features (KA) — one per line', type: 'textarea' },
        { key: 'web_card_features_en', label: 'Features (EN) — one per line', type: 'textarea' },
        { key: 'web_card_link_text_ka', label: 'Button Text (KA)', type: 'text' },
        { key: 'web_card_link_text_en', label: 'Button Text (EN)', type: 'text' },
      ]},
      { section: 'Social Media Section', fields: [
        { key: 'social_badge_ka', label: 'Badge (KA)', type: 'text' },
        { key: 'social_badge_en', label: 'Badge (EN)', type: 'text' },
        { key: 'social_title_start_ka', label: 'Title Start (KA)', type: 'text' },
        { key: 'social_title_start_en', label: 'Title Start (EN)', type: 'text' },
        { key: 'social_title_end_ka', label: 'Title End (KA)', type: 'text' },
        { key: 'social_title_end_en', label: 'Title End (EN)', type: 'text' },
        { key: 'social_text_ka', label: 'Description (KA)', type: 'textarea' },
        { key: 'social_text_en', label: 'Description (EN)', type: 'textarea' },
        { key: 'target_title_ka', label: 'Target Card Title (KA)', type: 'text' },
        { key: 'target_title_en', label: 'Target Card Title (EN)', type: 'text' },
        { key: 'target_desc_ka', label: 'Target Card Desc (KA)', type: 'text' },
        { key: 'target_desc_en', label: 'Target Card Desc (EN)', type: 'text' },
        { key: 'analytics_title_ka', label: 'Analytics Card Title (KA)', type: 'text' },
        { key: 'analytics_title_en', label: 'Analytics Card Title (EN)', type: 'text' },
        { key: 'analytics_desc_ka', label: 'Analytics Card Desc (KA)', type: 'text' },
        { key: 'analytics_desc_en', label: 'Analytics Card Desc (EN)', type: 'text' },
      ]},
      { section: 'Social Media Service Card', fields: [
        { key: 'social_card_title_ka', label: 'Card Title (KA)', type: 'text' },
        { key: 'social_card_title_en', label: 'Card Title (EN)', type: 'text' },
        { key: 'social_card_desc_ka', label: 'Card Description (KA)', type: 'textarea' },
        { key: 'social_card_desc_en', label: 'Card Description (EN)', type: 'textarea' },
        { key: 'social_card_features_ka', label: 'Features (KA) — one per line', type: 'textarea' },
        { key: 'social_card_features_en', label: 'Features (EN) — one per line', type: 'textarea' },
        { key: 'social_card_link_text_ka', label: 'Button Text (KA)', type: 'text' },
        { key: 'social_card_link_text_en', label: 'Button Text (EN)', type: 'text' },
      ]},
      { section: 'Additional Services', fields: [
        { key: 'additional_title_ka', label: 'Section Title (KA)', type: 'text' },
        { key: 'additional_title_en', label: 'Section Title (EN)', type: 'text' },
        { key: 'additional_sub_ka', label: 'Section Subtitle (KA)', type: 'text' },
        { key: 'additional_sub_en', label: 'Section Subtitle (EN)', type: 'text' },
        { key: 'additional_services', label: 'Services List', type: 'array', itemFields: [
          { key: 'title_ka', label: 'Title (KA)', type: 'text' },
          { key: 'title_en', label: 'Title (EN)', type: 'text' },
          { key: 'desc_ka', label: 'Description (KA)', type: 'textarea' },
          { key: 'desc_en', label: 'Description (EN)', type: 'textarea' },
          { key: 'gradient', label: 'Gradient CSS', type: 'text' },
        ]},
      ]},
      { section: 'Why Smarketer', fields: [
        { key: 'why_title_ka', label: 'Title (KA)', type: 'text' },
        { key: 'why_title_en', label: 'Title (EN)', type: 'text' },
        { key: 'why_desc_ka', label: 'Description (KA)', type: 'textarea' },
        { key: 'why_desc_en', label: 'Description (EN)', type: 'textarea' },
        { key: 'why_points_ka', label: 'Points (KA) — one per line', type: 'textarea' },
        { key: 'why_points_en', label: 'Points (EN) — one per line', type: 'textarea' },
      ]},
      { section: 'Stats', fields: [
        { key: 'stat_sites_value', label: 'Sites Value', type: 'text' },
        { key: 'stat_sites_label_ka', label: 'Sites Label (KA)', type: 'text' },
        { key: 'stat_sites_label_en', label: 'Sites Label (EN)', type: 'text' },
        { key: 'stat_budget_value', label: 'Budget Value', type: 'text' },
        { key: 'stat_budget_label_ka', label: 'Budget Label (KA)', type: 'text' },
        { key: 'stat_budget_label_en', label: 'Budget Label (EN)', type: 'text' },
        { key: 'stat_secure_value', label: 'Secure Value', type: 'text' },
        { key: 'stat_secure_label_ka', label: 'Secure Label (KA)', type: 'text' },
        { key: 'stat_secure_label_en', label: 'Secure Label (EN)', type: 'text' },
        { key: 'stat_exp_value', label: 'Experience Value', type: 'text' },
        { key: 'stat_exp_label_ka', label: 'Experience Label (KA)', type: 'text' },
        { key: 'stat_exp_label_en', label: 'Experience Label (EN)', type: 'text' },
      ]},
      { section: 'FAQ', fields: [
        { key: 'faq_title_ka', label: 'Section Title (KA)', type: 'text' },
        { key: 'faq_title_en', label: 'Section Title (EN)', type: 'text' },
        { key: 'faq_sub_ka', label: 'Subtitle (KA)', type: 'text' },
        { key: 'faq_sub_en', label: 'Subtitle (EN)', type: 'text' },
        { key: 'faq_items', label: 'FAQ Items', type: 'array', itemFields: [
          { key: 'q_ka', label: 'Question (KA)', type: 'text' },
          { key: 'q_en', label: 'Question (EN)', type: 'text' },
          { key: 'a_ka', label: 'Answer (KA)', type: 'textarea' },
          { key: 'a_en', label: 'Answer (EN)', type: 'textarea' },
        ]},
      ]},
      { section: 'Bottom CTA', fields: [
        { key: 'cta_footer_title_ka', label: 'Title (KA)', type: 'text' },
        { key: 'cta_footer_title_en', label: 'Title (EN)', type: 'text' },
        { key: 'cta_footer_text_ka', label: 'Text (KA)', type: 'textarea' },
        { key: 'cta_footer_text_en', label: 'Text (EN)', type: 'textarea' },
        { key: 'cta_footer_btn1_ka', label: 'Button 1 (KA)', type: 'text' },
        { key: 'cta_footer_btn1_en', label: 'Button 1 (EN)', type: 'text' },
        { key: 'cta_footer_btn2_ka', label: 'Button 2 (KA)', type: 'text' },
        { key: 'cta_footer_btn2_en', label: 'Button 2 (EN)', type: 'text' },
      ]},
    ]
  },
  {
    key: 'contact',
    label: 'კონტაქტი / Contact',
    icon: Phone,
    category: 'pages',
    fields: [
      { section: 'Hero & Labels (KA)', fields: [
        { key: 'texts_ka_heroTitle', label: 'Hero Title (KA)', type: 'text' },
        { key: 'texts_ka_heroSubtitle', label: 'Hero Subtitle (KA)', type: 'text' },
        { key: 'texts_ka_companyInfo', label: 'Company Info Label (KA)', type: 'text' },
        { key: 'texts_ka_address', label: 'Address Label (KA)', type: 'text' },
        { key: 'texts_ka_phone', label: 'Phone Label (KA)', type: 'text' },
        { key: 'texts_ka_email', label: 'Email Label (KA)', type: 'text' },
        { key: 'texts_ka_hours', label: 'Hours Label (KA)', type: 'text' },
        { key: 'texts_ka_followUs', label: 'Follow Us (KA)', type: 'text' },
        { key: 'texts_ka_formTitle', label: 'Form Title (KA)', type: 'text' },
        { key: 'texts_ka_sendButton', label: 'Send Button (KA)', type: 'text' },
      ]},
      { section: 'Hero & Labels (EN)', fields: [
        { key: 'texts_en_heroTitle', label: 'Hero Title (EN)', type: 'text' },
        { key: 'texts_en_heroSubtitle', label: 'Hero Subtitle (EN)', type: 'text' },
        { key: 'texts_en_companyInfo', label: 'Company Info Label (EN)', type: 'text' },
        { key: 'texts_en_address', label: 'Address Label (EN)', type: 'text' },
        { key: 'texts_en_phone', label: 'Phone Label (EN)', type: 'text' },
        { key: 'texts_en_email', label: 'Email Label (EN)', type: 'text' },
        { key: 'texts_en_hours', label: 'Hours Label (EN)', type: 'text' },
        { key: 'texts_en_followUs', label: 'Follow Us (EN)', type: 'text' },
        { key: 'texts_en_formTitle', label: 'Form Title (EN)', type: 'text' },
        { key: 'texts_en_sendButton', label: 'Send Button (EN)', type: 'text' },
      ]},
      { section: 'Company Contact Details', fields: [
        { key: 'company_email', label: 'Email', type: 'text' },
        { key: 'company_phone', label: 'Phone', type: 'text' },
        { key: 'company_address_ka', label: 'Address (KA)', type: 'text' },
        { key: 'company_address_en', label: 'Address (EN)', type: 'text' },
        { key: 'company_hours_ka', label: 'Hours (KA)', type: 'text' },
        { key: 'company_hours_en', label: 'Hours (EN)', type: 'text' },
        { key: 'company_reg_number', label: 'Registration #', type: 'text' },
      ]},
      { section: 'Social Links', fields: [
        { key: 'social_links', label: 'Social Links', type: 'array', itemFields: [
          { key: 'platform', label: 'Platform Name', type: 'text' },
          { key: 'url', label: 'URL', type: 'text' },
          { key: 'color', label: 'Color', type: 'text' },
        ]},
      ]},
    ]
  },
  ...['healthcare', 'real_estate', 'ecommerce', 'education', 'tourism', 'b2b'].map(industry => ({
    key: `industry_${industry}`,
    label: `ინდუსტრია: ${industry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
    icon: Building2,
    category: 'industries',
    fields: [
      { section: 'Images & Theme', fields: [
        { key: 'hero_image', label: 'Hero Image URL', type: 'image' },
        { key: 'badge_label', label: 'Badge Label', type: 'text' },
        { key: 'badge_value', label: 'Badge Value', type: 'text' },
      ]},
      { section: 'Content (EN)', fields: [
        { key: 'en_title', label: 'Title', type: 'text' },
        { key: 'en_subtitle', label: 'Subtitle', type: 'text' },
        { key: 'en_description', label: 'Description', type: 'textarea' },
        { key: 'en_projectsTitle', label: 'Projects Title', type: 'text' },
        { key: 'en_projectsDesc', label: 'Projects Desc', type: 'text' },
        { key: 'en_cta', label: 'CTA Text', type: 'text' },
        { key: 'en_ctaBtn', label: 'CTA Button', type: 'text' },
        { key: 'en_whyTitle', label: 'Why Title', type: 'text' },
        { key: 'en_keyServicesTitle', label: 'Key Services Title', type: 'text' },
        { key: 'en_services', label: 'Services — one per line', type: 'textarea' },
        { key: 'en_stats', label: 'Stats', type: 'array', itemFields: [
          { key: 'value', label: 'Value', type: 'text' },
          { key: 'label', label: 'Label', type: 'text' },
        ]},
        { key: 'en_features', label: 'Features', type: 'array', itemFields: [
          { key: 'label', label: 'Label', type: 'text' },
        ]},
      ]},
      { section: 'Content (KA)', fields: [
        { key: 'ka_title', label: 'სათაური', type: 'text' },
        { key: 'ka_subtitle', label: 'ქვესათაური', type: 'text' },
        { key: 'ka_description', label: 'აღწერა', type: 'textarea' },
        { key: 'ka_projectsTitle', label: 'პროექტების სათაური', type: 'text' },
        { key: 'ka_projectsDesc', label: 'პროექტების აღწერა', type: 'text' },
        { key: 'ka_cta', label: 'CTA ტექსტი', type: 'text' },
        { key: 'ka_ctaBtn', label: 'CTA ღილაკი', type: 'text' },
        { key: 'ka_whyTitle', label: 'რატომ სათაური', type: 'text' },
        { key: 'ka_keyServicesTitle', label: 'სერვისების სათაური', type: 'text' },
        { key: 'ka_services', label: 'სერვისები — თითო ხაზზე', type: 'textarea' },
        { key: 'ka_stats', label: 'სტატისტიკა', type: 'array', itemFields: [
          { key: 'value', label: 'მნიშვნელობა', type: 'text' },
          { key: 'label', label: 'ლეიბლი', type: 'text' },
        ]},
        { key: 'ka_features', label: 'ფიჩერები', type: 'array', itemFields: [
          { key: 'label', label: 'ლეიბლი', type: 'text' },
        ]},
      ]},
    ]
  })),
  {
    key: 'privacy',
    label: 'კონფიდენციალურობა / Privacy',
    icon: Shield,
    category: 'legal',
    fields: [
      { section: 'Page Header', fields: [
        { key: 'title_en', label: 'Title (EN)', type: 'text' },
        { key: 'title_ka', label: 'Title (KA)', type: 'text' },
        { key: 'subtitle_en', label: 'Subtitle (EN)', type: 'text' },
        { key: 'subtitle_ka', label: 'Subtitle (KA)', type: 'text' },
        { key: 'last_updated_en', label: 'Last Updated (EN)', type: 'text' },
        { key: 'last_updated_ka', label: 'Last Updated (KA)', type: 'text' },
      ]},
      { section: 'Sections', fields: [
        { key: 'sections', label: 'Content Sections', type: 'array', itemFields: [
          { key: 'id', label: 'Section ID', type: 'text' },
          { key: 'title_en', label: 'Title (EN)', type: 'text' },
          { key: 'title_ka', label: 'Title (KA)', type: 'text' },
          { key: 'content_en', label: 'Content (EN)', type: 'richtext' },
          { key: 'content_ka', label: 'Content (KA)', type: 'richtext' },
        ]},
      ]},
    ]
  },
  {
    key: 'terms',
    label: 'წესები / Terms',
    icon: Scale,
    category: 'legal',
    fields: [
      { section: 'Page Header', fields: [
        { key: 'title_en', label: 'Title (EN)', type: 'text' },
        { key: 'title_ka', label: 'Title (KA)', type: 'text' },
        { key: 'subtitle_en', label: 'Subtitle (EN)', type: 'text' },
        { key: 'subtitle_ka', label: 'Subtitle (KA)', type: 'text' },
        { key: 'last_updated_en', label: 'Last Updated (EN)', type: 'text' },
        { key: 'last_updated_ka', label: 'Last Updated (KA)', type: 'text' },
      ]},
      { section: 'Sections', fields: [
        { key: 'sections', label: 'Content Sections', type: 'array', itemFields: [
          { key: 'id', label: 'Section ID', type: 'text' },
          { key: 'title_en', label: 'Title (EN)', type: 'text' },
          { key: 'title_ka', label: 'Title (KA)', type: 'text' },
          { key: 'content_en', label: 'Content (EN)', type: 'richtext' },
          { key: 'content_ka', label: 'Content (KA)', type: 'richtext' },
        ]},
      ]},
    ]
  },
  {
    key: 'about',
    label: 'ჩვენ შესახებ / About Us',
    icon: Building2,
    category: 'pages',
    fields: [
      { section: 'Company Info', fields: [
        { key: 'hero_image', label: 'Hero Image URL', type: 'image' },
        { key: 'company_name_ka', label: 'Company Name (KA)', type: 'text' },
        { key: 'company_name_en', label: 'Company Name (EN)', type: 'text' },
        { key: 'tagline_ka', label: 'Tagline (KA)', type: 'text' },
        { key: 'tagline_en', label: 'Tagline (EN)', type: 'text' },
      ]},
      { section: 'About Section', fields: [
        { key: 'about_title_ka', label: 'About Title (KA)', type: 'text' },
        { key: 'about_title_en', label: 'About Title (EN)', type: 'text' },
        { key: 'about_desc_ka', label: 'About Description (KA)', type: 'textarea' },
        { key: 'about_desc_en', label: 'About Description (EN)', type: 'textarea' },
      ]},
      { section: 'Mission & Vision', fields: [
        { key: 'mission_title_ka', label: 'Mission Title (KA)', type: 'text' },
        { key: 'mission_title_en', label: 'Mission Title (EN)', type: 'text' },
        { key: 'mission_desc_ka', label: 'Mission Desc (KA)', type: 'textarea' },
        { key: 'mission_desc_en', label: 'Mission Desc (EN)', type: 'textarea' },
        { key: 'vision_title_ka', label: 'Vision Title (KA)', type: 'text' },
        { key: 'vision_title_en', label: 'Vision Title (EN)', type: 'text' },
        { key: 'vision_desc_ka', label: 'Vision Desc (KA)', type: 'textarea' },
        { key: 'vision_desc_en', label: 'Vision Desc (EN)', type: 'textarea' },
      ]},
      { section: 'Services List', fields: [
        { key: 'services_list', label: 'Services', type: 'array', itemFields: [
          { key: 'title_en', label: 'Title (EN)', type: 'text' },
          { key: 'title_ka', label: 'Title (KA)', type: 'text' },
          { key: 'desc_en', label: 'Desc (EN)', type: 'text' },
          { key: 'desc_ka', label: 'Desc (KA)', type: 'text' },
          { key: 'icon', label: 'Icon Name', type: 'text' },
        ]},
      ]},
      { section: 'Values', fields: [
        { key: 'values_list', label: 'Core Values', type: 'array', itemFields: [
          { key: 'title_en', label: 'Title (EN)', type: 'text' },
          { key: 'title_ka', label: 'Title (KA)', type: 'text' },
          { key: 'desc_en', label: 'Desc (EN)', type: 'text' },
          { key: 'desc_ka', label: 'Desc (KA)', type: 'text' },
          { key: 'icon', label: 'Icon Name', type: 'text' },
        ]},
      ]},
      { section: 'Stats', fields: [
        { key: 'stats_list', label: 'Stats', type: 'array', itemFields: [
          { key: 'number', label: 'Number', type: 'text' },
          { key: 'label_en', label: 'Label (EN)', type: 'text' },
          { key: 'label_ka', label: 'Label (KA)', type: 'text' },
        ]},
      ]},
    ]
  },
  {
    key: 'home_faq',
    label: 'FAQ (მთავარი) / FAQ (Home)',
    icon: MessageCircle,
    category: 'sections',
    fields: [
      { section: 'Section Header', fields: [
        { key: 'title_en', label: 'Title (EN)', type: 'text' },
        { key: 'title_ka', label: 'Title (KA)', type: 'text' },
        { key: 'subtitle_en', label: 'Subtitle (EN)', type: 'text' },
        { key: 'subtitle_ka', label: 'Subtitle (KA)', type: 'text' },
      ]},
      { section: 'FAQ Items', fields: [
        { key: 'items', label: 'Questions & Answers', type: 'array', itemFields: [
          { key: 'question_en', label: 'Question (EN)', type: 'text' },
          { key: 'question_ka', label: 'Question (KA)', type: 'text' },
          { key: 'answer_en', label: 'Answer (EN)', type: 'textarea' },
          { key: 'answer_ka', label: 'Answer (KA)', type: 'textarea' },
        ]},
      ]},
    ]
  },
  {
    key: 'home_pricing',
    label: 'ფასები (მთავარი) / Pricing (Home)',
    icon: BarChart,
    category: 'sections',
    fields: [
      { section: 'Section Header', fields: [
        { key: 'title_en', label: 'Title (EN)', type: 'text' },
        { key: 'title_ka', label: 'Title (KA)', type: 'text' },
        { key: 'subtitle_en', label: 'Subtitle (EN)', type: 'text' },
        { key: 'subtitle_ka', label: 'Subtitle (KA)', type: 'text' },
      ]},
      { section: 'Packages', fields: [
        { key: 'packages', label: 'Pricing Packages', type: 'array', itemFields: [
          { key: 'name_en', label: 'Name (EN)', type: 'text' },
          { key: 'name_ka', label: 'Name (KA)', type: 'text' },
          { key: 'description_en', label: 'Desc (EN)', type: 'text' },
          { key: 'description_ka', label: 'Desc (KA)', type: 'text' },
          { key: 'price_en', label: 'Price (EN)', type: 'text' },
          { key: 'price_ka', label: 'Price (KA)', type: 'text' },
          { key: 'features_en', label: 'Features (EN) — one per line', type: 'textarea' },
          { key: 'features_ka', label: 'Features (KA) — one per line', type: 'textarea' },
          { key: 'popular', label: 'Popular (true/false)', type: 'text' },
          { key: 'btn_en', label: 'Button Text (EN)', type: 'text' },
          { key: 'btn_ka', label: 'Button Text (KA)', type: 'text' },
        ]},
      ]},
    ]
  },
  {
    key: 'home_how_we_work',
    label: 'როგორ ვმუშაობთ / How We Work',
    icon: Zap,
    category: 'sections',
    fields: [
      { section: 'Section Header', fields: [
        { key: 'title_en', label: 'Title (EN)', type: 'text' },
        { key: 'title_ka', label: 'Title (KA)', type: 'text' },
        { key: 'subtitle_en', label: 'Subtitle (EN)', type: 'text' },
        { key: 'subtitle_ka', label: 'Subtitle (KA)', type: 'text' },
      ]},
      { section: 'Steps', fields: [
        { key: 'steps', label: 'Work Steps', type: 'array', itemFields: [
          { key: 'title_en', label: 'Title (EN)', type: 'text' },
          { key: 'title_ka', label: 'Title (KA)', type: 'text' },
          { key: 'description_en', label: 'Desc (EN)', type: 'textarea' },
          { key: 'description_ka', label: 'Desc (KA)', type: 'textarea' },
          { key: 'icon', label: 'Icon Name', type: 'text' },
        ]},
      ]},
    ]
  },
  {
    key: 'home_cta',
    label: 'CTA (მთავარი) / Call To Action',
    icon: Zap,
    category: 'sections',
    fields: [
      { section: 'Content', fields: [
        { key: 'heading_en', label: 'Heading (EN)', type: 'text' },
        { key: 'heading_ka', label: 'Heading (KA)', type: 'text' },
        { key: 'subheading_en', label: 'Subheading (EN)', type: 'text' },
        { key: 'subheading_ka', label: 'Subheading (KA)', type: 'text' },
        { key: 'btn_text_en', label: 'Button Text (EN)', type: 'text' },
        { key: 'btn_text_ka', label: 'Button Text (KA)', type: 'text' },
      ]},
    ]
  },
];

// Category grouping
const CATEGORIES = {
  pages: { label: 'გვერდები / Pages', icon: FileText },
  industries: { label: 'ინდუსტრიები / Industries', icon: Building2 },
  sections: { label: 'სექციები / Sections', icon: Layers },
  legal: { label: 'იურიდიული / Legal', icon: Shield },
};

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
const PagesContentTab = () => {
  const { toast } = useToast();
  const [selectedPage, setSelectedPage] = useState(null);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [allPageKeys, setAllPageKeys] = useState([]);

  // Load all existing page_content entries to show status
  useEffect(() => {
    loadAllPageKeys();
  }, []);

  const loadAllPageKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('page_key');
      if (!error && data) {
        setAllPageKeys(data.map(d => d.page_key));
      }
    } catch (e) {
      // table might not exist yet
    }
  };

  const loadPageContent = useCallback(async (pageKey) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('content')
        .eq('page_key', pageKey)
        .maybeSingle();

      if (error) throw error;

      setContent(data?.content || {});
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading page content:', error);
      setContent({});
      toast({ variant: 'destructive', title: 'Error', description: `Failed to load content: ${error.message}` });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const selectPage = (page) => {
    if (hasChanges && !window.confirm('You have unsaved changes. Continue?')) return;
    setSelectedPage(page);
    loadPageContent(page.key);
    setExpandedSections({});
  };

  const handleSave = async () => {
    if (!selectedPage) return;
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_key', selectedPage.key)
        .maybeSingle();

      const payload = {
        page_key: selectedPage.key,
        content: content,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existing) {
        result = await supabase.from('page_content').update(payload).eq('id', existing.id);
      } else {
        result = await supabase.from('page_content').insert([payload]);
      }

      if (result.error) throw result.error;

      setHasChanges(false);
      loadAllPageKeys();
      toast({ title: '✅ წარმატება', description: `"${selectedPage.label}" შენახულია ბაზაში.` });
    } catch (error) {
      console.error('Save error:', error);
      toast({ variant: 'destructive', title: 'Error', description: `Save failed: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key, value) => {
    setContent(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateArrayItem = (arrayKey, index, field, value) => {
    setContent(prev => {
      const arr = [...(prev[arrayKey] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [arrayKey]: arr };
    });
    setHasChanges(true);
  };

  const addArrayItem = (arrayKey, defaults) => {
    setContent(prev => {
      const arr = [...(prev[arrayKey] || [])];
      arr.push(defaults || {});
      return { ...prev, [arrayKey]: arr };
    });
    setHasChanges(true);
  };

  const removeArrayItem = (arrayKey, index) => {
    if (!window.confirm('Delete this item?')) return;
    setContent(prev => {
      const arr = [...(prev[arrayKey] || [])];
      arr.splice(index, 1);
      return { ...prev, [arrayKey]: arr };
    });
    setHasChanges(true);
  };

  const toggleSection = (name) => {
    setExpandedSections(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleImageUpload = async (fieldKey, file) => {
    if (!file) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `page_content_${selectedPage.key}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('portfolio').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('portfolio').getPublicUrl(fileName);
      updateField(fieldKey, data.publicUrl);
      toast({ title: '✅', description: 'Image uploaded successfully.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: `Upload failed: ${error.message}` });
    }
  };

  // ═══════════ RENDER ═══════════
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-[#5468E7]" />
            გვერდების კონტენტი / Page Content Editor
          </h2>
          <p className="text-gray-400 mt-1">ყველა გვერდის ტექსტების და სურათების რედაქტირება</p>
        </div>
        {selectedPage && (
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="bg-[#5468E7] hover:bg-[#4357D6] text-white px-6"
          >
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? 'ინახება...' : 'შენახვა / Save'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* ═══════ SIDEBAR: Page List ═══════ */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-[#0D1126] rounded-xl border border-[#5468E7]/20 overflow-hidden">
            {Object.entries(CATEGORIES).map(([catKey, cat]) => (
              <div key={catKey}>
                <div className="px-4 py-3 bg-[#0A0F1C] border-b border-[#5468E7]/10">
                  <span className="text-xs font-bold text-[#5468E7] uppercase tracking-wider flex items-center gap-2">
                    <cat.icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </span>
                </div>
                {PAGE_DEFINITIONS.filter(p => p.category === catKey).map(page => (
                  <button
                    key={page.key}
                    onClick={() => selectPage(page)}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between gap-2 transition-colors border-b border-[#5468E7]/5
                      ${selectedPage?.key === page.key
                        ? 'bg-[#5468E7]/20 text-white'
                        : 'text-gray-400 hover:bg-[#5468E7]/10 hover:text-white'}`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <page.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{page.label}</span>
                    </span>
                    {allPageKeys.includes(page.key) && (
                      <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ MAIN: Content Editor ═══════ */}
        <div className="col-span-12 lg:col-span-9">
          {!selectedPage ? (
            <div className="bg-[#0D1126] rounded-xl border border-[#5468E7]/20 p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-[#5468E7]/30" />
              <h3 className="text-xl font-bold text-white mb-2">აირჩიეთ გვერდი</h3>
              <p className="text-gray-400">მარცხნიდან აირჩიეთ გვერდი რედაქტირებისთვის</p>
            </div>
          ) : loading ? (
            <div className="bg-[#0D1126] rounded-xl border border-[#5468E7]/20 p-12 text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 text-[#5468E7] animate-spin" />
              <p className="text-gray-400">იტვირთება...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current page title + status */}
              <div className="bg-[#0D1126] rounded-xl border border-[#5468E7]/20 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <selectedPage.icon className="w-6 h-6 text-[#5468E7]" />
                  <h3 className="text-lg font-bold text-white">{selectedPage.label}</h3>
                </div>
                <div className="flex items-center gap-3">
                  {hasChanges && (
                    <span className="text-xs text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> შეუნახავი ცვლილებები
                    </span>
                  )}
                  {allPageKeys.includes(selectedPage.key) && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> ბაზაში
                    </span>
                  )}
                </div>
              </div>

              {/* Field sections */}
              {selectedPage.fields.map((section, sIdx) => (
                <div key={sIdx} className="bg-[#0D1126] rounded-xl border border-[#5468E7]/20 overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.section)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#5468E7]/5 transition-colors"
                  >
                    <span className="font-bold text-white">{section.section}</span>
                    {expandedSections[section.section] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedSections[section.section] && (
                    <div className="px-5 pb-5 space-y-4 border-t border-[#5468E7]/10">
                      {section.fields.map((field, fIdx) => (
                        <div key={fIdx} className="mt-4">
                          {field.type === 'array' ? (
                            <ArrayEditor
                              field={field}
                              value={content[field.key] || []}
                              onChange={(val) => updateField(field.key, val)}
                              onUpdateItem={(idx, k, v) => updateArrayItem(field.key, idx, k, v)}
                              onAddItem={(defaults) => addArrayItem(field.key, defaults)}
                              onRemoveItem={(idx) => removeArrayItem(field.key, idx)}
                            />
                          ) : field.type === 'image' ? (
                            <ImageField
                              field={field}
                              value={content[field.key] || ''}
                              onChange={(val) => updateField(field.key, val)}
                              onUpload={(file) => handleImageUpload(field.key, file)}
                            />
                          ) : field.type === 'richtext' ? (
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">{field.label}</label>
                              <textarea
                                value={content[field.key] || ''}
                                onChange={(e) => updateField(field.key, e.target.value)}
                                rows={8}
                                className="w-full bg-[#0A0F1C] border border-[#5468E7]/20 rounded-lg px-4 py-3 text-white text-sm focus:border-[#5468E7] focus:ring-1 focus:ring-[#5468E7] transition-colors resize-y"
                                placeholder={field.label}
                              />
                            </div>
                          ) : field.type === 'textarea' ? (
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">{field.label}</label>
                              <textarea
                                value={content[field.key] || ''}
                                onChange={(e) => updateField(field.key, e.target.value)}
                                rows={4}
                                className="w-full bg-[#0A0F1C] border border-[#5468E7]/20 rounded-lg px-4 py-3 text-white text-sm focus:border-[#5468E7] focus:ring-1 focus:ring-[#5468E7] transition-colors resize-y"
                                placeholder={field.label}
                              />
                            </div>
                          ) : (
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">{field.label}</label>
                              <input
                                type="text"
                                value={content[field.key] || ''}
                                onChange={(e) => updateField(field.key, e.target.value)}
                                className="w-full bg-[#0A0F1C] border border-[#5468E7]/20 rounded-lg px-4 py-3 text-white text-sm focus:border-[#5468E7] focus:ring-1 focus:ring-[#5468E7] transition-colors"
                                placeholder={field.label}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Bottom save */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="bg-[#5468E7] hover:bg-[#4357D6] text-white px-8 py-3"
                >
                  {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {saving ? 'ინახება...' : 'შენახვა / Save'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════

const ArrayEditor = ({ field, value, onChange, onUpdateItem, onAddItem, onRemoveItem }) => {
  const items = Array.isArray(value) ? value : [];
  const [expandedItems, setExpandedItems] = useState({});

  const toggleItem = (idx) => {
    setExpandedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-[#5468E7]">{field.label} ({items.length})</label>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const defaults = {};
            (field.itemFields || []).forEach(f => { defaults[f.key] = ''; });
            onAddItem(defaults);
          }}
          className="border-[#5468E7]/30 text-[#5468E7] hover:bg-[#5468E7]/10 h-8"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> დამატება
        </Button>
      </div>

      {items.map((item, idx) => (
        <div key={idx} className="border border-[#5468E7]/15 rounded-lg overflow-hidden bg-[#0A0F1C]/50">
          <div
            className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#5468E7]/5"
            onClick={() => toggleItem(idx)}
          >
            <span className="text-sm text-gray-300">
              #{idx + 1} — {item[field.itemFields?.[0]?.key] || item.title_en || item.title_ka || item.name_en || item.question_en || item.platform || item.label || '(ცარიელი)'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveItem(idx); }}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {expandedItems[idx] ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </div>
          </div>

          {expandedItems[idx] && (
            <div className="px-4 pb-4 space-y-3 border-t border-[#5468E7]/10">
              {(field.itemFields || []).map((subField, sfIdx) => (
                <div key={sfIdx} className="mt-3">
                  <label className="block text-xs font-medium text-gray-400 mb-1">{subField.label}</label>
                  {subField.type === 'textarea' || subField.type === 'richtext' ? (
                    <textarea
                      value={item[subField.key] || ''}
                      onChange={(e) => onUpdateItem(idx, subField.key, e.target.value)}
                      rows={subField.type === 'richtext' ? 6 : 3}
                      className="w-full bg-[#0A0F1C] border border-[#5468E7]/15 rounded-md px-3 py-2 text-white text-sm focus:border-[#5468E7] transition-colors resize-y"
                    />
                  ) : (
                    <input
                      type="text"
                      value={item[subField.key] || ''}
                      onChange={(e) => onUpdateItem(idx, subField.key, e.target.value)}
                      className="w-full bg-[#0A0F1C] border border-[#5468E7]/15 rounded-md px-3 py-2 text-white text-sm focus:border-[#5468E7] transition-colors"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ImageField = ({ field, value, onChange, onUpload }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
      <div className="flex gap-3 items-start">
        {value && (
          <div className="w-24 h-24 rounded-lg overflow-hidden border border-[#5468E7]/20 shrink-0 bg-[#0A0F1C]">
            <img src={value} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#0A0F1C] border border-[#5468E7]/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#5468E7] transition-colors"
            placeholder="Image URL or upload..."
          />
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#5468E7]/30 text-[#5468E7] text-sm cursor-pointer hover:bg-[#5468E7]/10 transition-colors">
            <Upload className="w-4 h-4" />
            ატვირთვა / Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files[0]) onUpload(e.target.files[0]);
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default PagesContentTab;
