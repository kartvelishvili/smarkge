import React, { useState, useEffect } from 'react';
import { Save, Layout, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const HeaderTab = () => {
  const { toast } = useToast();
  const [headerConfig, setHeaderConfig] = useState({
    logo_dark: '',
    logo_light: '',
    menu_items: [],
    cta_button: { text_en: 'Start Project', text_ka: 'დაიწყე პროექტი', link: '/contact', visible: true }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('header_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      if (data) {
        // Ensure menu_items is an array and sort by order_index if available, else just index
        const items = Array.isArray(data.menu_items) ? data.menu_items : [];
        setHeaderConfig({ ...data, menu_items: items });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: existing } = await supabase.from('header_settings').select('id').limit(1).maybeSingle();
      let result;
      if (existing) {
        result = await supabase.from('header_settings').update(headerConfig).eq('id', existing.id);
      } else {
        result = await supabase.from('header_settings').insert([headerConfig]);
      }
      if (result.error) throw result.error;
      toast({ title: 'Success', description: 'Header updated.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save header.' });
    }
  };

  const moveItem = (index, direction) => {
      const newItems = [...headerConfig.menu_items];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newItems.length) return;
      
      // Swap
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      setHeaderConfig({ ...headerConfig, menu_items: newItems });
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="bg-[#0D1126] border border-[#5468E7]/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6 bg-[#0D1126] p-4 rounded-lg border border-[#5468E7]/30">
        <Layout className="w-6 h-6 text-[#5468E7]" />
        <h2 className="text-xl font-bold text-white">Header Settings</h2>
      </div>

      {/* CTA Button Settings */}
      <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5 mb-8">
         <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Call to Action Button</h3>
         <div className="grid md:grid-cols-2 gap-4">
            <div>
               <label className="text-xs text-gray-500 block mb-1">Button Text (EN)</label>
               <input 
                 value={headerConfig.cta_button?.text_en || ''} 
                 onChange={(e) => setHeaderConfig({...headerConfig, cta_button: {...headerConfig.cta_button, text_en: e.target.value}})} 
                 className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white" 
               />
            </div>
            <div>
               <label className="text-xs text-gray-500 block mb-1">Button Text (KA)</label>
               <input 
                 value={headerConfig.cta_button?.text_ka || ''} 
                 onChange={(e) => setHeaderConfig({...headerConfig, cta_button: {...headerConfig.cta_button, text_ka: e.target.value}})} 
                 className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white" 
               />
            </div>
            <div className="md:col-span-2">
               <label className="text-xs text-gray-500 block mb-1">Link URL</label>
               <input 
                 value={headerConfig.cta_button?.link || ''} 
                 onChange={(e) => setHeaderConfig({...headerConfig, cta_button: {...headerConfig.cta_button, link: e.target.value}})} 
                 className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white" 
                 placeholder="/contact"
               />
            </div>
            <div className="flex items-center gap-2">
               <input 
                 type="checkbox"
                 checked={headerConfig.cta_button?.visible || false}
                 onChange={(e) => setHeaderConfig({...headerConfig, cta_button: {...headerConfig.cta_button, visible: e.target.checked}})}
               />
               <label className="text-sm text-white">Show Button</label>
            </div>
         </div>
      </div>

      {/* Menu Items */}
      <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5 mb-8">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Menu Items</h3>
             <Button onClick={() => setHeaderConfig({...headerConfig, menu_items: [...(headerConfig.menu_items || []), { id: crypto.randomUUID(), link: '/', label_en: 'New', label_ka: 'ახალი' }]})} size="sm" className="bg-[#5468E7]/20 text-[#5468E7]"><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
          </div>
          <div className="space-y-4">
            {headerConfig.menu_items?.map((item, idx) => (
              <div key={item.id} className="bg-[#0D1126] p-4 rounded-lg border border-white/5 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1 flex flex-col items-center justify-center gap-1">
                      <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-white disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                      <button onClick={() => moveItem(idx, 1)} disabled={idx === headerConfig.menu_items.length - 1} className="text-gray-400 hover:text-white disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                  </div>
                  <div className="col-span-4">
                     <label className="text-[10px] text-gray-500 block mb-1">Label (EN)</label>
                     <input value={item.label_en} onChange={(e) => {const i = [...headerConfig.menu_items]; i[idx].label_en = e.target.value; setHeaderConfig({...headerConfig, menu_items: i})}} className="w-full bg-[#0A0F1C] border border-white/10 rounded px-2 py-2 text-sm text-white" />
                  </div>
                  <div className="col-span-4">
                     <label className="text-[10px] text-gray-500 block mb-1">Label (KA)</label>
                     <input value={item.label_ka} onChange={(e) => {const i = [...headerConfig.menu_items]; i[idx].label_ka = e.target.value; setHeaderConfig({...headerConfig, menu_items: i})}} className="w-full bg-[#0A0F1C] border border-white/10 rounded px-2 py-2 text-sm text-white" />
                  </div>
                  <div className="col-span-2">
                     <label className="text-[10px] text-gray-500 block mb-1">Link</label>
                     <input value={item.link} onChange={(e) => {const i = [...headerConfig.menu_items]; i[idx].link = e.target.value; setHeaderConfig({...headerConfig, menu_items: i})}} className="w-full bg-[#0A0F1C] border border-white/10 rounded px-2 py-2 text-sm text-white" />
                  </div>
                  <div className="col-span-1 flex justify-end">
                     <Button variant="ghost" size="icon" onClick={() => setHeaderConfig({...headerConfig, menu_items: headerConfig.menu_items.filter((_, i) => i !== idx)})} className="text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                  </div>
              </div>
            ))}
          </div>
      </div>

      <Button onClick={handleSave} className="w-full bg-[#5468E7] py-6 text-lg">
        <Save className="w-5 h-5 mr-2" /> Save Header Changes
      </Button>
    </div>
  );
};

export default HeaderTab;