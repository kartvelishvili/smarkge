import React, { useState, useEffect } from 'react';
import { Save, Layers, Plus, Trash2, Image as ImageIcon, Sparkles, MoveHorizontal, Type, Link as LinkIcon, Eye, EyeOff, Copy, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const HeroTab = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    settings: {
      design_style: 'split_layout',
      animation_style: 'fade',
      autoplay_speed: 5000,
      background_effect: true,
      comet_style: 'simple',
      title_size: 'text-4xl lg:text-6xl',
      desc_size: 'text-lg lg:text-xl'
    },
    slides: []
  });
  const [loading, setLoading] = useState(true);

  // Complete list of available fonts based on design
  const fontOptions = [
    { value: 'font-sans', label: 'Inter (Default)' },
    { value: 'font-bpg-caps', label: 'BPG WEB 001 Caps' },
    { value: 'font-bpg-glaho', label: 'BPG Glaho WEB' },
    { value: 'font-bpg-nino-mtavruli', label: 'BPG Nino Mtavruli' },
    { value: 'font-bpg-arial', label: 'BPG Arial' }
  ];

  const buttonStyleOptions = [
    { value: 'default', label: 'Solid Gradient (Primary)' },
    { value: 'outline', label: 'Outline (Secondary)' },
    { value: 'ghost', label: 'Ghost (Transparent)' }
  ];

  const designStyleOptions = [
    { value: 'split_layout', label: 'Split Layout (Classic)' },
    { value: 'minimal_modern', label: 'Minimal Modern (Centered)' },
    { value: 'full_background', label: 'Full Background (Immersive)' },
    { value: 'gradient_mesh', label: 'Gradient Mesh (Trendy)' },
    { value: 'card_style', label: 'Card Style (Boxed)' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Ensure buttons array exists in existing slides
        const normalizedSlides = (data.slides || []).map(slide => ({
          ...slide,
          buttons: slide.buttons || [
            { id: 'btn1', text_en: 'Get Started', text_ka: 'დაწყება', link: '/contact', variant: 'default', visible: true, font: 'font-sans' },
            { id: 'btn2', text_en: 'Learn More', text_ka: 'მეტის გაგება', link: '/services', variant: 'outline', visible: true, font: 'font-sans' }
          ]
        }));

        setConfig({
          settings: {
            design_style: data.settings?.design_style || 'split_layout',
            animation_style: data.settings?.animation_style || 'fade',
            autoplay_speed: data.settings?.autoplay_speed || 5000,
            background_effect: data.settings?.background_effect ?? true,
            comet_style: data.settings?.comet_style || 'simple',
            title_size: data.settings?.title_size || 'text-4xl lg:text-6xl',
            desc_size: data.settings?.desc_size || 'text-lg lg:text-xl'
          },
          slides: normalizedSlides
        });
      } else {
        // Default init
        setConfig({
          settings: {
             design_style: 'split_layout',
             animation_style: 'fade',
             autoplay_speed: 5000,
             background_effect: true,
             comet_style: 'simple',
             title_size: 'text-4xl lg:text-6xl',
             desc_size: 'text-lg lg:text-xl'
          },
          slides: [
             {
                 id: '1',
                 badge_en: 'Digital Agency', badge_ka: 'ციფრული სააგენტო', badge_font: 'font-bpg-caps',
                 title_en: 'Transform Your Digital Presence', title_ka: 'გარდაქმენით თქვენი ციფრული რეალობა', title_font: 'font-bpg-caps',
                 subtitle_en: 'We build high-performance websites.', subtitle_ka: 'ჩვენ ვქმნით მაღალი ხარისხის ვებ-გვერდებს.', subtitle_font: 'font-bpg-glaho',
                 image_main: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
                 image_secondary: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
                 buttons: [
                   { id: 'btn1', text_en: 'Get Started', text_ka: 'დაწყება', link: '/contact', variant: 'default', visible: true, font: 'font-sans' },
                   { id: 'btn2', text_en: 'Learn More', text_ka: 'მეტის გაგება', link: '/services', variant: 'outline', visible: true, font: 'font-sans' }
                 ]
             }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching hero settings:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load hero settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: existing } = await supabase.from('hero_settings').select('id').limit(1).maybeSingle();
      
      const payload = {
        settings: config.settings,
        slides: config.slides,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existing) {
        result = await supabase.from('hero_settings').update(payload).eq('id', existing.id);
      } else {
        result = await supabase.from('hero_settings').insert([payload]);
      }

      if (result.error) throw result.error;
      toast({ title: 'Success', description: 'Hero settings saved successfully.' });
    } catch (error) {
      console.error('Error saving hero:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save hero changes.' });
    }
  };

  const updateSetting = (key, value) => {
    setConfig(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: value }
    }));
  };

  const addSlide = () => {
    const newSlide = {
      id: crypto.randomUUID(),
      badge_en: 'New Badge', badge_ka: 'ახალი ბეჯი', badge_font: 'font-bpg-caps',
      title_en: 'New Slide Title', title_ka: 'ახალი სლაიდის სათაური', title_font: 'font-bpg-caps',
      subtitle_en: 'New description text here.', subtitle_ka: 'ახალი აღწერა აქ.', subtitle_font: 'font-bpg-glaho',
      image_main: '',
      image_secondary: '',
      buttons: [
        { id: crypto.randomUUID(), text_en: 'Primary Button', text_ka: 'ღილაკი 1', link: '#', variant: 'default', visible: true, font: 'font-sans' },
        { id: crypto.randomUUID(), text_en: 'Secondary Button', text_ka: 'ღილაკი 2', link: '#', variant: 'outline', visible: true, font: 'font-sans' }
      ]
    };
    setConfig(prev => ({ ...prev, slides: [...prev.slides, newSlide] }));
  };

  const duplicateSlide = (index) => {
    const slideToClone = config.slides[index];
    
    // Deep clone the slide using JSON parse/stringify
    const newSlide = JSON.parse(JSON.stringify(slideToClone));
    
    // Assign new IDs to avoid conflicts
    newSlide.id = crypto.randomUUID();
    newSlide.buttons = newSlide.buttons.map(btn => ({
      ...btn,
      id: crypto.randomUUID()
    }));

    const newSlides = [...config.slides];
    // Insert after the current slide
    newSlides.splice(index + 1, 0, newSlide);
    
    setConfig(prev => ({ ...prev, slides: newSlides }));
    toast({ title: "Slide Duplicated", description: "Slide copied successfully." });
  };

  const removeSlide = (index) => {
    if (!window.confirm('Are you sure you want to remove this slide?')) return;
    const newSlides = [...config.slides];
    newSlides.splice(index, 1);
    setConfig(prev => ({ ...prev, slides: newSlides }));
  };

  const updateSlide = (index, field, value) => {
    const newSlides = [...config.slides];
    newSlides[index][field] = value;
    setConfig(prev => ({ ...prev, slides: newSlides }));
  };

  const updateButton = (slideIndex, btnIndex, field, value) => {
    const newSlides = [...config.slides];
    newSlides[slideIndex].buttons[btnIndex][field] = value;
    setConfig(prev => ({ ...prev, slides: newSlides }));
  };

  if (loading) return <div className="text-white">Loading hero settings...</div>;

  return (
    <div className="bg-[#0D1126] border border-[#5468E7]/30 rounded-xl p-6 space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#0D1126] p-4 rounded-lg border border-[#5468E7]/30">
        <Layers className="w-6 h-6 text-[#5468E7]" />
        <h2 className="text-xl font-bold text-white">Hero Configuration</h2>
      </div>

      {/* Global Settings */}
      <div className="grid md:grid-cols-2 gap-6 bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5">
        
        {/* Design Style Selector */}
        <div className="md:col-span-2">
           <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider flex items-center gap-2">
             <LayoutTemplate className="w-3 h-3" /> Hero Design Style
           </label>
           <div className="relative">
             <select 
               value={config.settings.design_style}
               onChange={(e) => updateSetting('design_style', e.target.value)}
               className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#5468E7] outline-none appearance-none font-medium"
             >
                {designStyleOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
             </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
           </div>
           <p className="text-[10px] text-gray-400 mt-2">
              Select the overall layout and visual style for the hero section.
           </p>
        </div>

        <div>
           <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Animation Style</label>
           <div className="relative">
             <MoveHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
             <select 
               value={config.settings.animation_style}
               onChange={(e) => updateSetting('animation_style', e.target.value)}
               className="w-full bg-[#0D1126] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-[#5468E7] outline-none appearance-none"
             >
                <option value="fade">Fade Transition</option>
                <option value="slide_horizontal">Horizontal Slide</option>
                <option value="slide_vertical">Vertical Slide</option>
                <option value="zoom">Zoom Effect</option>
             </select>
           </div>
        </div>

        <div>
           <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Autoplay Speed</label>
              <span className="text-xs font-mono bg-[#5468E7]/20 text-[#5468E7] px-2 py-1 rounded">
                {(config.settings.autoplay_speed / 1000).toFixed(1)}s
              </span>
           </div>
           <Slider
              value={[config.settings.autoplay_speed]}
              min={1000}
              max={10000}
              step={500}
              onValueChange={(val) => updateSetting('autoplay_speed', val[0])}
              className="py-4"
           />
        </div>

        <div className="flex items-center justify-between bg-[#0D1126] p-3 rounded-lg border border-white/10">
           <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#5468E7]" />
              <label className="text-sm text-white font-medium">Background Comet Effect</label>
           </div>
           <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
              <input 
                type="checkbox" 
                checked={config.settings.background_effect}
                onChange={(e) => updateSetting('background_effect', e.target.checked)}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-6 checked:border-[#5468E7]"
                style={{ top: 0, left: 0 }}
              />
              <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ${config.settings.background_effect ? 'bg-[#5468E7]' : 'bg-gray-700'}`}></label>
           </div>
        </div>

        <div>
           <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Comet Style</label>
           <select 
             value={config.settings.comet_style}
             onChange={(e) => updateSetting('comet_style', e.target.value)}
             disabled={!config.settings.background_effect}
             className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-[#5468E7] outline-none disabled:opacity-50"
           >
              <option value="simple">Simple Orb</option>
              <option value="shadow_comet">Shadow Comet</option>
              <option value="blue_comet">Blue Comet</option>
              <option value="only_comet">Only Comet (No Tail)</option>
           </select>
        </div>
      </div>

      {/* Slides List */}
      <div className="space-y-6">
        {config.slides.map((slide, idx) => (
          <div key={slide.id || idx} className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/10 hover:border-[#5468E7]/30 transition-all relative group">
             <div className="absolute top-4 right-4 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="icon" onClick={() => duplicateSlide(idx)} title="Duplicate Slide">
                   <Copy className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => removeSlide(idx)} title="Remove Slide">
                   <Trash2 className="w-4 h-4" />
                </Button>
             </div>
             
             <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                <span className="bg-[#5468E7] w-6 h-6 rounded-full flex items-center justify-center text-xs">{idx + 1}</span>
                Slide Content
             </h3>

             <div className="space-y-6">
                {/* Images */}
                <div className="grid md:grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] text-gray-500 block mb-1 flex items-center gap-2"><ImageIcon className="w-3 h-3"/> Main Image URL</label>
                      <input 
                         value={slide.image_main} 
                         onChange={(e) => updateSlide(idx, 'image_main', e.target.value)} 
                         placeholder="https://..."
                         className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-xs text-gray-300 font-mono" 
                      />
                      {slide.image_main && <div className="mt-2 h-20 w-full rounded overflow-hidden border border-white/5"><img src={slide.image_main} className="w-full h-full object-cover" /></div>}
                   </div>
                   <div>
                      <label className="text-[10px] text-gray-500 block mb-1 flex items-center gap-2"><ImageIcon className="w-3 h-3"/> Secondary Image URL</label>
                      <input 
                         value={slide.image_secondary} 
                         onChange={(e) => updateSlide(idx, 'image_secondary', e.target.value)} 
                         placeholder="https://..."
                         className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-xs text-gray-300 font-mono" 
                      />
                      {slide.image_secondary && <div className="mt-2 h-20 w-full rounded overflow-hidden border border-white/5"><img src={slide.image_secondary} className="w-full h-full object-cover" /></div>}
                   </div>
                </div>

                {/* Text Fields */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    {/* Badge */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-4">
                            <label className="text-[10px] text-gray-500 block mb-1">Badge (EN)</label>
                            <input value={slide.badge_en} onChange={(e) => updateSlide(idx, 'badge_en', e.target.value)} className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white" />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <label className="text-[10px] text-gray-500 block mb-1">Badge (KA)</label>
                            <input value={slide.badge_ka} onChange={(e) => updateSlide(idx, 'badge_ka', e.target.value)} className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white font-bpg-glaho" />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <label className="text-[10px] text-gray-500 block mb-1">Badge Font</label>
                            <div className="relative">
                                <Type className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                                <select value={slide.badge_font} onChange={(e) => updateSlide(idx, 'badge_font', e.target.value)} className="w-full bg-[#0D1126] border border-white/10 rounded pl-8 pr-2 py-2 text-xs text-gray-300">
                                    {fontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-4">
                            <label className="text-[10px] text-gray-500 block mb-1">Title (EN)</label>
                            <input value={slide.title_en} onChange={(e) => updateSlide(idx, 'title_en', e.target.value)} className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white" />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <label className="text-[10px] text-gray-500 block mb-1">Title (KA)</label>
                            <input value={slide.title_ka} onChange={(e) => updateSlide(idx, 'title_ka', e.target.value)} className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white font-bpg-glaho" />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <label className="text-[10px] text-gray-500 block mb-1">Title Font</label>
                            <div className="relative">
                                <Type className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                                <select value={slide.title_font} onChange={(e) => updateSlide(idx, 'title_font', e.target.value)} className="w-full bg-[#0D1126] border border-white/10 rounded pl-8 pr-2 py-2 text-xs text-gray-300">
                                    {fontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Subtitle */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-4">
                            <label className="text-[10px] text-gray-500 block mb-1">Subtitle (EN)</label>
                            <textarea rows={2} value={slide.subtitle_en} onChange={(e) => updateSlide(idx, 'subtitle_en', e.target.value)} className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white resize-none" />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <label className="text-[10px] text-gray-500 block mb-1">Subtitle (KA)</label>
                            <textarea rows={2} value={slide.subtitle_ka} onChange={(e) => updateSlide(idx, 'subtitle_ka', e.target.value)} className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white font-bpg-glaho resize-none" />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <label className="text-[10px] text-gray-500 block mb-1">Subtitle Font</label>
                            <div className="relative">
                                <Type className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                                <select value={slide.subtitle_font} onChange={(e) => updateSlide(idx, 'subtitle_font', e.target.value)} className="w-full bg-[#0D1126] border border-white/10 rounded pl-8 pr-2 py-2 text-xs text-gray-300">
                                    {fontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buttons Config */}
                <div className="pt-4 border-t border-white/5">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Slide Buttons</h4>
                    <div className="space-y-4">
                        {slide.buttons?.map((btn, btnIdx) => (
                             <div key={btn.id || btnIdx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 rounded bg-[#0D1126]/50 border border-white/5">
                                <div className="md:col-span-3">
                                   <label className="text-[9px] text-gray-500 block mb-1">Text (EN)</label>
                                   <input value={btn.text_en} onChange={(e) => updateButton(idx, btnIdx, 'text_en', e.target.value)} className="w-full bg-[#0D1126] border border-white/10 rounded px-2 py-1 text-xs text-white" />
                                </div>
                                <div className="md:col-span-3">
                                   <label className="text-[9px] text-gray-500 block mb-1">Text (KA)</label>
                                   <input value={btn.text_ka} onChange={(e) => updateButton(idx, btnIdx, 'text_ka', e.target.value)} className="w-full bg-[#0D1126] border border-white/10 rounded px-2 py-1 text-xs text-white" />
                                </div>
                                <div className="md:col-span-2">
                                   <label className="text-[9px] text-gray-500 block mb-1 flex items-center gap-1"><LinkIcon className="w-2 h-2"/> Link</label>
                                   <input value={btn.link} onChange={(e) => updateButton(idx, btnIdx, 'link', e.target.value)} className="w-full bg-[#0D1126] border border-white/10 rounded px-2 py-1 text-xs text-white" />
                                </div>
                                <div className="md:col-span-2">
                                   <label className="text-[9px] text-gray-500 block mb-1">Style</label>
                                   <select value={btn.variant} onChange={(e) => updateButton(idx, btnIdx, 'variant', e.target.value)} className="w-full bg-[#0D1126] border border-white/10 rounded px-2 py-1 text-xs text-gray-300">
                                        {buttonStyleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                   </select>
                                </div>
                                <div className="md:col-span-2">
                                   <label className="text-[9px] text-gray-500 block mb-1">Font</label>
                                   <select value={btn.font || 'font-sans'} onChange={(e) => updateButton(idx, btnIdx, 'font', e.target.value)} className="w-full bg-[#0D1126] border border-white/10 rounded px-2 py-1 text-xs text-gray-300">
                                        {fontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                   </select>
                                </div>
                                <div className="md:col-span-12 flex justify-end pb-1">
                                    <button 
                                      onClick={() => updateButton(idx, btnIdx, 'visible', !btn.visible)}
                                      className={`p-1.5 rounded transition-colors ${btn.visible ? 'bg-[#5468E7]/20 text-[#5468E7]' : 'bg-gray-800 text-gray-500'}`}
                                      title={btn.visible ? 'Hide Button' : 'Show Button'}
                                    >
                                        {btn.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>

             </div>
          </div>
        ))}

        <Button 
          variant="outline" 
          onClick={addSlide} 
          className="w-full py-6 border-dashed border-[#5468E7]/50 text-[#5468E7] hover:bg-[#5468E7]/10 hover:border-[#5468E7]"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Slide
        </Button>
      </div>

      <div className="pt-4 border-t border-white/10">
        <Button onClick={handleSave} className="w-full bg-[#5468E7] py-6 text-lg hover:bg-[#4353b8] transition-all">
          <Save className="w-5 h-5 mr-2" /> Save Hero Changes
        </Button>
      </div>
    </div>
  );
};

export default HeroTab;