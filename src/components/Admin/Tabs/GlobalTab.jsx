import React, { useState, useEffect } from 'react';
import { Save, Settings, Moon, Sun, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const GlobalTab = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    global_font_body: 'font-bpg-glaho',
    global_font_heading: 'font-bpg-caps',
    default_language: 'en'
  });
  
  const [themeSettings, setThemeSettings] = useState({
    default_theme: 'dark'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Fetch Site Settings (Fonts & Default Language)
      const { data: siteData } = await supabase.from('site_settings').select('*');
      if (siteData) {
        const newSettings = { ...settings };
        siteData.forEach(item => {
          if (item.key in newSettings) newSettings[item.key] = item.value;
        });
        
        // Handle explicit check for missing keys if needed, but above loop covers it
        // Ensure default_language is set if missing in DB
        if (!siteData.find(i => i.key === 'default_language')) {
            newSettings.default_language = 'en';
        }
        
        setSettings(newSettings);
      }

      // Fetch Theme Settings (Default Theme)
      const { data: themeData, error } = await supabase.from('theme_settings').select('*').limit(1).maybeSingle();
      
      if (!error && themeData) {
        setThemeSettings({ default_theme: themeData.default_theme || 'dark' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Save Site Settings (Fonts & Language)
      const updates = Object.entries(settings).map(([key, value]) => ({ key, value }));
      const { error: siteError } = await supabase.from('site_settings').upsert(updates);
      if (siteError) throw siteError;

      // Save Theme Default
      const { data: existingTheme } = await supabase.from('theme_settings').select('id').limit(1).maybeSingle();
      
      let themeError;
      if (existingTheme) {
        const { error } = await supabase.from('theme_settings').update(themeSettings).eq('id', existingTheme.id);
        themeError = error;
      } else {
        const { error } = await supabase.from('theme_settings').insert([themeSettings]);
        themeError = error;
      }
      
      if (themeError) throw themeError;

      toast({ title: 'Success', description: 'Global settings updated.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
    }
  };

  const fontOptions = [
    { value: 'font-sans', label: 'Inter (Default)' },
    { value: 'font-bpg-caps', label: 'BPG WEB 001 Caps (Headings)' },
    { value: 'font-bpg-glaho', label: 'BPG Glaho WEB (Body)' },
  ];

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="bg-[#0D1126] border border-[#5468E7]/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6 bg-[#0D1126] p-4 rounded-lg border border-[#5468E7]/30">
        <Settings className="w-6 h-6 text-[#5468E7]" />
        <h2 className="text-xl font-bold text-white">Global Preferences</h2>
      </div>

      <div className="space-y-6">
        {/* Default Language Section */}
        <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5">
           <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Default Language
           </h3>
           <p className="text-xs text-gray-500 mb-4">Select the language that new visitors will see by default.</p>
           
           <div className="flex gap-4">
              <button 
                onClick={() => setSettings({ ...settings, default_language: 'en' })}
                className={`flex-1 p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${settings.default_language === 'en' ? 'bg-[#0D1126] border-[#5468E7] text-white' : 'bg-[#0A0F1C] border-white/10 text-gray-400 hover:border-white/30'}`}
              >
                 <span className="text-2xl">🇺🇸</span>
                 <span className="font-medium text-sm">English (EN)</span>
              </button>
              
              <button 
                onClick={() => setSettings({ ...settings, default_language: 'ka' })}
                className={`flex-1 p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${settings.default_language === 'ka' ? 'bg-[#0D1126] border-[#5468E7] text-white' : 'bg-[#0A0F1C] border-white/10 text-gray-400 hover:border-white/30'}`}
              >
                 <span className="text-2xl">🇬🇪</span>
                 <span className="font-medium text-sm">Georgian (KA)</span>
              </button>
           </div>
        </div>

        {/* Default Theme Section */}
        <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5">
           <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Moon className="w-4 h-4" /> Default Theme
           </h3>
           <p className="text-xs text-gray-500 mb-4">This setting determines the theme for new users visiting the site for the first time.</p>
           
           <div className="flex gap-4">
              <button 
                onClick={() => setThemeSettings({ ...themeSettings, default_theme: 'dark' })}
                className={`flex-1 p-4 rounded-lg border flex flex-col items-center gap-3 transition-all ${themeSettings.default_theme === 'dark' ? 'bg-[#0D1126] border-[#5468E7] text-white' : 'bg-[#0A0F1C] border-white/10 text-gray-400 hover:border-white/30'}`}
              >
                 <Moon className="w-6 h-6" />
                 <span className="font-medium">Dark Mode Default</span>
              </button>
              
              <button 
                onClick={() => setThemeSettings({ ...themeSettings, default_theme: 'light' })}
                className={`flex-1 p-4 rounded-lg border flex flex-col items-center gap-3 transition-all ${themeSettings.default_theme === 'light' ? 'bg-white text-black border-[#5468E7]' : 'bg-[#0A0F1C] border-white/10 text-gray-400 hover:border-white/30'}`}
              >
                 <Sun className="w-6 h-6" />
                 <span className="font-medium">Light Mode Default</span>
              </button>
           </div>
        </div>

        {/* Typography Section */}
        <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5 space-y-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Typography</h3>
          
          <div>
            <label className="text-xs text-gray-500 block mb-2">Default Body Font</label>
            <select 
              value={settings.global_font_body}
              onChange={(e) => setSettings({ ...settings, global_font_body: e.target.value })}
              className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7]"
            >
              {fontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <p className="text-xs text-gray-600 mt-1">Used for paragraphs and general text.</p>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-2">Default Heading Font</label>
            <select 
              value={settings.global_font_heading}
              onChange={(e) => setSettings({ ...settings, global_font_heading: e.target.value })}
              className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7]"
            >
              {fontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <p className="text-xs text-gray-600 mt-1">Used for titles, buttons, and navigation.</p>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} className="w-full bg-[#5468E7] py-6 text-lg mt-6">
        <Save className="w-5 h-5 mr-2" /> Save Global Settings
      </Button>
    </div>
  );
};

export default GlobalTab;