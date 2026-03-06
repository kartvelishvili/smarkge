import React, { useState, useEffect } from 'react';
import { Save, Languages, Plus, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const TranslationTab = () => {
  const { toast } = useToast();
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [newKey, setNewKey] = useState('');

  // Grouping categories for better organization
  const categories = ['nav', 'hero', 'core', 'social', 'contact', 'footer', 'news', 'portfolio', 'general'];
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    try {
      const { data, error } = await supabase.from('app_translations').select('*').order('key');
      if (error) throw error;
      setTranslations(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRow = async (item) => {
    try {
      const { error } = await supabase.from('app_translations').upsert(item);
      if (error) throw error;
      toast({ title: 'Success', description: 'Translation updated.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update.' });
    }
  };

  const handleDelete = async (key) => {
    // Fixed: Use window.confirm to avoid ESLint no-restricted-globals error
    if (!window.confirm('Are you sure you want to delete this translation key?')) return;
    try {
      const { error } = await supabase.from('app_translations').delete().eq('key', key);
      if (error) throw error;
      setTranslations(translations.filter(t => t.key !== key));
      toast({ title: 'Deleted', description: 'Translation key removed.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete.' });
    }
  };

  const handleAddNew = async () => {
    if (!newKey) return;
    const formattedKey = newKey.toLowerCase().replace(/\s+/g, '_');
    
    // Check if exists
    if (translations.find(t => t.key === formattedKey)) {
        toast({ variant: 'destructive', title: 'Error', description: 'Key already exists.' });
        return;
    }

    const newItem = { key: formattedKey, en: '', ka: '' };
    try {
        const { error } = await supabase.from('app_translations').insert([newItem]);
        if (error) throw error;
        setTranslations([...translations, newItem]);
        setNewKey('');
        toast({ title: 'Success', description: 'New key added.' });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to add key.' });
    }
  };

  const filtered = translations.filter(t => {
      const matchesSearch = t.key.includes(search) || (t.en && t.en.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = activeCategory === 'all' || t.key.startsWith(activeCategory);
      return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="text-white">Loading translations...</div>;

  return (
    <div className="bg-[#0D1126] border border-[#5468E7]/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6 bg-[#0D1126] p-4 rounded-lg border border-[#5468E7]/30">
        <Languages className="w-6 h-6 text-[#5468E7]" />
        <h2 className="text-xl font-bold text-white">Translations Manager</h2>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
         <div className="md:col-span-3">
             <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                <button 
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${activeCategory === 'all' ? 'bg-[#5468E7] text-white' : 'bg-[#0A0F1C] text-gray-400 border border-white/10'}`}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${activeCategory === cat ? 'bg-[#5468E7] text-white' : 'bg-[#0A0F1C] text-gray-400 border border-white/10'}`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
             </div>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  placeholder="Search keys or text..." 
                  className="w-full bg-[#0A0F1C] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#5468E7] outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
         </div>
         <div className="md:col-span-1 bg-[#0A0F1C]/50 p-4 rounded-lg border border-white/5">
            <label className="text-xs text-gray-500 block mb-2">Add New Key</label>
            <div className="flex gap-2">
                <input 
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="section_key_name"
                    className="flex-1 bg-[#0D1126] border border-white/10 rounded px-2 py-1 text-sm text-white"
                />
                <Button size="icon" onClick={handleAddNew} className="bg-[#5468E7] h-8 w-8"><Plus className="w-4 h-4" /></Button>
            </div>
         </div>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {filtered.map((item) => (
          <div key={item.key} className="bg-[#0A0F1C]/50 p-4 rounded-lg border border-white/5 hover:border-[#5468E7]/30 transition-colors">
            <div className="flex justify-between items-center mb-3">
               <span className="text-xs font-mono text-[#5468E7] bg-[#5468E7]/10 px-2 py-1 rounded border border-[#5468E7]/20">{item.key}</span>
               <div className="flex gap-2">
                   <Button size="sm" variant="ghost" onClick={() => handleDelete(item.key)} className="text-red-500 hover:text-red-400 h-8 px-2"><Trash2 className="w-4 h-4" /></Button>
                   <Button size="sm" onClick={() => handleSaveRow(item)} className="bg-[#5468E7] hover:bg-[#4555d1] h-8">Save</Button>
               </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
               <div>
                 <label className="text-[10px] text-gray-500 block mb-1 uppercase tracking-wider">English</label>
                 <textarea 
                    rows={2}
                    value={item.en || ''}
                    onChange={(e) => {
                       const newTrans = translations.map(t => t.key === item.key ? { ...t, en: e.target.value } : t);
                       setTranslations(newTrans);
                    }}
                    className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] outline-none resize-none" 
                    placeholder="English text..."
                 />
               </div>
               <div>
                 <label className="text-[10px] text-gray-500 block mb-1 uppercase tracking-wider">Georgian</label>
                 <textarea 
                    rows={2}
                    value={item.ka || ''}
                    onChange={(e) => {
                       const newTrans = translations.map(t => t.key === item.key ? { ...t, ka: e.target.value } : t);
                       setTranslations(newTrans);
                    }}
                    className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] outline-none font-bpg-glaho resize-none" 
                    placeholder="ქართული ტექსტი..."
                 />
               </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-gray-500 py-8">No translations found matching your criteria.</div>}
      </div>
    </div>
  );
};

export default TranslationTab;