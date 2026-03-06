import React, { useState, useEffect } from 'react';
import { Save, Loader2, Globe, LayoutGrid, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const WebPageTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    title_en: '',
    title_ka: '',
    description_en: '',
    description_ka: '',
  });
  const [webProjects, setWebProjects] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Web Page Settings
      const { data: settingsData } = await supabase
        .from('web_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (settingsData) {
        setSettings(settingsData);
      }

      // 2. Fetch Web Projects (ordered)
      const { data: projectsData } = await supabase
        .from('portfolio_projects')
        .select('id, title_en, title_ka, image_url, visible, order_index, project_type')
        .or('project_type.eq.web,category_en.ilike.%web%')
        .order('order_index', { ascending: true });

      if (projectsData) {
        setWebProjects(projectsData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { data: existing } = await supabase.from('web_settings').select('id').limit(1).maybeSingle();
      
      const payload = {
        title_en: settings.title_en,
        title_ka: settings.title_ka,
        description_en: settings.description_en,
        description_ka: settings.description_ka,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        await supabase.from('web_settings').update(payload).eq('id', existing.id);
      } else {
        await supabase.from('web_settings').insert([payload]);
      }

      toast({ title: 'Success', description: 'Web page settings saved.' });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
    }
  };

  const handleProjectToggle = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .update({ visible: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;

      setWebProjects(prev => prev.map(p => p.id === id ? { ...p, visible: !currentStatus } : p));
      toast({ title: 'Updated', description: 'Project visibility updated.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update project.' });
    }
  };

  const handleReorder = async (id, direction) => {
    const currentIndex = webProjects.findIndex(p => p.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= webProjects.length) return;

    const newProjects = [...webProjects];
    const temp = newProjects[currentIndex];
    newProjects[currentIndex] = newProjects[newIndex];
    newProjects[newIndex] = temp;

    // Optimistic update
    setWebProjects(newProjects);

    try {
      // Update all order indexes in DB to match new array order
      const updates = newProjects.map((p, index) => ({
        id: p.id,
        order_index: index
      }));

      for (const update of updates) {
        await supabase.from('portfolio_projects').update({ order_index: update.order_index }).eq('id', update.id);
      }
    } catch (error) {
        console.error("Reorder failed", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save order.' });
        fetchData(); // Revert
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/>Loading Web Settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-[#0D1126] p-4 rounded-lg border border-[#5468E7]/30">
        <Globe className="w-6 h-6 text-[#5468E7]" />
        <h2 className="text-xl font-bold text-white">Web Design Page Management</h2>
      </div>

      {/* Page Header Settings */}
      <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5 space-y-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Header Content</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-2 font-medium uppercase">Page Title (EN)</label>
              <input 
                value={settings.title_en || ''}
                onChange={(e) => setSettings({...settings, title_en: e.target.value})}
                className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7]"
                placeholder="Web Design & Development"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-2 font-medium uppercase">Description (EN)</label>
              <textarea 
                rows={3}
                value={settings.description_en || ''}
                onChange={(e) => setSettings({...settings, description_en: e.target.value})}
                className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] resize-none"
                placeholder="We create modern digital experiences..."
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-2 font-medium uppercase">Page Title (KA)</label>
              <input 
                value={settings.title_ka || ''}
                onChange={(e) => setSettings({...settings, title_ka: e.target.value})}
                className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] font-bpg-glaho"
                placeholder="ვებ-გვერდების დამზადება"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-2 font-medium uppercase">Description (KA)</label>
              <textarea 
                rows={3}
                value={settings.description_ka || ''}
                onChange={(e) => setSettings({...settings, description_ka: e.target.value})}
                className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] font-bpg-glaho resize-none"
                placeholder="ჩვენ ვქმნით თანამედროვე ვებ-გვერდებს..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
            <Button onClick={handleSaveSettings} className="bg-[#5468E7] text-white">
                <Save className="w-4 h-4 mr-2" /> Save Header
            </Button>
        </div>
      </div>

      {/* Web Projects Management */}
      <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Web Projects List</h3>
            <span className="text-xs text-gray-500">Drag/Drop not implemented, use arrows to reorder</span>
        </div>

        <div className="grid gap-3">
            {webProjects.length === 0 && <div className="text-center py-8 text-gray-500">No web projects found. Add them in the Portfolio tab first.</div>}
            
            {webProjects.map((project, index) => (
                <div key={project.id} className="flex items-center gap-4 bg-[#0D1126] p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                    {/* Image */}
                    <div className="w-12 h-12 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                        {project.image_url ? (
                            <img src={project.image_url} alt="thumb" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Img</div>
                        )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-grow min-w-0">
                        <h4 className="text-white text-sm font-medium truncate">{project.title_en}</h4>
                        <p className="text-xs text-gray-500 truncate font-bpg-glaho">{project.title_ka}</p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                         {/* Visibility */}
                         <div className="flex items-center gap-2 mr-4">
                             <Switch 
                                checked={project.visible}
                                onCheckedChange={() => handleProjectToggle(project.id, project.visible)}
                             />
                             <span className={`text-xs ${project.visible ? 'text-green-500' : 'text-gray-500'}`}>
                                {project.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                             </span>
                         </div>

                         {/* Ordering */}
                         <div className="flex flex-col gap-1">
                             <button 
                                onClick={() => handleReorder(project.id, 'up')}
                                disabled={index === 0}
                                className="p-1 rounded hover:bg-white/10 text-gray-400 disabled:opacity-30"
                             >
                                <ArrowUp className="w-3 h-3" />
                             </button>
                             <button 
                                onClick={() => handleReorder(project.id, 'down')}
                                disabled={index === webProjects.length - 1}
                                className="p-1 rounded hover:bg-white/10 text-gray-400 disabled:opacity-30"
                             >
                                <ArrowDown className="w-3 h-3" />
                             </button>
                         </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default WebPageTab;