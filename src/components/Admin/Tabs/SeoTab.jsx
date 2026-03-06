import React, { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2, Globe, FileText, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SeoTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    global_seo: {},
    per_page_seo: [],
    homepage_seo_content: { internal_links: [] }
  });

  useEffect(() => {
    fetchSeoSettings();
  }, []);

  const fetchSeoSettings = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('seo_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (result) {
        setData({
            id: result.id,
            global_seo: result.global_seo || {},
            per_page_seo: Array.isArray(result.per_page_seo) ? result.per_page_seo : [],
            homepage_seo_content: {
                ...result.homepage_seo_content,
                internal_links: result.homepage_seo_content?.internal_links || []
            }
        });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load SEO settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('seo_settings')
        .upsert({
            id: data.id, // Will insert if undefined (but we fetched it), or update
            global_seo: data.global_seo,
            per_page_seo: data.per_page_seo,
            homepage_seo_content: data.homepage_seo_content,
            updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast({ title: 'Success', description: 'SEO settings saved successfully.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
    }
  };

  const updateGlobal = (field, value) => {
    setData(prev => ({ ...prev, global_seo: { ...prev.global_seo, [field]: value } }));
  };

  const updateHomepageContent = (field, value) => {
    setData(prev => ({ ...prev, homepage_seo_content: { ...prev.homepage_seo_content, [field]: value } }));
  };

  // Repeater Logic for Per Page
  const addPage = () => {
    setData(prev => ({
        ...prev,
        per_page_seo: [...prev.per_page_seo, { slug: '', meta_title: '', meta_description: '', h1_title: '' }]
    }));
  };

  const removePage = (index) => {
    const newPages = [...data.per_page_seo];
    newPages.splice(index, 1);
    setData(prev => ({ ...prev, per_page_seo: newPages }));
  };

  const updatePage = (index, field, value) => {
    const newPages = [...data.per_page_seo];
    newPages[index] = { ...newPages[index], [field]: value };
    setData(prev => ({ ...prev, per_page_seo: newPages }));
  };

  // Repeater Logic for Internal Links
  const addLink = () => {
    const currentLinks = data.homepage_seo_content.internal_links || [];
    updateHomepageContent('internal_links', [...currentLinks, { label: '', url: '' }]);
  };

  const removeLink = (index) => {
    const currentLinks = [...(data.homepage_seo_content.internal_links || [])];
    currentLinks.splice(index, 1);
    updateHomepageContent('internal_links', currentLinks);
  };

  const updateLink = (index, field, value) => {
    const currentLinks = [...(data.homepage_seo_content.internal_links || [])];
    currentLinks[index] = { ...currentLinks[index], [field]: value };
    updateHomepageContent('internal_links', currentLinks);
  };

  if (loading) return <div className="text-white p-8 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading SEO Settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#0D1126] p-4 rounded-lg border border-[#5468E7]/30">
        <div className="flex items-center gap-3">
             <Globe className="w-6 h-6 text-[#5468E7]" />
             <h2 className="text-xl font-bold text-white">SEO Management</h2>
        </div>
        <Button onClick={handleSave} className="bg-[#5468E7] hover:bg-[#4353b8] text-white">
            <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="bg-[#0A0F1C] border border-white/10 w-full justify-start h-auto flex-wrap p-1 mb-6">
            <TabsTrigger value="global">Global Settings</TabsTrigger>
            <TabsTrigger value="pages">Per-Page SEO</TabsTrigger>
            <TabsTrigger value="homepage">Homepage Content</TabsTrigger>
        </TabsList>

        {/* GLOBAL TAB */}
        <TabsContent value="global" className="space-y-6">
            <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5 space-y-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Default Meta Tags</h3>
                
                <div className="grid gap-6">
                    <div>
                        <div className="flex justify-between mb-2">
                             <label className="text-xs text-gray-500 uppercase font-bold">Default Meta Title</label>
                             <span className={`text-xs ${(data.global_seo.default_meta_title?.length || 0) > 65 ? 'text-red-500' : 'text-green-500'}`}>
                                {data.global_seo.default_meta_title?.length || 0} / 65
                             </span>
                        </div>
                        <input 
                            value={data.global_seo.default_meta_title || ''}
                            onChange={(e) => updateGlobal('default_meta_title', e.target.value)}
                            className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#5468E7] outline-none"
                            placeholder="e.g. Digital Agency - Web Design & Marketing"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                             <label className="text-xs text-gray-500 uppercase font-bold">Default Meta Description</label>
                             <span className={`text-xs ${(data.global_seo.default_meta_description?.length || 0) > 160 ? 'text-red-500' : 'text-green-500'}`}>
                                {data.global_seo.default_meta_description?.length || 0} / 160
                             </span>
                        </div>
                        <textarea 
                            value={data.global_seo.default_meta_description || ''}
                            onChange={(e) => updateGlobal('default_meta_description', e.target.value)}
                            rows={3}
                            className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#5468E7] outline-none"
                            placeholder="e.g. We provide top-notch digital services..."
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Default OG Image URL</label>
                        <input 
                            value={data.global_seo.default_og_image || ''}
                            onChange={(e) => updateGlobal('default_og_image', e.target.value)}
                            className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-gray-400 font-mono focus:border-[#5468E7] outline-none"
                            placeholder="https://..."
                        />
                        <p className="text-[10px] text-gray-600 mt-1">URL to the image used when sharing on social media.</p>
                    </div>
                </div>
            </div>
        </TabsContent>

        {/* PER PAGE TAB */}
        <TabsContent value="pages" className="space-y-6">
            <div className="flex justify-end mb-4">
                <Button onClick={addPage} size="sm" className="bg-[#5468E7] text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Page
                </Button>
            </div>
            
            <div className="space-y-4">
                {data.per_page_seo.length === 0 && (
                    <div className="text-center py-10 text-gray-500 bg-[#0A0F1C]/30 border border-white/5 rounded-lg">
                        No pages configured yet. Click "Add Page" to start.
                    </div>
                )}
                
                {data.per_page_seo.map((page, idx) => (
                    <div key={idx} className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5 relative group">
                        <button 
                            onClick={() => removePage(idx)}
                            className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid md:grid-cols-2 gap-6">
                             <div className="md:col-span-2">
                                <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Page Slug / URL</label>
                                <input 
                                    value={page.slug || ''}
                                    onChange={(e) => updatePage(idx, 'slug', e.target.value)}
                                    className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:border-[#5468E7]"
                                    placeholder="/services"
                                />
                             </div>
                             
                             <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Meta Title</label>
                                    <span className={`text-[10px] ${(page.meta_title?.length || 0) > 65 ? 'text-red-500' : 'text-gray-500'}`}>{page.meta_title?.length || 0}/65</span>
                                </div>
                                <input 
                                    value={page.meta_title || ''}
                                    onChange={(e) => updatePage(idx, 'meta_title', e.target.value)}
                                    className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#5468E7]"
                                />
                             </div>
                             
                             <div>
                                <label className="text-xs text-gray-500 uppercase font-bold block mb-1">H1 Title (Hero)</label>
                                <input 
                                    value={page.h1_title || ''}
                                    onChange={(e) => updatePage(idx, 'h1_title', e.target.value)}
                                    className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#5468E7]"
                                    placeholder="Main Page Heading"
                                />
                             </div>

                             <div className="md:col-span-2">
                                <div className="flex justify-between mb-1">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Meta Description</label>
                                    <span className={`text-[10px] ${(page.meta_description?.length || 0) > 160 ? 'text-red-500' : 'text-gray-500'}`}>{page.meta_description?.length || 0}/160</span>
                                </div>
                                <textarea 
                                    value={page.meta_description || ''}
                                    onChange={(e) => updatePage(idx, 'meta_description', e.target.value)}
                                    rows={2}
                                    className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#5468E7]"
                                />
                             </div>
                             
                             <div>
                                <label className="text-xs text-gray-500 uppercase font-bold block mb-1">OG Image URL</label>
                                <input 
                                    value={page.og_image || ''}
                                    onChange={(e) => updatePage(idx, 'og_image', e.target.value)}
                                    className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-xs text-gray-400 font-mono focus:border-[#5468E7]"
                                />
                             </div>

                             <div>
                                <label className="text-xs text-gray-500 uppercase font-bold block mb-1">SEO Keywords (Reference)</label>
                                <input 
                                    value={page.keywords || ''}
                                    onChange={(e) => updatePage(idx, 'keywords', e.target.value)}
                                    className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-xs text-gray-400 focus:border-[#5468E7]"
                                    placeholder="comma, separated, keys"
                                />
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </TabsContent>

        {/* HOMEPAGE CONTENT TAB */}
        <TabsContent value="homepage" className="space-y-6">
             <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-[#5468E7]" />
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">SEO Text Blocks</h3>
                </div>
                
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Main Text Block (HTML Supported)</label>
                    <textarea 
                        value={data.homepage_seo_content.main_text_block || ''}
                        onChange={(e) => updateHomepageContent('main_text_block', e.target.value)}
                        rows={6}
                        className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:border-[#5468E7]"
                        placeholder="<p>Write your main SEO content here...</p>"
                    />
                    <p className="text-[10px] text-gray-600 mt-1">Approx 400-600 words recommended. Use &lt;h2&gt;, &lt;p&gt; tags.</p>
                </div>

                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Additional Text Block (HTML Supported)</label>
                    <textarea 
                        value={data.homepage_seo_content.additional_text_block || ''}
                        onChange={(e) => updateHomepageContent('additional_text_block', e.target.value)}
                        rows={4}
                        className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:border-[#5468E7]"
                    />
                    <p className="text-[10px] text-gray-600 mt-1">Approx 200-300 words recommended.</p>
                </div>
             </div>

             <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5 space-y-4">
                 <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-[#5468E7]" />
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Internal Links</h3>
                    </div>
                    <Button onClick={addLink} size="sm" variant="ghost" className="text-[#5468E7] bg-[#5468E7]/10">
                        <Plus className="w-3 h-3 mr-1" /> Add Link
                    </Button>
                </div>

                <div className="space-y-3">
                    {(!data.homepage_seo_content.internal_links || data.homepage_seo_content.internal_links.length === 0) && (
                        <p className="text-sm text-gray-500 italic text-center">No internal links added.</p>
                    )}
                    
                    {data.homepage_seo_content.internal_links?.map((link, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-[#0D1126] p-2 rounded border border-white/5">
                            <input 
                                value={link.label || ''}
                                onChange={(e) => updateLink(idx, 'label', e.target.value)}
                                className="flex-1 bg-[#0A0F1C] border border-white/10 rounded px-3 py-1.5 text-xs text-white"
                                placeholder="Link Label"
                            />
                            <input 
                                value={link.url || ''}
                                onChange={(e) => updateLink(idx, 'url', e.target.value)}
                                className="flex-1 bg-[#0A0F1C] border border-white/10 rounded px-3 py-1.5 text-xs text-gray-300 font-mono"
                                placeholder="/url-path"
                            />
                            <button onClick={() => removeLink(idx)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
             </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeoTab;