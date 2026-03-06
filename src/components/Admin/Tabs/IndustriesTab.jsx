import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, PenTool, Layout, Image as ImageIcon, Briefcase, Building2, ShoppingCart, GraduationCap, Plane, Stethoscope, HeartHandshake as Handshake, Monitor, Globe, Box, Factory, Truck, CheckCircle2, MoreHorizontal, Grid, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { resolveIcon } from '@/lib/iconMap';

const IndustriesTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    title_en: 'Industries We Work With',
    title_ka: 'ინდუსტრიები, რომლებთანაც ვმუშაობთ',
    description_en: 'We bring specialized expertise to diverse industries, understanding the unique challenges and opportunities each sector presents.',
    description_ka: 'ჩვენ გთავაზობთ სპეციალიზებულ გამოცდილებას სხვადასხვა ინდუსტრიისთვის, გვესმის თითოეული სექტორის უნიკალური გამოწვევები და შესაძლებლობები.',
    layout_type: 'layout_4', // Default to Overlay as seen in screenshot
    background_style: 'gradient_blue',
    section_height: 80, // percentage or arbitrary unit
    industries: []
  });

  const [iconPickerOpen, setIconPickerOpen] = useState(null);

  // Common industry icons
  const iconOptions = [
    'Stethoscope', 'Building2', 'ShoppingCart', 'GraduationCap', 'Plane', 
    'Briefcase', 'Factory', 'Truck', 'Monitor', 'Smartphone', 'Globe', 
    'Cpu', 'Zap', 'Database', 'Shield', 'Users', 'BarChart3', 'Landmark'
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('industries_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          ...data,
          industries: Array.isArray(data.industries) ? data.industries : []
        });
      } else {
        // Default Data Initialization
        setConfig(prev => ({
          ...prev,
          industries: [
            {
              id: 'ind_1',
              title_en: 'Healthcare',
              title_ka: 'ჯანდაცვა',
              description_en: 'Medical practices, clinics, and wellness centers',
              description_ka: 'სამედიცინო პრაქტიკები, კლინიკები და გამაჯანსაღებელი ცენტრები',
              icon: 'Stethoscope',
              image_url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80',
              visible: true
            },
            {
              id: 'ind_2',
              title_en: 'Real Estate',
              title_ka: 'უძრავი ქონება',
              description_en: 'Agencies, brokers, and property management',
              description_ka: 'სააგენტოები, ბროკერები და ქონების მართვა',
              icon: 'Building2',
              image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80',
              visible: true
            },
            {
              id: 'ind_3',
              title_en: 'E-commerce',
              title_ka: 'ელ-კომერცია',
              description_en: 'Online stores and retail businesses',
              description_ka: 'ონლაინ მაღაზიები და საცალო ვაჭრობა',
              icon: 'ShoppingCart',
              image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80',
              visible: true
            },
            {
              id: 'ind_4',
              title_en: 'Education',
              title_ka: 'განათლება',
              description_en: 'Schools, courses, and training programs',
              description_ka: 'სკოლები, კურსები და ტრენინგ პროგრამები',
              icon: 'GraduationCap',
              image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80',
              visible: true
            },
            {
              id: 'ind_5',
              title_en: 'Hospitality & Tourism',
              title_ka: 'ტურიზმი',
              description_en: 'Hotels, restaurants, and travel agencies',
              description_ka: 'სასტუმროები, რესტორნები და ტურისტული სააგენტოები',
              icon: 'Plane',
              image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80',
              visible: true
            },
            {
              id: 'ind_6',
              title_en: 'B2B Services',
              title_ka: 'B2B სერვისები',
              description_en: 'Professional services and consulting firms',
              description_ka: 'პროფესიული სერვისები და საკონსულტაციო ფირმები',
              icon: 'Briefcase',
              image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
              visible: true
            }
          ]
        }));
      }
    } catch (error) {
      console.error('Error fetching industries settings:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load industries settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: existing } = await supabase.from('industries_settings').select('id').limit(1).maybeSingle();
      
      const payload = {
        title_en: config.title_en,
        title_ka: config.title_ka,
        description_en: config.description_en,
        description_ka: config.description_ka,
        layout_type: config.layout_type,
        background_style: config.background_style,
        section_height: config.section_height,
        industries: config.industries,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existing) {
        result = await supabase.from('industries_settings').update(payload).eq('id', existing.id);
      } else {
        result = await supabase.from('industries_settings').insert([payload]);
      }

      if (result.error) throw result.error;
      toast({ title: 'Success', description: 'Industries settings saved successfully.' });
    } catch (error) {
      console.error('Error saving industries:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
    }
  };

  const updateSetting = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const addIndustry = () => {
    const newIndustry = {
      id: crypto.randomUUID(),
      title_en: 'New Industry',
      title_ka: 'ახალი ინდუსტრია',
      description_en: 'Description goes here',
      description_ka: 'აღწერა აქ',
      icon: 'Briefcase',
      image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
      visible: true
    };
    setConfig(prev => ({ ...prev, industries: [...prev.industries, newIndustry] }));
  };

  const removeIndustry = (index) => {
    if (!window.confirm('Are you sure you want to delete this industry?')) return;
    const newIndustries = [...config.industries];
    newIndustries.splice(index, 1);
    setConfig(prev => ({ ...prev, industries: newIndustries }));
  };

  const updateIndustry = (index, field, value) => {
    const newIndustries = [...config.industries];
    newIndustries[index][field] = value;
    setConfig(prev => ({ ...prev, industries: newIndustries }));
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
        <Factory className="w-6 h-6 text-[#5468E7]" />
        <h2 className="text-xl font-bold text-white">Industries Configuration</h2>
      </div>

      {/* Layout Selection */}
      <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Layout Style</h3>
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { id: 'layout_1', label: 'Minimal', icon: MoreHorizontal },
            { id: 'layout_2', label: 'Card Visual', icon: ImageIcon },
            { id: 'layout_3', label: 'Grayscale', icon: Grid },
            { id: 'layout_4', label: 'Overlay', icon: Layout },
            { id: 'layout_5', label: 'Organic', icon: Box },
          ].map(layout => (
            <button
              key={layout.id}
              onClick={() => updateSetting('layout_type', layout.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all gap-2 h-24 ${
                config.layout_type === layout.id 
                  ? 'bg-[#5468E7]/20 border-[#5468E7] text-white' 
                  : 'bg-[#0D1126] border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              <layout.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{layout.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Background Selection */}
      <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Section Background</h3>
        <div className="grid md:grid-cols-6 gap-3">
          {[
            { id: 'default', label: 'Default' },
            { id: 'solid_gray', label: 'Solid Dark' },
            { id: 'gradient_blue', label: 'Blue Gradient' },
            { id: 'gradient_dark', label: 'Deep Night' },
            { id: 'grid', label: 'Grid' },
            { id: 'dots', label: 'Dots' },
          ].map(bg => (
            <button
              key={bg.id}
              onClick={() => updateSetting('background_style', bg.id)}
              className={`px-3 py-2 rounded text-xs font-medium border transition-all ${
                config.background_style === bg.id 
                  ? 'bg-[#5468E7] border-[#5468E7] text-white' 
                  : 'bg-[#0D1126] border-white/10 text-gray-400 hover:bg-white/5'
              }`}
            >
              {bg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Titles & Descriptions */}
      <div className="grid lg:grid-cols-2 gap-8 bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Industries We Work With (EN)</label>
            <input 
              value={config.title_en || ''}
              onChange={(e) => updateSetting('title_en', e.target.value)}
              className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Description (EN)</label>
            <textarea 
              rows={3}
              value={config.description_en || ''}
              onChange={(e) => updateSetting('description_en', e.target.value)}
              className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] resize-none"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Industries We Work With (KA)</label>
            <input 
              value={config.title_ka || ''}
              onChange={(e) => updateSetting('title_ka', e.target.value)}
              className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] font-bpg-glaho"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Description (KA)</label>
            <textarea 
              rows={3}
              value={config.description_ka || ''}
              onChange={(e) => updateSetting('description_ka', e.target.value)}
              className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] font-bpg-glaho resize-none"
            />
          </div>
        </div>
      </div>

      {/* Industries List */}
      <div className="space-y-4">
        {config.industries.map((industry, index) => (
          <div key={industry.id || index} className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5 hover:border-[#5468E7]/30 transition-all group relative">
             <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#0D1126] rounded-md border border-white/10">
                        {renderIcon(industry.icon)}
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                     <Switch 
                        checked={industry.visible !== false}
                        onCheckedChange={(checked) => updateIndustry(index, 'visible', checked)}
                     />
                     <Button variant="destructive" size="icon" onClick={() => removeIndustry(index)} className="h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                     </Button>
                 </div>
             </div>

             <div className="grid md:grid-cols-12 gap-6">
                {/* Image & Icon */}
                <div className="md:col-span-12 space-y-4">
                    <div className="flex items-end gap-4">
                         <div className="flex-1">
                             <label className="text-[10px] text-gray-500 block mb-1">Image URL</label>
                             <div className="flex gap-2">
                                <div className="p-2 bg-[#0D1126] border border-white/10 rounded shrink-0 w-10 h-10 flex items-center justify-center">
                                   <ImageIcon className="w-4 h-4 text-gray-500" />
                                </div>
                                <input 
                                    value={industry.image_url || ''}
                                    onChange={(e) => updateIndustry(index, 'image_url', e.target.value)}
                                    className="flex-1 bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-xs text-gray-300 focus:border-[#5468E7]"
                                    placeholder="https://..."
                                />
                             </div>
                         </div>
                         <div className="relative">
                              <label className="text-[10px] text-gray-500 block mb-1">Icon</label>
                              <button 
                                onClick={() => setIconPickerOpen(iconPickerOpen === index ? null : index)}
                                className="w-10 h-10 rounded bg-[#0D1126] border border-white/10 flex items-center justify-center hover:border-[#5468E7] text-[#5468E7] transition-colors"
                              >
                                  {renderIcon(industry.icon)}
                              </button>
                              
                              {iconPickerOpen === index && (
                                  <div className="absolute top-full right-0 mt-2 w-64 bg-[#0D1126] border border-[#5468E7]/30 rounded-lg shadow-xl p-3 z-50 grid grid-cols-5 gap-2">
                                      {iconOptions.map(iconName => (
                                          <button
                                            key={iconName}
                                            onClick={() => {
                                                updateIndustry(index, 'icon', iconName);
                                                setIconPickerOpen(null);
                                            }}
                                            className={`p-2 rounded hover:bg-white/10 flex items-center justify-center ${industry.icon === iconName ? 'bg-[#5468E7]/20 text-[#5468E7]' : 'text-gray-400'}`}
                                            title={iconName}
                                          >
                                              {renderIcon(iconName)}
                                          </button>
                                      ))}
                                  </div>
                              )}
                         </div>
                    </div>
                </div>

                {/* Content */}
                <div className="md:col-span-6 space-y-3">
                    <input 
                        value={industry.title_en || ''}
                        onChange={(e) => updateIndustry(index, 'title_en', e.target.value)}
                        className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#5468E7]"
                        placeholder="Title (EN)"
                    />
                    <textarea 
                        rows={2}
                        value={industry.description_en || ''}
                        onChange={(e) => updateIndustry(index, 'description_en', e.target.value)}
                        className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#5468E7] resize-none"
                        placeholder="Description (EN)"
                    />
                </div>
                <div className="md:col-span-6 space-y-3">
                    <input 
                        value={industry.title_ka || ''}
                        onChange={(e) => updateIndustry(index, 'title_ka', e.target.value)}
                        className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#5468E7] font-bpg-glaho"
                        placeholder="სათაური (KA)"
                    />
                    <textarea 
                        rows={2}
                        value={industry.description_ka || ''}
                        onChange={(e) => updateIndustry(index, 'description_ka', e.target.value)}
                        className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#5468E7] font-bpg-glaho resize-none"
                        placeholder="აღწერა (KA)"
                    />
                </div>
             </div>
          </div>
        ))}

        <Button 
          variant="outline" 
          onClick={addIndustry} 
          className="w-full py-6 border-dashed border-[#5468E7]/50 text-[#5468E7] hover:bg-[#5468E7]/10 hover:border-[#5468E7]"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Industry
        </Button>
      </div>

      <div className="pt-4 border-t border-white/10">
        <Button onClick={handleSave} className="w-full bg-[#5468E7] py-6 text-lg hover:bg-[#4353b8] transition-all">
          <Save className="w-5 h-5 mr-2" /> Save Industries
        </Button>
      </div>
    </div>
  );
};

export default IndustriesTab;