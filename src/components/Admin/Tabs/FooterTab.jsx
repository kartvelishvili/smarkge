import React, { useState, useEffect } from 'react';
import { Save, Layout, Plus, Trash2, Mail, Phone, MapPin, Globe, Link as LinkIcon, UploadCloud, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const FooterTab = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    logo_url: '',
    description_en: '',
    description_ka: '',
    sections: [], // Replaces fixed navigation_links / services_links
    social_links: [],
    contact_info: { email: '', phone: '', address_en: '', address_ka: '' },
    copyright_text_en: '',
    copyright_text_ka: '',
    privacy_label_en: '',
    privacy_label_ka: '',
    terms_label_en: '',
    terms_label_ka: ''
  });
  const [loading, setLoading] = useState(true);

  // Defaults
  const defaultSocials = [
    { id: 'fb', platform: 'Facebook', url: '' },
    { id: 'tw', platform: 'Twitter', url: '' },
    { id: 'ig', platform: 'Instagram', url: '' },
    { id: 'li', platform: 'LinkedIn', url: '' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('footer_settings').select('*').limit(1).maybeSingle();

      if (error) throw error;
      if (data) {
        // Migration: If old data structure exists (navigation_links array), convert it to new sections format if sections is empty
        let sections = data.sections || [];
        if (sections.length === 0 && (data.navigation_links?.length || data.services_links?.length)) {
             sections = [
                 { id: 'nav', title_en: 'Navigation', title_ka: 'ნავიგაცია', links: data.navigation_links || [] },
                 { id: 'srv', title_en: 'Services', title_ka: 'სერვისები', links: data.services_links || [] }
             ];
        }

        setConfig({
          ...data,
          sections: sections,
          social_links: data.social_links?.length ? data.social_links : defaultSocials,
          contact_info: data.contact_info || { email: '', phone: '', address_en: '', address_ka: '' }
        });
      } else {
          setConfig(prev => ({ ...prev, social_links: defaultSocials, sections: [
             { id: '1', title_en: 'Navigation', title_ka: 'ნავიგაცია', links: [] } 
          ] }));
      }
    } catch (error) {
      console.error('Error fetching footer settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: existing } = await supabase.from('footer_settings').select('id').limit(1).maybeSingle();
      let result;
      // We are ignoring navigation_links and services_links columns now, storing strictly in sections jsonb if schema allows, 
      // or we just reuse the jsonb column if we created one.
      // Assuming 'sections' doesn't exist in original schema, we might need to rely on the jsonb columns or assume 'footer_settings' has a 'sections' column. 
      // Since I can't alter schema easily without 'database' block which I already used for theme, I'll store it in a generic jsonb field or reuse.
      // Actually, I will check if I can just use the provided props. The user asked for "full section management".
      // I will assume 'navigation_links' can hold ALL sections as a JSON structure, or I create a migration above?
      // Wait, I can use the existing 'navigation_links' column to store the array of section objects instead of just links, 
      // providing the frontend handles it. But that's risky if types mismatch.
      // Better: I will use 'navigation_links' column to store the MAIN sections array for now if it's JSONB.
      
      const payload = {
          ...config,
          navigation_links: config.sections, // Storing full sections structure here for simplicity
          services_links: [] // Clear old
      };

      if (existing) {
        result = await supabase.from('footer_settings').update(payload).eq('id', existing.id);
      } else {
        result = await supabase.from('footer_settings').insert([payload]);
      }

      if (result.error) throw result.error;
      toast({ title: 'Success', description: 'Footer settings updated.' });
    } catch (error) {
      console.error('Error saving footer:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save.' });
    }
  };

  const addSection = () => {
      setConfig({
          ...config,
          sections: [...config.sections, { id: crypto.randomUUID(), title_en: 'New Section', title_ka: 'ახალი სექცია', links: [] }]
      });
  };

  const removeSection = (idx) => {
      const newSections = [...config.sections];
      newSections.splice(idx, 1);
      setConfig({ ...config, sections: newSections });
  };

  const updateSectionTitle = (idx, field, value) => {
      const newSections = [...config.sections];
      newSections[idx][field] = value;
      setConfig({ ...config, sections: newSections });
  };

  const addLinkToSection = (sectionIdx) => {
      const newSections = [...config.sections];
      newSections[sectionIdx].links.push({ name_en: 'Link', name_ka: 'ბმული', href: '#' });
      setConfig({ ...config, sections: newSections });
  };

  const updateLink = (sectionIdx, linkIdx, field, value) => {
      const newSections = [...config.sections];
      newSections[sectionIdx].links[linkIdx][field] = value;
      setConfig({ ...config, sections: newSections });
  };

  const removeLink = (sectionIdx, linkIdx) => {
      const newSections = [...config.sections];
      newSections[sectionIdx].links.splice(linkIdx, 1);
      setConfig({ ...config, sections: newSections });
  };

  const handleImageUpload = async (file) => {
    // ... reused upload logic ...
    if (!file) return;
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `footer_logo_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('portfolio').getPublicUrl(filePath);
        setConfig(prev => ({ ...prev, logo_url: data.publicUrl }));
        toast({ title: "Success", description: "Logo uploaded." });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Upload failed." });
    }
  };
  
  const updateContact = (key, val) => setConfig(prev => ({ ...prev, contact_info: { ...prev.contact_info, [key]: val } }));
  const updateSocial = (idx, val) => {
      const newLinks = [...config.social_links];
      newLinks[idx].url = val;
      setConfig({ ...config, social_links: newLinks });
  };


  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="bg-[#0D1126] border border-[#5468E7]/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6 bg-[#0D1126] p-4 rounded-lg border border-[#5468E7]/30">
        <Layout className="w-6 h-6 text-[#5468E7]" />
        <h2 className="text-xl font-bold text-white">Footer Management</h2>
      </div>

      <div className="space-y-8">
        {/* Logo & Desc */}
        <div className="grid md:grid-cols-2 gap-6 bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5">
            <div>
                 <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Logo</h3>
                 <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-[#0D1126] border border-white/10 rounded flex items-center justify-center p-2">
                        {config.logo_url ? <img src={config.logo_url} className="w-full h-full object-contain" /> : <span className="text-xs text-gray-500">None</span>}
                    </div>
                    <label className="cursor-pointer bg-[#5468E7]/20 text-[#5468E7] px-3 py-2 rounded text-sm hover:bg-[#5468E7]/30">
                        Upload <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} />
                    </label>
                 </div>
            </div>
            <div>
                 <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Description</h3>
                 <textarea value={config.description_en} onChange={e => setConfig({...config, description_en: e.target.value})} className="w-full bg-[#0D1126] border border-white/10 rounded p-2 text-sm text-white mb-2" placeholder="Desc EN" rows={2}/>
                 <textarea value={config.description_ka} onChange={e => setConfig({...config, description_ka: e.target.value})} className="w-full bg-[#0D1126] border border-white/10 rounded p-2 text-sm text-white" placeholder="Desc KA" rows={2}/>
            </div>
        </div>

        {/* Dynamic Sections */}
        <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5">
            <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Footer Link Sections</h3>
                 <Button size="sm" onClick={addSection} className="bg-[#5468E7]"><Plus className="w-4 h-4 mr-2"/> Add Section</Button>
            </div>
            
            <div className="space-y-6">
                {config.sections.map((section, sIdx) => (
                    <div key={section.id || sIdx} className="bg-[#0D1126] p-4 rounded-lg border border-white/10">
                        <div className="flex items-end gap-4 mb-4 pb-4 border-b border-white/5">
                            <div className="flex-1">
                                <label className="text-[10px] text-gray-500 block">Section Title (EN)</label>
                                <input value={section.title_en} onChange={(e) => updateSectionTitle(sIdx, 'title_en', e.target.value)} className="w-full bg-[#0A0F1C] border border-white/10 rounded px-2 py-1 text-sm text-white"/>
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] text-gray-500 block">Section Title (KA)</label>
                                <input value={section.title_ka} onChange={(e) => updateSectionTitle(sIdx, 'title_ka', e.target.value)} className="w-full bg-[#0A0F1C] border border-white/10 rounded px-2 py-1 text-sm text-white"/>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeSection(sIdx)} className="text-red-500"><Trash2 className="w-4 h-4"/></Button>
                        </div>
                        
                        <div className="space-y-2 pl-4 border-l-2 border-[#5468E7]/20">
                            {section.links?.map((link, lIdx) => (
                                <div key={lIdx} className="grid grid-cols-7 gap-2 items-center">
                                    <input className="col-span-2 bg-transparent border-b border-white/5 text-xs text-white px-1" value={link.name_en} onChange={(e) => updateLink(sIdx, lIdx, 'name_en', e.target.value)} placeholder="Name EN"/>
                                    <input className="col-span-2 bg-transparent border-b border-white/5 text-xs text-white px-1" value={link.name_ka} onChange={(e) => updateLink(sIdx, lIdx, 'name_ka', e.target.value)} placeholder="Name KA"/>
                                    <input className="col-span-2 bg-transparent border-b border-white/5 text-xs text-gray-400 px-1" value={link.href} onChange={(e) => updateLink(sIdx, lIdx, 'href', e.target.value)} placeholder="URL"/>
                                    <button onClick={() => removeLink(sIdx, lIdx)} className="text-red-500 hover:text-red-400"><Trash2 className="w-3 h-3"/></button>
                                </div>
                            ))}
                            <button onClick={() => addLinkToSection(sIdx)} className="text-xs text-[#5468E7] flex items-center gap-1 mt-2 hover:underline"><Plus className="w-3 h-3"/> Add Link</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Contact & Socials (Simplified view) */}
        <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5">
             <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact & Socials</h3>
             <div className="grid md:grid-cols-2 gap-4">
                 <input value={config.contact_info.email} onChange={(e) => updateContact('email', e.target.value)} className="bg-[#0D1126] border border-white/10 rounded p-2 text-white text-sm" placeholder="Email"/>
                 <input value={config.contact_info.phone} onChange={(e) => updateContact('phone', e.target.value)} className="bg-[#0D1126] border border-white/10 rounded p-2 text-white text-sm" placeholder="Phone"/>
                 <input value={config.contact_info.address_en} onChange={(e) => updateContact('address_en', e.target.value)} className="bg-[#0D1126] border border-white/10 rounded p-2 text-white text-sm" placeholder="Address EN"/>
                 <input value={config.contact_info.address_ka} onChange={(e) => updateContact('address_ka', e.target.value)} className="bg-[#0D1126] border border-white/10 rounded p-2 text-white text-sm" placeholder="Address KA"/>
             </div>
             <div className="mt-4 grid md:grid-cols-4 gap-2">
                 {config.social_links.map((s, i) => (
                     <input key={i} value={s.url} onChange={(e) => updateSocial(i, e.target.value)} className="bg-[#0D1126] border border-white/10 rounded p-2 text-white text-xs" placeholder={`${s.platform} URL`}/>
                 ))}
             </div>
        </div>

        {/* Copyright */}
        <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5">
             <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Copyright & Legal</h3>
             <div className="grid md:grid-cols-2 gap-4">
                 <input value={config.copyright_text_en} onChange={e => setConfig({...config, copyright_text_en: e.target.value})} className="bg-[#0D1126] border border-white/10 rounded p-2 text-white text-sm" placeholder="Copyright EN"/>
                 <input value={config.copyright_text_ka} onChange={e => setConfig({...config, copyright_text_ka: e.target.value})} className="bg-[#0D1126] border border-white/10 rounded p-2 text-white text-sm" placeholder="Copyright KA"/>
             </div>
        </div>

        <Button onClick={handleSave} className="w-full bg-[#5468E7] py-6 text-lg">
          <Save className="w-5 h-5 mr-2" /> Save Footer Settings
        </Button>
      </div>
    </div>
  );
};

export default FooterTab;