import React, { useState, useEffect } from 'react';
import { Save, LayoutGrid, Plus, Trash2, Image as ImageIcon, Briefcase, ExternalLink, Link as LinkIcon, Edit, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const PortfolioPageTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    title_en: 'Our Work',
    title_ka: 'ჩვენი ნამუშევრები',
    description_en: 'Take a look at our recent projects and see how we help businesses grow.',
    description_ka: 'გადახედეთ ჩვენს ბოლოდროინდელ პროექტებს და ნახეთ, როგორ ვეხმარებით ბიზნესებს ზრდაში.',
    show_title: true,
    background_style: 'default', // default, dark, gradient
    section_height: 100,
    showcase_layout: 'grid', // grid, masonry, list
    card_style: 'standard', // standard, minimal, overlay
    featured_project_id: null,
    selected_project_ids: [],
    projects: [] // We will fetch actual projects separately but manage settings here
  });
  
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null); // ID of project being edited
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Page Settings
      const { data: settingsData } = await supabase
        .from('portfolio_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (settingsData) {
        setConfig(prev => ({ ...prev, ...settingsData }));
      }

      // 2. Fetch Projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('order_index', { ascending: true });
        
      if (projectsError) throw projectsError;
      
      setProjects(projectsData || []);

    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load portfolio data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { data: existing } = await supabase.from('portfolio_settings').select('id').limit(1).maybeSingle();
      
      const payload = {
        title_en: config.title_en,
        title_ka: config.title_ka,
        description_en: config.description_en,
        description_ka: config.description_ka,
        show_title: config.show_title,
        background_style: config.background_style,
        section_height: config.section_height,
        showcase_layout: config.showcase_layout,
        card_style: config.card_style,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existing) {
        result = await supabase.from('portfolio_settings').update(payload).eq('id', existing.id);
      } else {
        result = await supabase.from('portfolio_settings').insert([payload]);
      }

      if (result.error) throw result.error;
      toast({ title: 'Success', description: 'Portfolio page settings saved.' });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
    }
  };

  const handleAddProject = async () => {
    const newProject = {
      title_en: 'New Project',
      title_ka: 'ახალი პროექტი',
      description_en: 'Project description...',
      description_ka: 'პროექტის აღწერა...',
      category_en: 'Web Design',
      category_ka: 'ვებ დიზაინი',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
      visible: true,
      order_index: projects.length,
      project_type: 'web',
      industry_ids: [],
      slug: `project-${Date.now()}`
    };

    try {
      const { data, error } = await supabase.from('portfolio_projects').insert([newProject]).select();
      if (error) throw error;
      if (data) {
        setProjects([...projects, data[0]]);
        setEditingProject(data[0].id);
        toast({ title: 'Success', description: 'New project added.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create project.' });
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(projects.filter(p => p.id !== id));
      toast({ title: 'Deleted', description: 'Project removed successfully.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete project.' });
    }
  };

  const handleUpdateProject = async (id, field, value) => {
    // Optimistic update
    const updatedProjects = projects.map(p => p.id === id ? { ...p, [field]: value } : p);
    setProjects(updatedProjects);

    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .update({ [field]: value })
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save change.' });
    }
  };

  const handleFileUpload = async (projectId, file) => {
    if (!file) return;

    try {
      setUploadingId(projectId);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      await handleUpdateProject(projectId, 'image_url', publicUrl);
      toast({ title: 'Success', description: 'Image uploaded successfully.' });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload image.' });
    } finally {
      setUploadingId(null);
    }
  };
  
  if (loading) return <div className="text-white">Loading portfolio data...</div>;

  return (
    <div className="bg-[#0D1126] border border-[#5468E7]/30 rounded-xl p-6 space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#0D1126] p-4 rounded-lg border border-[#5468E7]/30">
        <LayoutGrid className="w-6 h-6 text-[#5468E7]" />
        <h2 className="text-xl font-bold text-white">Portfolio Page Management</h2>
      </div>

      {/* Page Settings Section */}
      <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5 space-y-6">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Hero Section Settings</h3>
           <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Show Title</span>
              <Switch 
                checked={config.show_title}
                onCheckedChange={(checked) => setConfig({...config, show_title: checked})}
              />
           </div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
           <div className="space-y-4">
              <div>
                 <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Page Title (EN)</label>
                 <input 
                    value={config.title_en || ''}
                    onChange={(e) => setConfig({...config, title_en: e.target.value})}
                    className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7]"
                 />
              </div>
              <div>
                 <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Description (EN)</label>
                 <textarea 
                    rows={3}
                    value={config.description_en || ''}
                    onChange={(e) => setConfig({...config, description_en: e.target.value})}
                    className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] resize-none"
                 />
              </div>
           </div>
           <div className="space-y-4">
              <div>
                 <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Page Title (KA)</label>
                 <input 
                    value={config.title_ka || ''}
                    onChange={(e) => setConfig({...config, title_ka: e.target.value})}
                    className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] font-bpg-glaho"
                 />
              </div>
              <div>
                 <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Description (KA)</label>
                 <textarea 
                    rows={3}
                    value={config.description_ka || ''}
                    onChange={(e) => setConfig({...config, description_ka: e.target.value})}
                    className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] font-bpg-glaho resize-none"
                 />
              </div>
           </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
           <div>
              <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Background Style</label>
              <select 
                value={config.background_style}
                onChange={(e) => setConfig({...config, background_style: e.target.value})}
                className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] outline-none"
              >
                 <option value="default">Default Light/Dark</option>
                 <option value="gradient_blue">Blue Gradient</option>
                 <option value="solid_dark">Solid Dark</option>
                 <option value="dots">Dot Pattern</option>
              </select>
           </div>
           
           <div>
              <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Layout Style</label>
              <select 
                value={config.showcase_layout}
                onChange={(e) => setConfig({...config, showcase_layout: e.target.value})}
                className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] outline-none"
              >
                 <option value="grid">Grid (Standard)</option>
                 <option value="masonry">Masonry</option>
                 <option value="list">List View</option>
              </select>
           </div>
           
           <div>
              <label className="text-xs text-gray-500 block mb-2 font-medium uppercase tracking-wider">Card Style</label>
              <select 
                value={config.card_style}
                onChange={(e) => setConfig({...config, card_style: e.target.value})}
                className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] outline-none"
              >
                 <option value="standard">Standard Card</option>
                 <option value="minimal">Minimal</option>
                 <option value="overlay">Image Overlay</option>
              </select>
           </div>
        </div>
        
        <Button onClick={handleSaveSettings} className="bg-[#5468E7] w-full mt-4"><Save className="w-4 h-4 mr-2"/> Save Page Settings</Button>
      </div>

      {/* Projects List Management */}
      <div className="space-y-4">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Portfolio Projects</h3>
            <Button onClick={handleAddProject} size="sm" className="bg-[#5468E7] hover:bg-[#4353b8] text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </Button>
         </div>
         
         <div className="grid gap-4">
            {projects.length === 0 && <div className="text-center text-gray-500 py-8 bg-[#0A0F1C]/30 rounded-lg border border-dashed border-white/10">No projects found. Add one to get started.</div>}
            
            {projects.map((project, index) => (
                <div key={project.id} className={`bg-[#0A0F1C]/50 rounded-lg border transition-all ${editingProject === project.id ? 'border-[#5468E7] ring-1 ring-[#5468E7]/50' : 'border-white/5 hover:border-white/20'}`}>
                    
                    {/* Collapsed View Header */}
                    <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setEditingProject(editingProject === project.id ? null : project.id)}>
                        <div className="w-12 h-12 rounded bg-gray-800 overflow-hidden flex-shrink-0 border border-white/10">
                            {project.image_url ? (
                                <img src={project.image_url} className="w-full h-full object-cover" alt="thumb" />
                            ) : (
                                <ImageIcon className="w-full h-full p-3 text-gray-600" />
                            )}
                        </div>
                        <div className="flex-grow min-w-0">
                            <h4 className="text-white font-medium truncate">{project.title_en}</h4>
                            <p className="text-xs text-gray-500">{project.category_en} • {project.project_type === 'social_media' ? 'Social' : 'Web'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className={`text-[10px] px-2 py-1 rounded border ${project.visible ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                                 {project.visible ? 'Visible' : 'Hidden'}
                             </span>
                             <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={(e) => { e.stopPropagation(); setEditingProject(editingProject === project.id ? null : project.id); }}>
                                 <Edit className="w-4 h-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}>
                                 <Trash2 className="w-4 h-4" />
                             </Button>
                        </div>
                    </div>

                    {/* Expanded Edit Form */}
                    {editingProject === project.id && (
                        <div className="p-6 border-t border-white/10 bg-[#0D1126]/30 animate-in slide-in-from-top-2 duration-200">
                             <div className="grid md:grid-cols-2 gap-6 mb-6">
                                 {/* Left Column: Image & Basic Info */}
                                 <div className="space-y-4">
                                     <div>
                                         <label className="text-[10px] text-gray-500 block mb-1">Project Image</label>
                                         <div className="relative aspect-video bg-[#0A0F1C] border border-white/10 rounded-lg overflow-hidden group">
                                             <img src={project.image_url} className="w-full h-full object-cover" alt="preview" />
                                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                 <label className="cursor-pointer bg-[#5468E7] text-white px-4 py-2 rounded text-xs flex items-center gap-2 hover:bg-[#4353b8]">
                                                     <UploadCloud className="w-3 h-3" /> Change Image
                                                     <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(project.id, e.target.files[0])} disabled={uploadingId === project.id} />
                                                 </label>
                                             </div>
                                             {uploadingId === project.id && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
                                         </div>
                                     </div>
                                     
                                     <div className="grid grid-cols-2 gap-4">
                                         <div>
                                            <label className="text-[10px] text-gray-500 block mb-1">Visibility</label>
                                            <div className="flex items-center gap-2 bg-[#0A0F1C] p-2 rounded border border-white/10">
                                                <Switch checked={project.visible} onCheckedChange={(checked) => handleUpdateProject(project.id, 'visible', checked)} />
                                                <span className="text-xs text-gray-300">{project.visible ? 'Public' : 'Hidden'}</span>
                                            </div>
                                         </div>
                                         <div>
                                            <label className="text-[10px] text-gray-500 block mb-1">Project Type</label>
                                            <select 
                                                value={project.project_type || 'web'}
                                                onChange={(e) => handleUpdateProject(project.id, 'project_type', e.target.value)}
                                                className="w-full bg-[#0A0F1C] border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none"
                                            >
                                                <option value="web">Web Development</option>
                                                <option value="social_media">Social Media</option>
                                                <option value="design">Design / Branding</option>
                                            </select>
                                         </div>
                                     </div>

                                     <div>
                                         <label className="text-[10px] text-gray-500 block mb-1">Slug (URL Path)</label>
                                         <div className="relative">
                                             <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                                             <input 
                                                value={project.slug || ''}
                                                onChange={(e) => handleUpdateProject(project.id, 'slug', e.target.value)}
                                                className="w-full bg-[#0A0F1C] border border-white/10 rounded pl-7 pr-2 py-1.5 text-xs text-gray-300 font-mono"
                                             />
                                         </div>
                                     </div>
                                 </div>

                                 {/* Right Column: Content */}
                                 <div className="space-y-4">
                                     <div className="grid grid-cols-2 gap-4">
                                         <div>
                                             <label className="text-[10px] text-gray-500 block mb-1">Category (EN)</label>
                                             <input 
                                                value={project.category_en || ''}
                                                onChange={(e) => handleUpdateProject(project.id, 'category_en', e.target.value)}
                                                className="w-full bg-[#0A0F1C] border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                                             />
                                         </div>
                                         <div>
                                             <label className="text-[10px] text-gray-500 block mb-1">Category (KA)</label>
                                             <input 
                                                value={project.category_ka || ''}
                                                onChange={(e) => handleUpdateProject(project.id, 'category_ka', e.target.value)}
                                                className="w-full bg-[#0A0F1C] border border-white/10 rounded px-2 py-1.5 text-xs text-white font-bpg-glaho"
                                             />
                                         </div>
                                     </div>

                                     <div className="grid grid-cols-1 gap-4">
                                         <div>
                                             <label className="text-[10px] text-gray-500 block mb-1">Title (EN)</label>
                                             <input 
                                                value={project.title_en || ''}
                                                onChange={(e) => handleUpdateProject(project.id, 'title_en', e.target.value)}
                                                className="w-full bg-[#0A0F1C] border border-white/10 rounded px-2 py-1.5 text-sm text-white font-bold"
                                             />
                                         </div>
                                         <div>
                                             <label className="text-[10px] text-gray-500 block mb-1">Title (KA)</label>
                                             <input 
                                                value={project.title_ka || ''}
                                                onChange={(e) => handleUpdateProject(project.id, 'title_ka', e.target.value)}
                                                className="w-full bg-[#0A0F1C] border border-white/10 rounded px-2 py-1.5 text-sm text-white font-bold font-bpg-glaho"
                                             />
                                         </div>
                                     </div>

                                     <div className="grid grid-cols-1 gap-4">
                                         <div>
                                             <label className="text-[10px] text-gray-500 block mb-1">Description (EN)</label>
                                             <textarea 
                                                rows={3}
                                                value={project.description_en || ''}
                                                onChange={(e) => handleUpdateProject(project.id, 'description_en', e.target.value)}
                                                className="w-full bg-[#0A0F1C] border border-white/10 rounded px-2 py-1.5 text-xs text-gray-300 resize-none"
                                             />
                                         </div>
                                         <div>
                                             <label className="text-[10px] text-gray-500 block mb-1">Description (KA)</label>
                                             <textarea 
                                                rows={3}
                                                value={project.description_ka || ''}
                                                onChange={(e) => handleUpdateProject(project.id, 'description_ka', e.target.value)}
                                                className="w-full bg-[#0A0F1C] border border-white/10 rounded px-2 py-1.5 text-xs text-gray-300 resize-none font-bpg-glaho"
                                             />
                                         </div>
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="flex justify-end">
                                 <Button size="sm" onClick={() => setEditingProject(null)} className="bg-[#5468E7] text-white">Done Editing</Button>
                             </div>
                        </div>
                    )}
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default PortfolioPageTab;