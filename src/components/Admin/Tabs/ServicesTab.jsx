import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, PenTool, Layout, Activity, Monitor, Smartphone, Globe, Code, Database, Search, ShoppingBag, BarChart, CheckCircle2, Zap, Target, TrendingUp, Sparkles, MoveHorizontal, MoveDiagonal, Orbit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { resolveIcon } from '@/lib/iconMap';

const ServicesTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    title_en: 'Two Core Services, One Digital Agency',
    title_ka: 'ორი მთავარი სერვისი, ერთი სააგენტო',
    subtitle_en: 'We combine cutting-edge web development with powerful social media marketing to deliver complete digital solutions.',
    subtitle_ka: 'ჩვენ ვაერთიანებთ უახლეს ვებ-ტექნოლოგიებსა და სოციალურ მედია მარკეტინგს სრული ციფრული გადაწყვეტილებებისთვის.',
    animation_style: 'orbit',
    animation_speed: 30,
    services: []
  });

  // Icon picker state
  const [iconPickerOpen, setIconPickerOpen] = useState(null); // Index of service editing icon

  // Available icons for selection
  const iconOptions = [
    'Code', 'Monitor', 'Smartphone', 'Globe', 'Database', 'Layout', 
    'Activity', 'Search', 'ShoppingBag', 'BarChart', 'Zap', 'Target', 
    'TrendingUp', 'PenTool', 'CheckCircle2', 'Layers', 'Box', 'Cpu'
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('services_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          ...data,
          services: Array.isArray(data.services) ? data.services : []
        });
      } else {
        // Default initialization if no data exists
        setConfig(prev => ({
           ...prev,
           services: [
             {
               id: 's1',
               title_en: 'Website Development',
               title_ka: 'ვებ-გვერდების დამზადება',
               description_en: 'Create stunning, high-performance websites that convert visitors into customers.',
               description_ka: 'შექმენით დახვეწილი, სწრაფი ვებ-გვერდები, რომლებიც ვიზიტორებს მომხმარებლებად აქცევს.',
               icon: 'Code',
               features_en: ['Custom Design', 'Responsive', 'SEO Optimized'],
               features_ka: ['უნიკალური დიზაინი', 'ადაპტიური', 'SEO ოპტიმიზაცია'],
               chips_en: ['React', 'Next.js', 'Tailwind'],
               chips_ka: ['React', 'Next.js', 'Tailwind']
             },
             {
               id: 's2',
               title_en: 'Social Media Campaigns',
               title_ka: 'სოციალური მედია კამპანიები',
               description_en: 'Drive engagement and growth with strategic social media campaigns.',
               description_ka: 'გაზარდეთ ჩართულობა და გაყიდვები სტრატეგიული კამპანიებით.',
               icon: 'TrendingUp',
               features_en: ['Content Strategy', 'Paid Ads', 'Analytics'],
               features_ka: ['კონტენტ სტრატეგია', 'რეკლამა', 'ანალიტიკა'],
               chips_en: ['Facebook', 'Instagram', 'TikTok'],
               chips_ka: ['Facebook', 'Instagram', 'TikTok']
             }
           ]
        }));
      }
    } catch (error) {
      console.error('Error fetching services settings:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load services settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: existing } = await supabase.from('services_settings').select('id').limit(1).maybeSingle();
      
      const payload = {
        title_en: config.title_en,
        title_ka: config.title_ka,
        subtitle_en: config.subtitle_en,
        subtitle_ka: config.subtitle_ka,
        animation_style: config.animation_style,
        animation_speed: config.animation_speed,
        services: config.services,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existing) {
        result = await supabase.from('services_settings').update(payload).eq('id', existing.id);
      } else {
        result = await supabase.from('services_settings').insert([payload]);
      }

      if (result.error) throw result.error;
      toast({ title: 'Success', description: 'Services settings saved successfully.' });
    } catch (error) {
      console.error('Error saving services:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
    }
  };

  const updateSetting = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const addService = () => {
    const newService = {
      id: crypto.randomUUID(),
      title_en: 'New Service',
      title_ka: 'ახალი სერვისი',
      description_en: 'Service description goes here.',
      description_ka: 'სერვისის აღწერა აქ.',
      icon: 'Activity',
      features_en: ['Feature 1', 'Feature 2'],
      features_ka: ['მახასიათებელი 1', 'მახასიათებელი 2'],
      chips_en: ['Tag 1'],
      chips_ka: ['ტეგი 1']
    };
    setConfig(prev => ({ ...prev, services: [...prev.services, newService] }));
  };

  const removeService = (index) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    const newServices = [...config.services];
    newServices.splice(index, 1);
    setConfig(prev => ({ ...prev, services: newServices }));
  };

  const updateService = (index, field, value) => {
    const newServices = [...config.services];
    newServices[index][field] = value;
    setConfig(prev => ({ ...prev, services: newServices }));
  };

  const updateServiceArray = (index, field, valueStr) => {
      // Split by comma for features/chips
      const arr = valueStr.split(',').map(s => s.trim()).filter(Boolean);
      updateService(index, field, arr);
  };

  const renderIcon = (iconName) => {
      const Icon = resolveIcon(iconName);
      return <Icon className="w-5 h-5" />;
  };

  if (loading) return <div className="text-white">Loading settings...</div>;

  return (
    <div className="bg-[#0D1126] border border-[#5468E7]/30 rounded-xl p-6 space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#0D1126] p-4 rounded-lg border border-[#5468E7]/30">
        <PenTool className="w-6 h-6 text-[#5468E7]" />
        <h2 className="text-xl font-bold text-white">Services Content</h2>
      </div>

      {/* Animation Settings */}
      <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5 space-y-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Animation Settings</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
            <button 
                onClick={() => updateSetting('animation_style', 'orbit')}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${config.animation_style === 'orbit' ? 'bg-[#5468E7]/20 border-[#5468E7] text-white' : 'bg-[#0D1126] border-white/10 text-gray-400 hover:border-white/30'}`}
            >
                <Orbit className="w-5 h-5" />
                <span className="text-sm font-medium">Orbit</span>
            </button>
            <button 
                onClick={() => updateSetting('animation_style', 'chaotic')}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${config.animation_style === 'chaotic' ? 'bg-[#5468E7]/20 border-[#5468E7] text-white' : 'bg-[#0D1126] border-white/10 text-gray-400 hover:border-white/30'}`}
            >
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Chaotic</span>
            </button>
            <button 
                onClick={() => updateSetting('animation_style', 'comet')}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${config.animation_style === 'comet' ? 'bg-[#5468E7]/20 border-[#5468E7] text-white' : 'bg-[#0D1126] border-white/10 text-gray-400 hover:border-white/30'}`}
            >
                <Zap className="w-5 h-5" />
                <span className="text-sm font-medium">Scattered</span>
            </button>
        </div>

        <div>
             <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Animation Speed</label>
                <span className="text-xs font-mono bg-[#5468E7]/20 text-[#5468E7] px-2 py-1 rounded">{config.animation_speed}s</span>
             </div>
             <Slider
                value={[config.animation_speed]}
                min={5}
                max={60}
                step={5}
                onValueChange={(val) => updateSetting('animation_speed', val[0])}
                className="py-4"
             />
        </div>
      </div>

      {/* Text Settings */}
      <div className="grid lg:grid-cols-2 gap-8 bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5">
         <div className="space-y-4">
            <div>
               <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Section Title (EN)</label>
               <input 
                  value={config.title_en || ''}
                  onChange={(e) => updateSetting('title_en', e.target.value)}
                  className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7]"
                  placeholder="Two Core Services..."
               />
            </div>
            <div>
               <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Subtitle (EN)</label>
               <textarea 
                  rows={3}
                  value={config.subtitle_en || ''}
                  onChange={(e) => updateSetting('subtitle_en', e.target.value)}
                  className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] resize-none"
               />
            </div>
         </div>
         <div className="space-y-4">
            <div>
               <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Section Title (KA)</label>
               <input 
                  value={config.title_ka || ''}
                  onChange={(e) => updateSetting('title_ka', e.target.value)}
                  className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] font-bpg-glaho"
                  placeholder="სათაური ქართულად"
               />
            </div>
            <div>
               <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Subtitle (KA)</label>
               <textarea 
                  rows={3}
                  value={config.subtitle_ka || ''}
                  onChange={(e) => updateSetting('subtitle_ka', e.target.value)}
                  className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] font-bpg-glaho resize-none"
               />
            </div>
         </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
          <div className="space-y-4">
            {config.services.map((service, index) => (
               <div key={service.id || index} className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5 hover:border-[#5468E7]/30 transition-all group relative">
                  
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button variant="destructive" size="icon" onClick={() => removeService(index)}>
                        <Trash2 className="w-4 h-4" />
                     </Button>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-6">Service #{index + 1}</h3>

                  <div className="grid md:grid-cols-12 gap-6">
                      {/* Icon Picker */}
                      <div className="md:col-span-1">
                          <label className="text-[10px] text-gray-500 block mb-2">Icon</label>
                          <div className="relative">
                              <button 
                                onClick={() => setIconPickerOpen(iconPickerOpen === index ? null : index)}
                                className="w-12 h-12 rounded-lg bg-[#0D1126] border border-white/10 flex items-center justify-center hover:border-[#5468E7] text-[#5468E7] transition-colors"
                              >
                                  {renderIcon(service.icon)}
                              </button>
                              
                              {iconPickerOpen === index && (
                                  <div className="absolute top-full left-0 mt-2 w-64 bg-[#0D1126] border border-[#5468E7]/30 rounded-lg shadow-xl p-3 z-50 grid grid-cols-5 gap-2">
                                      {iconOptions.map(iconName => (
                                          <button
                                            key={iconName}
                                            onClick={() => {
                                                updateService(index, 'icon', iconName);
                                                setIconPickerOpen(null);
                                            }}
                                            className={`p-2 rounded hover:bg-white/10 flex items-center justify-center ${service.icon === iconName ? 'bg-[#5468E7]/20 text-[#5468E7]' : 'text-gray-400'}`}
                                            title={iconName}
                                          >
                                              {renderIcon(iconName)}
                                          </button>
                                      ))}
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Content Fields */}
                      <div className="md:col-span-11 grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                              <div>
                                  <label className="text-[10px] text-gray-500 block mb-1">Title (EN)</label>
                                  <input 
                                      value={service.title_en || ''}
                                      onChange={(e) => updateService(index, 'title_en', e.target.value)}
                                      className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#5468E7]"
                                  />
                              </div>
                              <div>
                                  <label className="text-[10px] text-gray-500 block mb-1">Description (EN)</label>
                                  <textarea 
                                      rows={2}
                                      value={service.description_en || ''}
                                      onChange={(e) => updateService(index, 'description_en', e.target.value)}
                                      className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#5468E7] resize-none"
                                  />
                              </div>
                              <div>
                                  <label className="text-[10px] text-gray-500 block mb-1">Features (EN, comma separated)</label>
                                  <input 
                                      value={service.features_en?.join(', ') || ''}
                                      onChange={(e) => updateServiceArray(index, 'features_en', e.target.value)}
                                      className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:border-[#5468E7]"
                                      placeholder="Feature 1, Feature 2"
                                  />
                              </div>
                          </div>

                          <div className="space-y-4">
                              <div>
                                  <label className="text-[10px] text-gray-500 block mb-1">Title (KA)</label>
                                  <input 
                                      value={service.title_ka || ''}
                                      onChange={(e) => updateService(index, 'title_ka', e.target.value)}
                                      className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#5468E7] font-bpg-glaho"
                                  />
                              </div>
                              <div>
                                  <label className="text-[10px] text-gray-500 block mb-1">Description (KA)</label>
                                  <textarea 
                                      rows={2}
                                      value={service.description_ka || ''}
                                      onChange={(e) => updateService(index, 'description_ka', e.target.value)}
                                      className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#5468E7] font-bpg-glaho resize-none"
                                  />
                              </div>
                              <div>
                                  <label className="text-[10px] text-gray-500 block mb-1">Features (KA, comma separated)</label>
                                  <input 
                                      value={service.features_ka?.join(', ') || ''}
                                      onChange={(e) => updateServiceArray(index, 'features_ka', e.target.value)}
                                      className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:border-[#5468E7] font-bpg-glaho"
                                      placeholder="მახასიათებელი 1, მახასიათებელი 2"
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
               </div>
            ))}
          </div>

          <Button 
            variant="outline" 
            onClick={addService} 
            className="w-full py-6 border-dashed border-[#5468E7]/50 text-[#5468E7] hover:bg-[#5468E7]/10 hover:border-[#5468E7]"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Service
          </Button>
      </div>

      <div className="pt-4 border-t border-white/10">
        <Button onClick={handleSave} className="w-full bg-[#5468E7] py-6 text-lg hover:bg-[#4353b8] transition-all">
          <Save className="w-5 h-5 mr-2" /> Save Services Changes
        </Button>
      </div>
    </div>
  );
};

export default ServicesTab;