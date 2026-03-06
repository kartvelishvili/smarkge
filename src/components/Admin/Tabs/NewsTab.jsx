import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Calendar, Save, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const NewsTab = () => {
  const { toast } = useToast();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Edit/Create State
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title_en: '', title_ka: '',
    excerpt_en: '', excerpt_ka: '',
    content_en: '', content_ka: '',
    category: 'Technology',
    author: '',
    featured_image_url: '',
    slug: '',
    publish_date: new Date().toISOString().split('T')[0],
    status: 'draft' // 'published' or 'draft'
  });

  const categories = ['Technology', 'AI', 'Business', 'Innovation', 'Design', 'Marketing', 'Healthcare', 'Security', 'Economy', 'Ethics'];

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch news.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    
    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
      setNews(news.filter(n => n.id !== id));
      toast({ title: 'Success', description: 'Article deleted.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete.' });
    }
  };

  const handleEdit = (post) => {
    setCurrentPost(post);
    setFormData({
      title_en: post.title_en || '',
      title_ka: post.title_ka || '',
      excerpt_en: post.excerpt_en || '',
      excerpt_ka: post.excerpt_ka || '',
      content_en: post.content_en || '',
      content_ka: post.content_ka || '',
      category: post.category || 'Technology',
      author: post.author || '',
      featured_image_url: post.featured_image_url || '',
      slug: post.slug || '',
      publish_date: post.publish_date ? new Date(post.publish_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: post.status || 'draft'
    });
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentPost(null);
    setFormData({
      title_en: '', title_ka: '',
      excerpt_en: '', excerpt_ka: '',
      content_en: '', content_ka: '',
      category: 'Technology',
      author: '',
      featured_image_url: '',
      slug: '',
      publish_date: new Date().toISOString().split('T')[0],
      status: 'draft'
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.title_en || !formData.slug) {
        toast({ variant: 'destructive', title: 'Error', description: 'Title EN and Slug are required.' });
        return;
    }

    try {
      const payload = { ...formData, updated_at: new Date().toISOString() };
      
      let error;
      if (currentPost) {
        // Update
        const { error: updateError } = await supabase.from('news').update(payload).eq('id', currentPost.id);
        error = updateError;
      } else {
        // Create
        const { error: insertError } = await supabase.from('news').insert([{ ...payload, created_at: new Date().toISOString() }]);
        error = insertError;
      }

      if (error) throw error;
      
      toast({ title: 'Success', description: `Article ${currentPost ? 'updated' : 'created'} successfully.` });
      setIsEditing(false);
      fetchNews();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save article.' });
    }
  };

  const generateSlug = () => {
    if (formData.title_en) {
      const slug = formData.title_en
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData({ ...formData, slug });
    }
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = (item.title_en?.toLowerCase().includes(search.toLowerCase()) || item.title_ka?.includes(search));
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isEditing) {
    return (
      <div className="bg-[#0D1126] border border-[#5468E7]/30 rounded-xl p-6 space-y-6">
         <div className="flex justify-between items-center border-b border-white/10 pb-4">
             <h2 className="text-xl font-bold text-white">{currentPost ? 'Edit Article' : 'Create New Article'}</h2>
             <div className="flex gap-2">
                 <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-gray-400">Cancel</Button>
                 <Button onClick={handleSave} className="bg-[#5468E7] hover:bg-[#4353b8] text-white"><Save className="w-4 h-4 mr-2" /> Save Article</Button>
             </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* English Column */}
             <div className="space-y-4">
                <h3 className="text-[#5468E7] font-bold uppercase text-sm tracking-wider">English Content</h3>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Title (EN) *</label>
                    <input 
                        className="w-full bg-[#0A0F1C] border border-white/10 rounded p-2 text-white text-sm"
                        value={formData.title_en}
                        onChange={e => setFormData({...formData, title_en: e.target.value})}
                        onBlur={() => !formData.slug && generateSlug()}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Excerpt (EN)</label>
                    <textarea 
                        className="w-full bg-[#0A0F1C] border border-white/10 rounded p-2 text-white text-sm h-24"
                        value={formData.excerpt_en}
                        onChange={e => setFormData({...formData, excerpt_en: e.target.value})}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Content (EN - HTML Supported)</label>
                    <textarea 
                        className="w-full bg-[#0A0F1C] border border-white/10 rounded p-2 text-white text-sm h-64 font-mono"
                        value={formData.content_en}
                        onChange={e => setFormData({...formData, content_en: e.target.value})}
                    />
                </div>
             </div>

             {/* Georgian Column */}
             <div className="space-y-4">
                <h3 className="text-[#5468E7] font-bold uppercase text-sm tracking-wider">Georgian Content</h3>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Title (KA)</label>
                    <input 
                        className="w-full bg-[#0A0F1C] border border-white/10 rounded p-2 text-white text-sm font-bpg-glaho"
                        value={formData.title_ka}
                        onChange={e => setFormData({...formData, title_ka: e.target.value})}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Excerpt (KA)</label>
                    <textarea 
                        className="w-full bg-[#0A0F1C] border border-white/10 rounded p-2 text-white text-sm h-24 font-bpg-glaho"
                        value={formData.excerpt_ka}
                        onChange={e => setFormData({...formData, excerpt_ka: e.target.value})}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Content (KA - HTML Supported)</label>
                    <textarea 
                        className="w-full bg-[#0A0F1C] border border-white/10 rounded p-2 text-white text-sm h-64 font-bpg-glaho font-mono"
                        value={formData.content_ka}
                        onChange={e => setFormData({...formData, content_ka: e.target.value})}
                    />
                </div>
             </div>
         </div>

         {/* Meta Data */}
         <div className="border-t border-white/10 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
                 <label className="text-xs text-gray-400 block mb-1">Slug (URL) *</label>
                 <div className="flex gap-2">
                    <input 
                        className="w-full bg-[#0A0F1C] border border-white/10 rounded p-2 text-gray-300 text-sm font-mono"
                        value={formData.slug}
                        onChange={e => setFormData({...formData, slug: e.target.value})}
                    />
                    <Button size="sm" variant="outline" onClick={generateSlug} className="text-xs">Auto</Button>
                 </div>
             </div>
             
             <div>
                 <label className="text-xs text-gray-400 block mb-1">Category</label>
                 <select 
                    className="w-full bg-[#0A0F1C] border border-white/10 rounded p-2 text-white text-sm"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                 >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                 </select>
             </div>

             <div>
                 <label className="text-xs text-gray-400 block mb-1">Author Name</label>
                 <input 
                    className="w-full bg-[#0A0F1C] border border-white/10 rounded p-2 text-white text-sm"
                    value={formData.author}
                    onChange={e => setFormData({...formData, author: e.target.value})}
                 />
             </div>

             <div className="md:col-span-2">
                 <label className="text-xs text-gray-400 block mb-1">Featured Image URL</label>
                 <div className="flex gap-2 items-center">
                    <input 
                        className="w-full bg-[#0A0F1C] border border-white/10 rounded p-2 text-white text-sm font-mono"
                        value={formData.featured_image_url}
                        onChange={e => setFormData({...formData, featured_image_url: e.target.value})}
                        placeholder="https://..."
                    />
                    {formData.featured_image_url && (
                        <img src={formData.featured_image_url} className="h-10 w-10 object-cover rounded border border-white/20" alt="Preview" />
                    )}
                 </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Publish Date</label>
                    <input 
                        type="date"
                        className="w-full bg-[#0A0F1C] border border-white/10 rounded p-2 text-white text-sm"
                        value={formData.publish_date}
                        onChange={e => setFormData({...formData, publish_date: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Status</label>
                    <select 
                        className="w-full bg-[#0A0F1C] border border-white/10 rounded p-2 text-white text-sm"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                 </div>
             </div>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1126] border border-[#5468E7]/30 rounded-xl p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Edit className="w-5 h-5 text-[#5468E7]" />
            News Management
        </h2>
        <Button onClick={handleCreate} className="bg-[#5468E7] hover:bg-[#4353b8] text-white">
            <Plus className="w-4 h-4 mr-2" /> Add News Article
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
                placeholder="Search news..." 
                className="w-full bg-[#0A0F1C] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:border-[#5468E7] outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <select 
            className="bg-[#0A0F1C] border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
        >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm text-left">
            <thead className="bg-[#0A0F1C] text-gray-400 uppercase text-xs font-bold">
                <tr>
                    <th className="px-6 py-4">Article</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {loading ? (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading news...</td></tr>
                ) : filteredNews.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">No news articles found.</td></tr>
                ) : (
                    filteredNews.map(item => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    {item.featured_image_url && (
                                        <img src={item.featured_image_url} alt="" className="w-10 h-10 rounded object-cover" />
                                    )}
                                    <div>
                                        <div className="font-medium text-white line-clamp-1">{item.title_en || 'Untitled'}</div>
                                        <div className="text-xs text-gray-500 line-clamp-1 font-bpg-glaho">{item.title_ka}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                                <span className="px-2 py-1 rounded bg-white/10 text-xs">{item.category}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-300">{item.author}</td>
                            <td className="px-6 py-4 text-gray-400">{new Date(item.publish_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => handleEdit(item)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewsTab;