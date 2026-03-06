import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, UploadCloud, Link as LinkIcon, Image as ImageIcon, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const PartnersTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  
  const [config, setConfig] = useState({
    show_title: true,
    title_en: "Brands we've worked with",
    title_ka: "ბრენდები, რომლებთანაც ვთანამშრომლობთ",
    display_style: 'logos_scroll',
    background_style: 'grid_pattern',
    section_height: 300,
    animation_speed: 5,
    partners: []
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('partners_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          ...data,
          partners: Array.isArray(data.partners) ? data.partners : []
        });
      }
    } catch (error) {
      console.error('Error fetching partners settings:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load partners settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: existing } = await supabase.from('partners_settings').select('id').limit(1).maybeSingle();
      
      const payload = {
        show_title: config.show_title,
        title_en: config.title_en,
        title_ka: config.title_ka,
        display_style: config.display_style,
        background_style: config.background_style,
        section_height: config.section_height,
        animation_speed: config.animation_speed,
        partners: config.partners,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existing) {
        result = await supabase.from('partners_settings').update(payload).eq('id', existing.id);
      } else {
        result = await supabase.from('partners_settings').insert([payload]);
      }

      if (result.error) throw result.error;
      toast({ title: 'Success', description: 'Partners settings saved successfully.' });
    } catch (error) {
      console.error('Error saving partners:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
    }
  };

  const updateSetting = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const addPartner = () => {
    const newPartner = {
      id: crypto.randomUUID(),
      name: 'New Partner',
      logo_url: '',
      link: '',
      order: config.partners.length,
      created_at: new Date().toISOString()
    };
    setConfig(prev => ({ ...prev, partners: [...prev.partners, newPartner] }));
  };

  const removePartner = (index) => {
    if (!window.confirm('Are you sure you want to delete this partner?')) return;
    const newPartners = [...config.partners];
    newPartners.splice(index, 1);
    setConfig(prev => ({ ...prev, partners: newPartners }));
  };

  const updatePartner = (index, field, value) => {
    const newPartners = [...config.partners];
    newPartners[index][field] = value;
    setConfig(prev => ({ ...prev, partners: newPartners }));
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;

    try {
      setUploadingId(config.partners[index].id);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('partners_logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('partners_logos')
        .getPublicUrl(filePath);

      updatePartner(index, 'logo_url', publicUrl);
      toast({ title: 'Success', description: 'Logo uploaded successfully.' });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({ variant: 'destructive', title: 'Error', description: `Failed to upload logo: ${error.message}` });
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <div className="text-white">Loading settings...</div>;

  return (
    <div className="bg-[#0D1126] border border-[#5468E7]/30 rounded-xl p-6 space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#0D1126] p-4 rounded-lg border border-[#5468E7]/30">
        <Users className="w-6 h-6 text-[#5468E7]" />
        <h2 className="text-xl font-bold text-white">Partners Settings</h2>
      </div>

      {/* Global Settings */}
      <div className="grid lg:grid-cols-2 gap-8 bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-[#0D1126]">
            <span className="text-sm font-medium text-white">Show Title</span>
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input 
                  type="checkbox" 
                  checked={config.show_title}
                  onChange={(e) => updateSetting('show_title', e.target.checked)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-6 checked:border-[#5468E7]"
                  style={{ top: 0, left: 0 }}
                />
                <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ${config.show_title ? 'bg-[#5468E7]' : 'bg-gray-700'}`}></label>
            </div>
          </div>

          <div>
             <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Display Style</label>
             <select 
               value={config.display_style}
               onChange={(e) => updateSetting('display_style', e.target.value)}
               className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] outline-none"
             >
                <option value="logos_scroll">Logos Scroll (Infinite)</option>
                <option value="static_banners">Static Banners</option>
                <option value="moving_colors">Moving Colors (Text Only)</option>
             </select>
          </div>

          <div>
             <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Background Style</label>
             <select 
               value={config.background_style}
               onChange={(e) => updateSetting('background_style', e.target.value)}
               className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] outline-none"
             >
                <option value="grid_pattern">Grid Pattern</option>
                <option value="default">Default Transparent</option>
                <option value="gray_solid">Solid Gray/Dark</option>
                <option value="gradient_mesh">Gradient Mesh</option>
             </select>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Section Title (EN)</label>
            <input 
              value={config.title_en}
              onChange={(e) => updateSetting('title_en', e.target.value)}
              className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7]"
              placeholder="Brands we've worked with"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Section Title (KA)</label>
            <input 
              value={config.title_ka}
              onChange={(e) => updateSetting('title_ka', e.target.value)}
              className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] font-bpg-glaho"
              placeholder="ბრენდები"
            />
          </div>

          <div>
             <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Section Height</label>
                <span className="text-xs font-mono bg-[#5468E7]/20 text-[#5468E7] px-2 py-1 rounded">{config.section_height}px</span>
             </div>
             <Slider
                value={[config.section_height]}
                min={100}
                max={800}
                step={10}
                onValueChange={(val) => updateSetting('section_height', val[0])}
                className="py-4"
             />
          </div>

          <div>
             <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Animation Speed</label>
                <span className="text-xs font-mono bg-[#5468E7]/20 text-[#5468E7] px-2 py-1 rounded">{config.animation_speed}</span>
             </div>
             <Slider
                value={[config.animation_speed]}
                min={1}
                max={10}
                step={1}
                onValueChange={(val) => updateSetting('animation_speed', val[0])}
                className="py-4"
             />
          </div>
        </div>
      </div>

      {/* Partner List */}
      <div className="space-y-4">
         <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Partner List</h3>
            <Button onClick={addPartner} size="sm" className="bg-[#5468E7] hover:bg-[#4353b8] text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Partner
            </Button>
         </div>

         <div className="space-y-3">
            {config.partners.map((partner, index) => (
               <div key={partner.id || index} className="grid grid-cols-12 gap-4 items-center bg-[#0A0F1C]/50 p-4 rounded-lg border border-white/5 hover:border-[#5468E7]/30 transition-all group">
                  
                  {/* Logo Preview / Upload */}
                  <div className="col-span-12 md:col-span-1">
                     <div className="relative w-12 h-12 bg-white rounded-md flex items-center justify-center overflow-hidden border border-white/20">
                        {partner.logo_url ? (
                           <img src={partner.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
                        ) : (
                           <ImageIcon className="text-gray-400 w-6 h-6" />
                        )}
                        {uploadingId === partner.id && (
                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Name */}
                  <div className="col-span-12 md:col-span-3">
                     <label className="text-[10px] text-gray-500 block mb-1">Name</label>
                     <input 
                        value={partner.name} 
                        onChange={(e) => updatePartner(index, 'name', e.target.value)} 
                        className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white" 
                        placeholder="Partner Name"
                     />
                  </div>

                  {/* Logo URL Input + File Upload */}
                  <div className="col-span-12 md:col-span-4">
                     <label className="text-[10px] text-gray-500 block mb-1">Logo URL</label>
                     <div className="flex gap-2">
                        <input 
                           value={partner.logo_url || ''} 
                           onChange={(e) => updatePartner(index, 'logo_url', e.target.value)} 
                           className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-xs text-gray-300 font-mono" 
                           placeholder="https://..."
                        />
                        <div className="relative">
                           <input 
                             type="file" 
                             id={`file-${index}`} 
                             className="hidden" 
                             accept="image/*"
                             onChange={(e) => handleFileUpload(index, e.target.files[0])}
                             disabled={uploadingId !== null}
                           />
                           <label 
                             htmlFor={`file-${index}`} 
                             className={`h-full px-3 flex items-center justify-center rounded border border-white/10 bg-[#0D1126] cursor-pointer hover:border-[#5468E7] hover:text-[#5468E7] transition-all ${uploadingId !== null ? 'opacity-50 pointer-events-none' : 'text-gray-400'}`}
                             title="Upload Logo"
                           >
                             <UploadCloud className="w-4 h-4" />
                           </label>
                        </div>
                     </div>
                  </div>

                  {/* Link */}
                  <div className="col-span-12 md:col-span-3">
                     <label className="text-[10px] text-gray-500 block mb-1">Link</label>
                     <div className="relative">
                        <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                        <input 
                           value={partner.link || ''} 
                           onChange={(e) => updatePartner(index, 'link', e.target.value)} 
                           className="w-full bg-[#0D1126] border border-white/10 rounded pl-8 pr-3 py-2 text-sm text-white" 
                           placeholder="#"
                        />
                     </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-12 md:col-span-1 flex justify-end">
                     <Button 
                       variant="destructive" 
                       size="icon" 
                       onClick={() => removePartner(index)}
                       className="opacity-50 group-hover:opacity-100 transition-opacity"
                     >
                        <Trash2 className="w-4 h-4" />
                     </Button>
                  </div>

               </div>
            ))}

            {config.partners.length === 0 && (
               <div className="text-center py-8 border border-dashed border-white/10 rounded-lg">
                  <p className="text-gray-500 text-sm">No partners added yet.</p>
               </div>
            )}
         </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <Button onClick={handleSave} className="w-full bg-[#5468E7] py-6 text-lg hover:bg-[#4353b8] transition-all">
          <Save className="w-5 h-5 mr-2" /> Save Partners Settings
        </Button>
      </div>
    </div>
  );
};

export default PartnersTab;