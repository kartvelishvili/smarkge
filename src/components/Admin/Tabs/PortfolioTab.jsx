import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, LayoutGrid, UploadCloud, Image as ImageIcon, Copy, ExternalLink, Loader2, RefreshCw, Eye, GripVertical, Languages, Sparkles, CheckCircle2, Quote, EyeOff, Facebook, Globe, Instagram, Youtube, Linkedin, Music2, Grid, Rows, Columns, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/customSupabaseClient';
import { Reorder, useDragControls } from 'framer-motion';

const LAYOUT_OPTIONS = [
  { value: 'layout_a', label: 'Standard (Layout A)' },
  { value: 'layout_b', label: 'Split View (Layout B)' },
  { value: 'layout_c', label: 'Visual Focus (Layout C)' },
  { value: 'layout_4', label: 'Storytelling (Layout 4)' },
  { value: 'layout_5', label: 'Gallery Focus (Layout 5)' },
  { value: 'layout_6', label: 'Modern Grid (Layout 6)' },
];

const GALLERY_LAYOUTS = [
    { value: 'grid_2', label: 'Grid (2 Columns)', icon: Grid },
    { value: 'grid_3', label: 'Grid (3 Columns)', icon: LayoutGrid },
    { value: 'masonry', label: 'Masonry Wall', icon: Rows },
    { value: 'carousel', label: 'Horizontal Slider', icon: Columns },
];

const PortfolioProjectItem = ({ 
    project, 
    index, 
    totalCount,
    isExpanded, 
    toggleExpand, 
    handlers, 
    state 
}) => {
    const dragControls = useDragControls();
    const { 
        handleDeleteProject, 
        handleDuplicateProject, 
        moveProject,
        updateProjectLocal,
        sanitizeSlug,
        handleImageUpload,
        isUploading,
        handleGalleryUpload,
        translateText,
        translatingId,
        handleAddTestimonial,
        handleDeleteTestimonial,
        updateNestedProjectLocal,
        handleTestimonialLogoUpload,
        handleTabFileUpload,
        updateSocialMediaLink,
        handleSaveProject,
        setEditingId,
        availableIndustries
    } = handlers;

    return (
        <Reorder.Item
            value={project}
            id={project.id}
            dragListener={false}
            dragControls={dragControls}
            className={`bg-[#0D1126] rounded-lg transition-all border mb-4 ${isExpanded ? 'border-[#5468E7] shadow-lg shadow-[#5468E7]/10' : 'border-white/5 hover:border-white/20'}`}
        >
            {/* Collapsed Header */}
            <div className="p-4 flex items-center gap-4">
                <div 
                    className="cursor-move p-2 hover:bg-white/5 rounded text-gray-600 hover:text-white transition-colors"
                    onPointerDown={(e) => dragControls.start(e)}
                >
                    <GripVertical className="w-5 h-5" />
                </div>
                
                {/* Thumbnail */}
                <div 
                    className="w-16 h-16 rounded bg-[#0A0F1C] border border-white/10 flex-shrink-0 overflow-hidden relative cursor-pointer"
                    onClick={() => toggleExpand(project.id)}
                >
                    {project.image_url ? (
                        <img src={project.image_url} alt="thumb" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-full h-full p-4 text-gray-700" />
                    )}
                </div>

                {/* Basic Info */}
                <div 
                    className="flex-grow min-w-0 cursor-pointer"
                    onClick={() => toggleExpand(project.id)}
                >
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-medium truncate">{project.title_en || 'Untitled Project'}</h3>
                        {project.visible ? (
                            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20">Public</span>
                        ) : (
                            <span className="text-[10px] bg-gray-500/10 text-gray-400 px-2 py-0.5 rounded border border-gray-500/20">Hidden</span>
                        )}
                        <span className="text-[10px] text-gray-600 font-mono">#{index + 1}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{project.slug}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col mr-2 border-r border-white/10 pr-2">
                        <button 
                            disabled={index === 0}
                            onClick={(e) => { e.stopPropagation(); moveProject(index, 'up'); }}
                            className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:hover:text-gray-500"
                        >
                            <ArrowUp className="w-3 h-3" />
                        </button>
                        <button 
                            disabled={index === totalCount - 1}
                            onClick={(e) => { e.stopPropagation(); moveProject(index, 'down'); }}
                            className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:hover:text-gray-500"
                        >
                            <ArrowDown className="w-3 h-3" />
                        </button>
                    </div>

                    <a 
                        href={`/portfolio/${project.slug}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-[#5468E7] hover:bg-[#5468E7]/10 rounded transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        title="View Live Page"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                    <button 
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                        onClick={(e) => handleDuplicateProject(project, e)}
                        title="Duplicate"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                    <button 
                        className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Expanded Edit Form */}
            {isExpanded && (
                <div className="border-t border-white/10 p-6 animate-in slide-in-from-top-2">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="bg-[#0A0F1C] border border-white/10 w-full justify-start h-auto flex-wrap p-1 mb-6">
                            <TabsTrigger value="general" className="data-[state=active]:bg-[#5468E7]">General</TabsTrigger>
                            <TabsTrigger value="media" className="data-[state=active]:bg-[#5468E7]">Media</TabsTrigger>
                            <TabsTrigger value="gallery" className="data-[state=active]:bg-[#5468E7] flex items-center gap-2"><ImageIcon className="w-3 h-3"/> Gallery</TabsTrigger>
                            <TabsTrigger value="content" className="data-[state=active]:bg-[#5468E7]">Content</TabsTrigger>
                            <TabsTrigger value="features" className="data-[state=active]:bg-[#5468E7]">Features</TabsTrigger>
                            <TabsTrigger value="screenshots" className="data-[state=active]:bg-[#5468E7]">Screenshots</TabsTrigger>
                            <TabsTrigger value="page" className="data-[state=active]:bg-[#5468E7] flex items-center gap-2"><Facebook className="w-3 h-3" /> Social Page</TabsTrigger>
                            <TabsTrigger value="settings" className="data-[state=active]:bg-[#5468E7]">Settings</TabsTrigger>
                        </TabsList>

                        {/* TAB: GENERAL */}
                        <TabsContent value="general" className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 md:col-span-1 space-y-4">
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Project Title (EN)</label>
                                        <input 
                                            value={project.title_en || ''} 
                                            onChange={(e) => updateProjectLocal(project.id, 'title_en', e.target.value)}
                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#5468E7] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Project Title (KA)</label>
                                        <input 
                                            value={project.title_ka || ''} 
                                            onChange={(e) => updateProjectLocal(project.id, 'title_ka', e.target.value)}
                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-sm text-white font-bpg-glaho focus:border-[#5468E7] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">URL Slug (Unique)</label>
                                        <div className="flex gap-2">
                                            <input 
                                                value={project.slug || ''} 
                                                onChange={(e) => updateProjectLocal(project.id, 'slug', sanitizeSlug(e.target.value))}
                                                className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 font-mono focus:border-[#5468E7] outline-none"
                                            />
                                            <Button size="icon" variant="ghost" className="border border-white/10" onClick={() => updateProjectLocal(project.id, 'slug', sanitizeSlug(project.title_en))}>
                                                <RefreshCw className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2 md:col-span-1 space-y-4">
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Category (EN)</label>
                                        <input 
                                            value={project.category_en || ''} 
                                            onChange={(e) => updateProjectLocal(project.id, 'category_en', e.target.value)}
                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#5468E7] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Category (KA)</label>
                                        <input 
                                            value={project.category_ka || ''} 
                                            onChange={(e) => updateProjectLocal(project.id, 'category_ka', e.target.value)}
                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-sm text-white font-bpg-glaho focus:border-[#5468E7] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Project Type (Tag)</label>
                                        <select 
                                            value={project.project_type || 'web'}
                                            onChange={(e) => updateProjectLocal(project.id, 'project_type', e.target.value)}
                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:border-[#5468E7] outline-none"
                                        >
                                            <option value="web">Web Development</option>
                                            <option value="social_media">Social Media</option>
                                            <option value="branding">Branding & Design</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB: MEDIA (Main Image & Logo only) */}
                        <TabsContent value="media" className="space-y-6">
                            {/* Main Image */}
                            <div className="p-4 bg-[#0A0F1C] rounded border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-white">Main Project Image</h4>
                                    <label className="cursor-pointer bg-[#5468E7] text-white px-3 py-1.5 rounded text-xs flex items-center gap-2 hover:bg-[#4353b8]">
                                        {isUploading(project.id, 'main_image') ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                                        Upload Image
                                        <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(project.id, e.target.files[0], 'main_image', 'image_url')} />
                                    </label>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-32 h-20 bg-black rounded border border-white/10 overflow-hidden relative group">
                                        {project.image_url ? <img src={project.image_url} className="w-full h-full object-cover" alt="main" /> : <div className="flex items-center justify-center h-full text-gray-600 text-xs">No Image</div>}
                                    </div>
                                    <input 
                                        value={project.image_url || ''}
                                        onChange={(e) => updateProjectLocal(project.id, 'image_url', e.target.value)}
                                        className="flex-grow bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-xs text-gray-400 font-mono"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            {/* Logo */}
                            <div className="p-4 bg-[#0A0F1C] rounded border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-white">Project Logo</h4>
                                    <label className="cursor-pointer bg-[#5468E7] text-white px-3 py-1.5 rounded text-xs flex items-center gap-2 hover:bg-[#4353b8]">
                                        {isUploading(project.id, 'logo') ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                                        Upload Logo
                                        <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(project.id, e.target.files[0], 'logo', 'logo_url')} />
                                    </label>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-16 h-16 rounded border border-white/10 flex items-center justify-center relative overflow-hidden" style={{backgroundColor: project.logo_border_color || '#ffffff'}}>
                                        {project.logo_url && <img src={project.logo_url} className="w-10 h-10 object-contain" alt="logo" />}
                                    </div>
                                    <div className="flex-grow space-y-2">
                                        <input 
                                            value={project.logo_url || ''}
                                            onChange={(e) => updateProjectLocal(project.id, 'logo_url', e.target.value)}
                                            className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-xs text-gray-400 font-mono"
                                            placeholder="Logo URL..."
                                        />
                                        <div className="flex items-center gap-2">
                                            <label className="text-[10px] text-gray-500 uppercase">Logo Background</label>
                                            <input 
                                                type="color"
                                                value={project.logo_border_color || '#ffffff'}
                                                onChange={(e) => updateProjectLocal(project.id, 'logo_border_color', e.target.value)}
                                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB: GALLERY (New Tab) */}
                        <TabsContent value="gallery" className="space-y-6">
                            <div className="p-4 bg-[#0A0F1C] rounded border border-white/5">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-white">Project Gallery</h4>
                                        <p className="text-xs text-gray-500 mt-1">Manage images and choose display layout.</p>
                                    </div>
                                    <div className="flex gap-2">
                                            <label className="cursor-pointer bg-[#5468E7] text-white px-3 py-1.5 rounded text-xs flex items-center gap-2 hover:bg-[#4353b8]">
                                            {isUploading(project.id, 'gallery') ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                                            Upload Images
                                            <input type="file" hidden multiple accept="image/*" onChange={(e) => handleGalleryUpload(project.id, e.target.files)} />
                                        </label>
                                    </div>
                                </div>

                                {/* Layout Selection */}
                                <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {GALLERY_LAYOUTS.map(layout => {
                                        const Icon = layout.icon;
                                        return (
                                            <button
                                                key={layout.value}
                                                onClick={() => updateProjectLocal(project.id, 'gallery_layout', layout.value)}
                                                className={`p-3 rounded border flex flex-col items-center gap-2 transition-all ${
                                                    project.gallery_layout === layout.value 
                                                    ? 'bg-[#5468E7]/20 border-[#5468E7] text-white' 
                                                    : 'bg-[#0D1126] border-white/10 text-gray-400 hover:border-white/30'
                                                }`}
                                            >
                                                <Icon className="w-6 h-6" />
                                                <span className="text-[10px] font-medium">{layout.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                                
                                {/* Images Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {Array.isArray(project.gallery_images) && project.gallery_images.map((img, idx) => (
                                        <div key={idx} className="relative group bg-[#0D1126] border border-white/10 rounded overflow-hidden aspect-video">
                                            <img src={img} className="w-full h-full object-cover" alt="" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button 
                                                    onClick={() => {
                                                        const newImgs = project.gallery_images.filter((_, i) => i !== idx);
                                                        updateProjectLocal(project.id, 'gallery_images', newImgs);
                                                    }}
                                                    className="bg-red-500/80 hover:bg-red-500 p-1.5 rounded text-white"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="absolute top-1 left-1 bg-black/50 px-1.5 py-0.5 rounded text-[9px] text-white font-mono opacity-0 group-hover:opacity-100">
                                                #{idx+1}
                                            </div>
                                        </div>
                                    ))}
                                    {(!project.gallery_images || project.gallery_images.length === 0) && (
                                        <div className="col-span-full py-8 text-center text-gray-500 text-xs border border-dashed border-white/10 rounded">
                                            No images in gallery yet. Upload some images to get started.
                                        </div>
                                    )}
                                </div>
                                
                                {/* Manual URL Add */}
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <div className="flex gap-2">
                                        <input 
                                            id={`new-gal-url-${project.id}`}
                                            className="flex-grow bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-xs text-gray-400 font-mono"
                                            placeholder="Or paste image URL here..."
                                        />
                                        <Button size="sm" onClick={() => {
                                            const input = document.getElementById(`new-gal-url-${project.id}`);
                                            if(input.value) {
                                                updateProjectLocal(project.id, 'gallery_images', [...(project.gallery_images || []), input.value]);
                                                input.value = '';
                                            }
                                        }} className="bg-[#0D1126] border border-white/10 hover:bg-white/5 text-xs">
                                            Add URL
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB: CONTENT */}
                        <TabsContent value="content" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Short Description (EN)</label>
                                    <textarea 
                                        rows={4}
                                        value={project.description_en || ''} 
                                        onChange={(e) => updateProjectLocal(project.id, 'description_en', e.target.value)}
                                        className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-xs text-gray-300 focus:border-[#5468E7] outline-none resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Short Description (KA)</label>
                                    <textarea 
                                        rows={4}
                                        value={project.description_ka || ''} 
                                        onChange={(e) => updateProjectLocal(project.id, 'description_ka', e.target.value)}
                                        className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-xs text-gray-300 focus:border-[#5468E7] font-bpg-glaho outline-none resize-none"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Detailed HTML Story (EN) - For Layout 4</label>
                                    <textarea 
                                        rows={8}
                                        value={project.detailed_description_en || ''}
                                        onChange={(e) => updateProjectLocal(project.id, 'detailed_description_en', e.target.value)}
                                        className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-xs text-gray-300 font-mono focus:border-[#5468E7] outline-none"
                                        placeholder="<p>Write your story here...</p>"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Detailed HTML Story (KA) - For Layout 4</label>
                                    <textarea 
                                        rows={8}
                                        value={project.detailed_description_ka || ''}
                                        onChange={(e) => updateProjectLocal(project.id, 'detailed_description_ka', e.target.value)}
                                        className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-xs text-gray-300 font-mono focus:border-[#5468E7] outline-none"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB: FEATURES (Features, Testimonials, Facts) */}
                        <TabsContent value="features" className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                
                                {/* Project Features (Bilingual) */}
                                <div className="bg-[#0A0F1C] p-4 rounded border border-white/5 md:col-span-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-[#5468E7]" /> Project Features
                                        </h4>
                                        <Button size="sm" variant="ghost" className="h-6 text-[#5468E7] bg-[#5468E7]/10 text-xs" onClick={() => {
                                            const currentFeatures = Array.isArray(project.project_features) ? project.project_features : [];
                                            updateProjectLocal(project.id, 'project_features', [...currentFeatures, { title_en: '', title_ka: '' }]);
                                        }}>
                                            <Plus className="w-3 h-3 mr-1" /> Add Feature
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {(!project.project_features || project.project_features.length === 0) && (
                                            <p className="text-xs text-gray-500 italic text-center py-2">No features added yet.</p>
                                        )}
                                        {Array.isArray(project.project_features) && project.project_features.map((feature, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-3 items-center bg-[#0D1126] p-2 rounded border border-white/5">
                                                <div className="col-span-12 md:col-span-5">
                                                    <label className="text-[10px] text-gray-500 uppercase block mb-1">Feature Title (KA)</label>
                                                    <input 
                                                        className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-xs text-white font-bpg-glaho" 
                                                        placeholder="მაგ: მობილური აპლიკაცია"
                                                        value={feature.title_ka || ''}
                                                        onChange={(e) => {
                                                            const newFeatures = [...project.project_features];
                                                            newFeatures[idx].title_ka = e.target.value;
                                                            updateProjectLocal(project.id, 'project_features', newFeatures);
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-span-12 md:col-span-5 relative">
                                                        <label className="text-[10px] text-gray-500 uppercase block mb-1">Feature Title (EN)</label>
                                                        <div className="flex gap-2">
                                                        <input 
                                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-xs text-white" 
                                                            placeholder="e.g. Mobile App Integration"
                                                            value={feature.title_en || ''}
                                                            onChange={(e) => {
                                                                const newFeatures = [...project.project_features];
                                                                newFeatures[idx].title_en = e.target.value;
                                                                updateProjectLocal(project.id, 'project_features', newFeatures);
                                                            }}
                                                        />
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="border border-white/10 h-[34px] w-[34px] flex-shrink-0"
                                                            title="Translate from Georgian (AI)"
                                                            onClick={() => translateText(feature.title_ka, idx, project.id, 'feature')}
                                                            disabled={translatingId === `${project.id}-feature-${idx}`}
                                                        >
                                                            {translatingId === `${project.id}-feature-${idx}` ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-[#5468E7]" />
                                                            ) : (
                                                                <Languages className="w-4 h-4 text-gray-400 hover:text-white" />
                                                            )}
                                                        </Button>
                                                        </div>
                                                </div>
                                                <div className="col-span-12 md:col-span-2 flex justify-end">
                                                    <button 
                                                        onClick={() => {
                                                            const newFeatures = project.project_features.filter((_, i) => i !== idx);
                                                            updateProjectLocal(project.id, 'project_features', newFeatures);
                                                        }} 
                                                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors flex items-center gap-1 text-xs"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Key Facts (Bilingual) */}
                                <div className="bg-[#0A0F1C] p-4 rounded border border-white/5 md:col-span-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-[#5468E7]" /> Key Facts
                                        </h4>
                                        <Button size="sm" variant="ghost" className="h-6 text-[#5468E7] bg-[#5468E7]/10 text-xs" onClick={() => {
                                            const currentFacts = Array.isArray(project.project_facts) ? project.project_facts : [];
                                            updateProjectLocal(project.id, 'project_facts', [...currentFacts, { label_en: '', value_en: '', label_ka: '', value_ka: '' }]);
                                        }}>
                                            <Plus className="w-3 h-3 mr-1" /> Add Fact
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {(!project.project_facts || project.project_facts.length === 0) && (
                                            <p className="text-xs text-gray-500 italic text-center py-2">No key facts added yet.</p>
                                        )}
                                        {Array.isArray(project.project_facts) && project.project_facts.map((fact, idx) => (
                                            <div key={idx} className="bg-[#0D1126] p-3 rounded border border-white/5">
                                                <div className="grid grid-cols-12 gap-4">
                                                    {/* Georgian Section */}
                                                    <div className="col-span-12 md:col-span-5 space-y-2">
                                                        <div>
                                                            <label className="text-[10px] text-gray-500 uppercase block mb-1">Key Fact Title (KA)</label>
                                                            <input 
                                                                className="w-full bg-[#0A0F1C] border border-white/10 rounded px-2 py-1.5 text-xs text-white font-bpg-glaho"
                                                                placeholder="მაგ: კლიენტი"
                                                                value={fact.label_ka || ''}
                                                                onChange={(e) => {
                                                                    const newFacts = [...project.project_facts];
                                                                    newFacts[idx].label_ka = e.target.value;
                                                                    updateProjectLocal(project.id, 'project_facts', newFacts);
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-gray-500 uppercase block mb-1">Key Fact Value (KA)</label>
                                                            <input 
                                                                className="w-full bg-[#0A0F1C] border border-white/10 rounded px-2 py-1.5 text-xs text-white font-bpg-glaho"
                                                                placeholder="მაგ: თიბისი ბანკი"
                                                                value={fact.value_ka || ''}
                                                                onChange={(e) => {
                                                                    const newFacts = [...project.project_facts];
                                                                    newFacts[idx].value_ka = e.target.value;
                                                                    updateProjectLocal(project.id, 'project_facts', newFacts);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Translation Actions - Center */}
                                                    <div className="col-span-12 md:col-span-1 flex flex-col justify-center items-center gap-2 py-2">
                                                        <div className="h-full w-[1px] bg-white/5 hidden md:block"></div>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-6 w-6 rounded-full bg-[#5468E7]/10 text-[#5468E7] hover:bg-[#5468E7]/20 border border-[#5468E7]/20"
                                                            title="Translate Label"
                                                            onClick={() => translateText(fact.label_ka, idx, project.id, 'fact', 'label')}
                                                            disabled={translatingId === `${project.id}-fact-${idx}-label`}
                                                        >
                                                            {translatingId === `${project.id}-fact-${idx}-label` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
                                                        </Button>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-6 w-6 rounded-full bg-[#5468E7]/10 text-[#5468E7] hover:bg-[#5468E7]/20 border border-[#5468E7]/20"
                                                            title="Translate Value"
                                                            onClick={() => translateText(fact.value_ka, idx, project.id, 'fact', 'value')}
                                                            disabled={translatingId === `${project.id}-fact-${idx}-value`}
                                                        >
                                                            {translatingId === `${project.id}-fact-${idx}-value` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
                                                        </Button>
                                                        <div className="h-full w-[1px] bg-white/5 hidden md:block"></div>
                                                    </div>

                                                    {/* English Section */}
                                                    <div className="col-span-12 md:col-span-5 space-y-2">
                                                        <div>
                                                            <label className="text-[10px] text-gray-500 uppercase block mb-1">Key Fact Title (EN)</label>
                                                            <input 
                                                                className="w-full bg-[#0A0F1C] border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                                                                placeholder="e.g. Client"
                                                                value={fact.label_en || ''}
                                                                onChange={(e) => {
                                                                    const newFacts = [...project.project_facts];
                                                                    newFacts[idx].label_en = e.target.value;
                                                                    updateProjectLocal(project.id, 'project_facts', newFacts);
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-gray-500 uppercase block mb-1">Key Fact Value (EN)</label>
                                                            <input 
                                                                className="w-full bg-[#0A0F1C] border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                                                                placeholder="e.g. TBC Bank"
                                                                value={fact.value_en || ''}
                                                                onChange={(e) => {
                                                                    const newFacts = [...project.project_facts];
                                                                    newFacts[idx].value_en = e.target.value;
                                                                    updateProjectLocal(project.id, 'project_facts', newFacts);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Delete Action */}
                                                    <div className="col-span-12 md:col-span-1 flex justify-center items-center">
                                                        <button 
                                                            onClick={() => {
                                                                const newFacts = project.project_facts.filter((_, i) => i !== idx);
                                                                updateProjectLocal(project.id, 'project_facts', newFacts);
                                                            }} 
                                                            className="text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors"
                                                            title="Delete Fact"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Testimonials (Bilingual) */}
                                <div className="bg-[#0A0F1C] p-4 rounded border border-white/5 md:col-span-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                            <Quote className="w-4 h-4 text-[#5468E7]" /> Client Testimonial
                                        </h4>
                                        
                                        {project.testimonial_data ? (
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 bg-[#0D1126] px-2 py-1 rounded border border-white/10">
                                                    <Switch 
                                                        id={`t-vis-${project.id}`}
                                                        checked={project.testimonial_visible !== false}
                                                        onCheckedChange={(checked) => updateProjectLocal(project.id, 'testimonial_visible', checked)}
                                                    />
                                                    <label htmlFor={`t-vis-${project.id}`} className="text-xs text-gray-400 cursor-pointer select-none">
                                                        {project.testimonial_visible !== false ? 'Show' : 'Hide'}
                                                    </label>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="h-7 text-red-500 hover:bg-red-500/10 hover:text-red-400 text-xs px-2" 
                                                    onClick={() => handleDeleteTestimonial(project.id)}
                                                >
                                                    <Trash2 className="w-3 h-3 mr-1" /> Remove
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button size="sm" variant="ghost" className="h-7 text-[#5468E7] bg-[#5468E7]/10 text-xs" onClick={() => handleAddTestimonial(project.id)}>
                                                <Plus className="w-3 h-3 mr-1" /> Add Testimonial
                                            </Button>
                                        )}
                                    </div>

                                    {project.testimonial_data ? (
                                        <div className={`space-y-4 transition-opacity duration-300 ${project.testimonial_visible === false ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                                            {project.testimonial_visible === false && (
                                                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-3 py-2 rounded text-xs flex items-center gap-2 mb-2">
                                                    <EyeOff className="w-3 h-3" />
                                                    <span>This testimonial is currently hidden from public view.</span>
                                                </div>
                                            )}
                                            
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-3 bg-[#0D1126] p-3 rounded border border-white/5">
                                                    <h5 className="text-xs text-[#5468E7] font-bold uppercase mb-2">Georgian (KA)</h5>
                                                    <div className="space-y-2">
                                                        <input className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-xs text-white font-bpg-glaho" placeholder="კლიენტის სახელი" value={project.testimonial_data?.name_ka || ''} onChange={(e) => updateNestedProjectLocal(project.id, 'testimonial_data', 'name_ka', e.target.value)} />
                                                        <input className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-xs text-white font-bpg-glaho" placeholder="პოზიცია" value={project.testimonial_data?.position_ka || ''} onChange={(e) => updateNestedProjectLocal(project.id, 'testimonial_data', 'position_ka', e.target.value)} />
                                                        <input className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-xs text-white font-bpg-glaho" placeholder="კომპანია" value={project.testimonial_data?.company_ka || ''} onChange={(e) => updateNestedProjectLocal(project.id, 'testimonial_data', 'company_ka', e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="space-y-3 bg-[#0D1126] p-3 rounded border border-white/5">
                                                    <div className="flex justify-between items-center mb-2"><h5 className="text-xs text-[#5468E7] font-bold uppercase">English (EN)</h5></div>
                                                    <div className="space-y-2">
                                                        <input className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-xs text-white" placeholder="Client Name" value={project.testimonial_data?.name_en || ''} onChange={(e) => updateNestedProjectLocal(project.id, 'testimonial_data', 'name_en', e.target.value)} />
                                                        <input className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-xs text-white" placeholder="Client Position" value={project.testimonial_data?.position_en || ''} onChange={(e) => updateNestedProjectLocal(project.id, 'testimonial_data', 'position_en', e.target.value)} />
                                                        <input className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-xs text-white" placeholder="Client Company" value={project.testimonial_data?.company_en || ''} onChange={(e) => updateNestedProjectLocal(project.id, 'testimonial_data', 'company_en', e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 relative bg-[#0D1126] p-3 rounded border border-white/5 items-center">
                                                <div className="w-10 h-10 rounded-full bg-[#0A0F1C] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {project.testimonial_data?.image_url ? <img src={project.testimonial_data.image_url} alt="Client" className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-gray-500" />}
                                                </div>
                                                <div className="flex-grow"><input className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-xs text-white font-mono" placeholder="Client Image URL" value={project.testimonial_data?.image_url || ''} onChange={(e) => updateNestedProjectLocal(project.id, 'testimonial_data', 'image_url', e.target.value)} /></div>
                                                <label className="cursor-pointer bg-[#5468E7]/10 text-[#5468E7] hover:bg-[#5468E7]/20 border border-[#5468E7]/20 px-3 py-2 rounded text-xs flex items-center gap-2 transition-colors"><UploadCloud className="w-3 h-3" /> Upload <input type="file" hidden accept="image/*" onChange={(e) => handleTestimonialLogoUpload(project.id, e.target.files[0])} /></label>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div><label className="text-[10px] text-gray-500 uppercase block mb-1">Testimonial Text (KA)</label><textarea rows={4} className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-xs text-white font-bpg-glaho" value={project.testimonial_data?.text_ka || ''} onChange={(e) => updateNestedProjectLocal(project.id, 'testimonial_data', 'text_ka', e.target.value)} /></div>
                                                <div><label className="text-[10px] text-gray-500 uppercase block mb-1">Testimonial Text (EN)</label><textarea rows={4} className="w-full bg-[#0D1126] border border-white/10 rounded px-3 py-2 text-xs text-white" value={project.testimonial_data?.text_en || ''} onChange={(e) => updateNestedProjectLocal(project.id, 'testimonial_data', 'text_en', e.target.value)} /></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 border border-dashed border-white/10 rounded bg-[#0A0F1C]/50 text-gray-500 text-xs italic">
                                            No testimonial added for this project yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB: SCREENSHOTS (Project Tabs) */}
                        <TabsContent value="screenshots" className="space-y-6">
                            <div className="bg-[#0A0F1C] p-4 rounded border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-white">Project Tabs (Layout 4 Only)</h4>
                                        <p className="text-[10px] text-gray-500">Add full-page screenshots that users can switch between.</p>
                                    </div>
                                    <Button size="sm" className="bg-[#5468E7] h-8 text-xs" onClick={() => {
                                        const currentTabs = Array.isArray(project.project_tabs) ? project.project_tabs : [];
                                        updateProjectLocal(project.id, 'project_tabs', [...currentTabs, { label_en: 'New Tab', label_ka: 'ახალი ტაბი', image_url: '' }]);
                                    }}>
                                        <Plus className="w-3 h-3 mr-1" /> Add Tab
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    {Array.isArray(project.project_tabs) && project.project_tabs.map((tab, idx) => (
                                        <div key={idx} className="bg-[#0D1126] p-3 rounded border border-white/5 flex flex-col gap-3">
                                            <div className="flex gap-2">
                                                <input 
                                                    className="w-1/3 bg-[#0A0F1C] border border-white/10 rounded px-2 py-2 text-xs text-white" 
                                                    placeholder="Tab Label (EN)"
                                                    value={tab.label_en || tab.label || ''}
                                                    onChange={(e) => {
                                                        const newTabs = [...project.project_tabs];
                                                        newTabs[idx].label_en = e.target.value;
                                                        updateProjectLocal(project.id, 'project_tabs', newTabs);
                                                    }}
                                                />
                                                <input 
                                                    className="w-1/3 bg-[#0A0F1C] border border-white/10 rounded px-2 py-2 text-xs text-white font-bpg-glaho" 
                                                    placeholder="Tab Label (KA)"
                                                    value={tab.label_ka || ''}
                                                    onChange={(e) => {
                                                        const newTabs = [...project.project_tabs];
                                                        newTabs[idx].label_ka = e.target.value;
                                                        updateProjectLocal(project.id, 'project_tabs', newTabs);
                                                    }}
                                                />
                                                <button onClick={() => {
                                                    const newTabs = project.project_tabs.filter((_, i) => i !== idx);
                                                    updateProjectLocal(project.id, 'project_tabs', newTabs);
                                                }} className="ml-auto text-red-500 hover:bg-red-500/10 p-2 rounded">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                    <input 
                                                    className="flex-grow bg-[#0A0F1C] border border-white/10 rounded px-2 py-2 text-xs text-gray-400 font-mono" 
                                                    placeholder="Screenshot URL"
                                                    value={tab.image_url || tab.url || ''}
                                                    onChange={(e) => {
                                                        const newTabs = [...project.project_tabs];
                                                        newTabs[idx].image_url = e.target.value;
                                                        updateProjectLocal(project.id, 'project_tabs', newTabs);
                                                    }}
                                                />
                                                <div className="relative">
                                                    {isUploading(project.id, `tab-${idx}`) ? (
                                                        <div className="h-8 w-8 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-[#5468E7]" /></div>
                                                    ) : (
                                                        <>
                                                            <input 
                                                                type="file" 
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                onChange={(e) => handleTabFileUpload(project.id, idx, e.target.files[0])}
                                                                accept="image/*"
                                                            />
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white border border-white/10">
                                                                <UploadCloud className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB: SOCIAL MEDIA PAGE */}
                        <TabsContent value="page" className="space-y-6">
                            <div className="bg-[#0A0F1C] p-6 rounded border border-white/5 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Globe className="w-5 h-5 text-[#5468E7]" /> Social Media Integration
                                        </h4>
                                        <p className="text-sm text-gray-400 mt-1">Connect social media pages to display on the project detail page.</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Facebook */}
                                    <div className="bg-[#0D1126] p-4 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-[#1877F2]/10 rounded-lg">
                                        <Facebook className="w-5 h-5 text-[#1877F2]" />
                                        </div>
                                        <h5 className="font-bold text-white">Facebook</h5>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Page URL</label>
                                        <input 
                                            value={project.social_media_links?.facebook?.url || ''}
                                            onChange={(e) => updateSocialMediaLink(project.id, 'facebook', 'url', e.target.value)}
                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#1877F2] outline-none"
                                            placeholder="https://facebook.com/page"
                                        />
                                        </div>
                                        <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Followers Count</label>
                                        <input 
                                            value={project.social_media_links?.facebook?.followers || ''}
                                            onChange={(e) => updateSocialMediaLink(project.id, 'facebook', 'followers', e.target.value)}
                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#1877F2] outline-none"
                                            placeholder="e.g. 50K"
                                        />
                                        </div>
                                    </div>
                                    </div>

                                    {/* Instagram */}
                                    <div className="bg-[#0D1126] p-4 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-[#E4405F]/10 rounded-lg">
                                        <Instagram className="w-5 h-5 text-[#E4405F]" />
                                        </div>
                                        <h5 className="font-bold text-white">Instagram</h5>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Profile URL</label>
                                        <input 
                                            value={project.social_media_links?.instagram?.url || ''}
                                            onChange={(e) => updateSocialMediaLink(project.id, 'instagram', 'url', e.target.value)}
                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#E4405F] outline-none"
                                            placeholder="https://instagram.com/profile"
                                        />
                                        </div>
                                        <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Followers Count</label>
                                        <input 
                                            value={project.social_media_links?.instagram?.followers || ''}
                                            onChange={(e) => updateSocialMediaLink(project.id, 'instagram', 'followers', e.target.value)}
                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#E4405F] outline-none"
                                            placeholder="e.g. 10.5K"
                                        />
                                        </div>
                                    </div>
                                    </div>

                                    {/* TikTok */}
                                    <div className="bg-[#0D1126] p-4 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-black/50 rounded-lg border border-white/10">
                                        <Music2 className="w-5 h-5 text-white" />
                                        </div>
                                        <h5 className="font-bold text-white">TikTok</h5>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Profile URL</label>
                                        <input 
                                            value={project.social_media_links?.tiktok?.url || ''}
                                            onChange={(e) => updateSocialMediaLink(project.id, 'tiktok', 'url', e.target.value)}
                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-white outline-none"
                                            placeholder="https://tiktok.com/@user"
                                        />
                                        </div>
                                        <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Followers Count</label>
                                        <input 
                                            value={project.social_media_links?.tiktok?.followers || ''}
                                            onChange={(e) => updateSocialMediaLink(project.id, 'tiktok', 'followers', e.target.value)}
                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-white outline-none"
                                            placeholder="e.g. 1M"
                                        />
                                        </div>
                                    </div>
                                    </div>

                                    {/* LinkedIn */}
                                    <div className="bg-[#0D1126] p-4 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-[#0A66C2]/10 rounded-lg">
                                        <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                                        </div>
                                        <h5 className="font-bold text-white">LinkedIn</h5>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Company/Profile URL</label>
                                        <input 
                                            value={project.social_media_links?.linkedin?.url || ''}
                                            onChange={(e) => updateSocialMediaLink(project.id, 'linkedin', 'url', e.target.value)}
                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#0A66C2] outline-none"
                                            placeholder="https://linkedin.com/company/..."
                                        />
                                        </div>
                                        <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Followers Count</label>
                                        <input 
                                            value={project.social_media_links?.linkedin?.followers || ''}
                                            onChange={(e) => updateSocialMediaLink(project.id, 'linkedin', 'followers', e.target.value)}
                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#0A66C2] outline-none"
                                            placeholder="e.g. 5,000"
                                        />
                                        </div>
                                    </div>
                                    </div>

                                    {/* YouTube */}
                                    <div className="bg-[#0D1126] p-4 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-[#FF0000]/10 rounded-lg">
                                        <Youtube className="w-5 h-5 text-[#FF0000]" />
                                        </div>
                                        <h5 className="font-bold text-white">YouTube</h5>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Channel URL</label>
                                        <input 
                                            value={project.social_media_links?.youtube?.url || ''}
                                            onChange={(e) => updateSocialMediaLink(project.id, 'youtube', 'url', e.target.value)}
                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#FF0000] outline-none"
                                            placeholder="https://youtube.com/@channel"
                                        />
                                        </div>
                                        <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Subscribers Count</label>
                                        <input 
                                            value={project.social_media_links?.youtube?.followers || ''}
                                            onChange={(e) => updateSocialMediaLink(project.id, 'youtube', 'followers', e.target.value)}
                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#FF0000] outline-none"
                                            placeholder="e.g. 100K"
                                        />
                                        </div>
                                    </div>
                                    </div>

                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB: SETTINGS */}
                        <TabsContent value="settings" className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Page Layout</label>
                                        <select 
                                            value={project.layout_type || 'layout_a'}
                                            onChange={(e) => updateProjectLocal(project.id, 'layout_type', e.target.value)}
                                            className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:border-[#5468E7] outline-none"
                                        >
                                            {LAYOUT_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-gray-500 mt-1">Determines how the detail page looks.</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Visibility</label>
                                        <div className="flex items-center gap-3 bg-[#0A0F1C] p-3 rounded border border-white/10">
                                            <Switch 
                                                checked={project.visible} 
                                                onCheckedChange={(c) => updateProjectLocal(project.id, 'visible', c)} 
                                            />
                                            <span className={`text-sm ${project.visible ? 'text-green-500' : 'text-gray-500'}`}>
                                                {project.visible ? 'Publicly Visible' : 'Hidden (Draft)'}
                                            </span>
                                        </div>
                                    </div>
                                        <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Project Link (External)</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                value={project.project_link || ''}
                                                onChange={(e) => updateProjectLocal(project.id, 'project_link', e.target.value)}
                                                className="w-full bg-[#0A0F1C] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 font-mono"
                                                placeholder="https://..."
                                            />
                                            <a href={project.project_link} target="_blank" rel="noreferrer" className={`p-2 rounded border border-white/10 ${!project.project_link ? 'opacity-50 pointer-events-none' : 'hover:bg-white/5'}`}>
                                                <ExternalLink className="w-4 h-4 text-gray-400" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5">Associated Industries</label>
                                        <div className="flex flex-wrap gap-2 bg-[#0A0F1C] p-4 rounded border border-white/10 min-h-[120px]">
                                            {availableIndustries.map(ind => {
                                                const isActive = Array.isArray(project.industry_ids) && project.industry_ids.includes(ind.id);
                                                return (
                                                    <button
                                                    key={ind.id}
                                                    onClick={() => {
                                                        let newIds;
                                                        const currentIds = Array.isArray(project.industry_ids) ? project.industry_ids : [];
                                                        if (isActive) {
                                                            newIds = currentIds.filter(id => id !== ind.id);
                                                        } else {
                                                            newIds = [...currentIds, ind.id];
                                                        }
                                                        updateProjectLocal(project.id, 'industry_ids', newIds);
                                                    }}
                                                    className={`px-3 py-1 text-xs border rounded-full transition-all ${
                                                        isActive 
                                                        ? 'bg-[#5468E7] border-[#5468E7] text-white' 
                                                        : 'bg-transparent border-white/10 text-gray-500 hover:border-gray-400 hover:text-gray-300'
                                                    }`}
                                                    >
                                                        {ind.name_en}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Footer Actions */}
                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/10">
                            <Button variant="ghost" onClick={() => setEditingId(null)} className="text-gray-400 hover:text-white">Cancel</Button>
                            <Button onClick={() => handleSaveProject(project)} className="bg-[#5468E7] hover:bg-[#4353b8] text-white min-w-[120px]">
                                <Save className="w-4 h-4 mr-2" /> Save Changes
                            </Button>
                        </div>
                    </Tabs>
                </div>
            )}
        </Reorder.Item>
    );
};

const PortfolioTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pageSettings, setPageSettings] = useState({ home_page_count: 6 });
  const [projects, setProjects] = useState([]);
  const [availableIndustries, setAvailableIndustries] = useState([]);
  const [uploadingState, setUploadingState] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [translatingId, setTranslatingId] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: settings } = await supabase.from('portfolio_settings').select('id, home_page_count').limit(1).maybeSingle();
      if (settings) setPageSettings(settings);

      const { data: indData } = await supabase.from('industries_settings').select('industries').single();
      if (indData && indData.industries) {
          setAvailableIndustries(indData.industries);
      }

      const { data: projData, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('order_index', { ascending: true });
        
      if (error) throw error;
      
      const normalizedProjects = projData.map(p => ({
          ...p,
          industry_ids: Array.isArray(p.industry_ids) ? p.industry_ids : [],
          gallery_images: Array.isArray(p.gallery_images) ? p.gallery_images : [],
          gallery_layout: p.gallery_layout || 'grid_3',
          project_tabs: Array.isArray(p.project_tabs) ? p.project_tabs : [],
          testimonial_data: p.testimonial_data || null,
          testimonial_visible: p.testimonial_visible !== false,
          project_facts: Array.isArray(p.project_facts) ? p.project_facts : [],
          project_features: Array.isArray(p.project_features) ? p.project_features : [],
          social_media_links: p.social_media_links || {
            facebook: { url: '', followers: '' },
            instagram: { url: '', followers: '' },
            tiktok: { url: '', followers: '' },
            linkedin: { url: '', followers: '' },
            youtube: { url: '', followers: '' }
          }
      }));

      setProjects(normalizedProjects);

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load portfolio data' });
    } finally {
      setLoading(false);
    }
  };

  const setUploading = (id, key, isLoading) => {
    setUploadingState(prev => ({ ...prev, [`${id}-${key}`]: isLoading }));
  };

  const isUploading = (id, key) => !!uploadingState[`${id}-${key}`];

  const sanitizeSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const translateText = async (text, index, projectId, type = 'feature', subField = null) => {
    if (!text) return;
    const uniqueId = `${projectId}-${type}-${index}${subField ? `-${subField}` : ''}`;
    setTranslatingId(uniqueId);
    
    try {
        const { data, error } = await supabase.functions.invoke('translate', {
            body: { text, sourceLang: 'ka', targetLang: 'en' }
        });

        if (error) throw error;
        if (data.warning) {
             toast({ title: 'Warning', description: data.warning, variant: "destructive" });
        }

        const translatedText = data.translatedText || text;
        
        const projectIndex = projects.findIndex(p => p.id === projectId);
        if (projectIndex !== -1) {
            const newProjects = [...projects];
            
            if (type === 'feature') {
                const features = [...newProjects[projectIndex].project_features];
                features[index] = { ...features[index], title_en: translatedText };
                newProjects[projectIndex].project_features = features;
            } else if (type === 'fact') {
                const facts = [...newProjects[projectIndex].project_facts];
                if (subField === 'label') {
                    facts[index] = { ...facts[index], label_en: translatedText };
                } else if (subField === 'value') {
                    facts[index] = { ...facts[index], value_en: translatedText };
                }
                newProjects[projectIndex].project_facts = facts;
            } else if (type === 'testimonial') {
                const newTestimonialData = { ...newProjects[projectIndex].testimonial_data };
                newTestimonialData[subField] = translatedText;
                newProjects[projectIndex].testimonial_data = newTestimonialData;
            }
            
            setProjects(newProjects);
            toast({ title: "Translated", description: "Text translated successfully." });
        }
    } catch (err) {
        console.error("Translation error:", err);
        toast({ variant: 'destructive', title: "Translation Failed", description: "Could not translate text. Please check API key." });
    } finally {
        setTranslatingId(null);
    }
  };

  const updateProjectLocal = (id, field, value) => {
    setProjects(prevProjects => prevProjects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const updateNestedProjectLocal = (id, parentField, key, value) => {
      setProjects(prevProjects => prevProjects.map(p => {
          if (p.id !== id) return p;
          return {
              ...p,
              [parentField]: {
                  ...p[parentField],
                  [key]: value
              }
          };
      }));
  };

  const updateSocialMediaLink = (projectId, platform, field, value) => {
    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id !== projectId) return p;
      const currentLinks = p.social_media_links || {};
      const platformData = currentLinks[platform] || {};
      
      return {
        ...p,
        social_media_links: {
          ...currentLinks,
          [platform]: {
            ...platformData,
            [field]: value
          }
        }
      };
    }));
  };

  const updateOrderInDb = async (updatedProjects) => {
     const updates = updatedProjects.map((p, index) => ({
         id: p.id,
         order_index: index,
         updated_at: new Date().toISOString()
     }));
     
     const { error } = await supabase.from('portfolio_projects').upsert(updates, { onConflict: 'id' });
     if (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update order in database.' });
     }
  };

  const handleReorder = (newOrder) => {
     setProjects(newOrder);
  };

  const handleDragEnd = () => {
     updateOrderInDb(projects);
  };

  const moveProject = (index, direction) => {
    const newProjects = [...projects];
    if (direction === 'up' && index > 0) {
      [newProjects[index], newProjects[index - 1]] = [newProjects[index - 1], newProjects[index]];
    } else if (direction === 'down' && index < newProjects.length - 1) {
      [newProjects[index], newProjects[index + 1]] = [newProjects[index + 1], newProjects[index]];
    } else {
      return;
    }
    setProjects(newProjects);
    updateOrderInDb(newProjects);
  };

  const handleSettingsSave = async () => {
      try {
          const { data: existing } = await supabase.from('portfolio_settings').select('id').limit(1).maybeSingle();
          if (existing) {
              await supabase.from('portfolio_settings').update({ home_page_count: pageSettings.home_page_count }).eq('id', existing.id);
          } else {
              await supabase.from('portfolio_settings').insert([pageSettings]);
          }
          toast({ title: 'Saved', description: 'Display settings updated.' });
      } catch (e) {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
      }
  };

  const handleImageUpload = async (projectId, file, field, dbColumn) => {
    if (!file) return;
    const uploadKey = `${field}`;
    setUploading(projectId, uploadKey, true);

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}-${field}-${Date.now()}.${fileExt}`;
        const filePath = `portfolio/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('portfolio')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('portfolio')
            .getPublicUrl(filePath);

        const { error: dbError } = await supabase
            .from('portfolio_projects')
            .update({ [dbColumn]: publicUrl })
            .eq('id', projectId);

        if (dbError) throw dbError;

        updateProjectLocal(projectId, dbColumn, publicUrl);
        toast({ title: "Success", description: "Image uploaded and saved successfully." });

    } catch (error) {
        console.error('Upload failed:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload image.' });
    } finally {
        setUploading(projectId, uploadKey, false);
    }
  };

  const handleGalleryUpload = async (projectId, files) => {
    if (!files || files.length === 0) return;
    setUploading(projectId, 'gallery', true);

    try {
        const uploadPromises = Array.from(files).map(async (file) => {
             const fileExt = file.name.split('.').pop();
             const fileName = `${projectId}-gallery-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
             const filePath = `portfolio/${fileName}`;

             const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file);
             if (uploadError) throw uploadError;

             const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(filePath);
             return publicUrl;
        });

        const newUrls = await Promise.all(uploadPromises);
        
        const project = projects.find(p => p.id === projectId);
        const updatedGallery = [...(project.gallery_images || []), ...newUrls];

        const { error: dbError } = await supabase
            .from('portfolio_projects')
            .update({ gallery_images: updatedGallery })
            .eq('id', projectId);

        if (dbError) throw dbError;

        updateProjectLocal(projectId, 'gallery_images', updatedGallery);
        toast({ title: "Success", description: `${newUrls.length} images uploaded.` });

    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Error', description: 'Gallery upload failed.' });
    } finally {
        setUploading(projectId, 'gallery', false);
    }
  };

  const handleTestimonialLogoUpload = async (projectId, file) => {
      if (!file) return;
      setUploading(projectId, 'testimonial_image', true);
      try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${projectId}-client-logo-${Date.now()}.${fileExt}`;
          const filePath = `portfolio/${fileName}`;

          const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file);
          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(filePath);

          const project = projects.find(p => p.id === projectId);
          const currentTestimonialData = project.testimonial_data || {};
          const newTestimonialData = { ...currentTestimonialData, image_url: publicUrl };

          const { error: dbError } = await supabase
            .from('portfolio_projects')
            .update({ testimonial_data: newTestimonialData })
            .eq('id', projectId);

          if (dbError) throw dbError;

          if (!project.testimonial_data) {
             updateProjectLocal(projectId, 'testimonial_data', newTestimonialData);
          } else {
             updateNestedProjectLocal(projectId, 'testimonial_data', 'image_url', publicUrl);
          }
          toast({ title: "Success", description: "Client image uploaded." });
      } catch (e) {
          console.error(e);
          toast({ variant: 'destructive', title: 'Error', description: 'Upload failed.' });
      } finally {
          setUploading(projectId, 'testimonial_image', false);
      }
  };

  const handleTabFileUpload = async (projectId, tabIndex, file) => {
    if (!file) return;
    setUploading(projectId, `tab-${tabIndex}`, true);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `tab-${projectId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `portfolio/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(filePath);

        const projectIndex = projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) return;

        const currentProject = projects[projectIndex];
        const updatedTabs = [...currentProject.project_tabs];
        updatedTabs[tabIndex] = { ...updatedTabs[tabIndex], image_url: publicUrl };

        const { error: dbError } = await supabase
            .from('portfolio_projects')
            .update({ project_tabs: updatedTabs })
            .eq('id', projectId);

        if (dbError) throw dbError;

        updateProjectLocal(projectId, 'project_tabs', updatedTabs);
        toast({ title: "Uploaded", description: "Screenshot uploaded and saved." });

    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Error', description: 'Upload failed' });
    } finally {
        setUploading(projectId, `tab-${tabIndex}`, false);
    }
  };

  const handleAddTestimonial = (projectId) => {
    const emptyTestimonial = { 
        name_en: '', name_ka: '', 
        position_en: '', position_ka: '', 
        company_en: '', company_ka: '', 
        text_en: '', text_ka: '', 
        image_url: '' 
    };
    updateProjectLocal(projectId, 'testimonial_data', emptyTestimonial);
    updateProjectLocal(projectId, 'testimonial_visible', true);
  };

  const handleDeleteTestimonial = async (projectId) => {
    if(!window.confirm("Are you sure you want to delete this testimonial?")) return;
    
    updateProjectLocal(projectId, 'testimonial_data', null);
    
    try {
        await supabase
            .from('portfolio_projects')
            .update({ testimonial_data: null, testimonial_visible: false })
            .eq('id', projectId);
        toast({ title: 'Deleted', description: 'Testimonial removed.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete.' });
    }
  };

  const handleSaveProject = async (project) => {
    try {
        if(!project.title_en || !project.slug) {
             toast({ variant: 'destructive', title: "Validation Error", description: "Title and Slug are required." });
             return;
        }

        const { error } = await supabase
            .from('portfolio_projects')
            .update({
                title_en: project.title_en,
                title_ka: project.title_ka,
                slug: project.slug,
                visible: project.visible,
                category_en: project.category_en,
                category_ka: project.category_ka,
                description_en: project.description_en,
                description_ka: project.description_ka,
                detailed_description_en: project.detailed_description_en,
                detailed_description_ka: project.detailed_description_ka,
                image_url: project.image_url,
                logo_url: project.logo_url,
                logo_border_color: project.logo_border_color,
                project_link: project.project_link,
                industry_ids: project.industry_ids,
                gallery_images: project.gallery_images,
                gallery_layout: project.gallery_layout,
                project_tabs: project.project_tabs,
                testimonial_data: project.testimonial_data,
                testimonial_visible: project.testimonial_visible,
                project_facts: project.project_facts,
                project_features: project.project_features,
                facebook_page_url: project.facebook_page_url,
                facebook_page_data: project.facebook_page_data,
                social_media_links: project.social_media_links,
                layout_type: project.layout_type,
                project_type: project.project_type,
                order_index: projects.findIndex(p => p.id === project.id),
                updated_at: new Date().toISOString()
            })
            .eq('id', project.id);

        if (error) throw error;
        toast({ title: 'Saved', description: `${project.title_en} updated successfully.` });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save project.' });
    }
  };

  const handleAddProject = async () => {
    const timestamp = Date.now();
    const newProject = {
        title_en: 'New Project',
        title_ka: 'ახალი პროექტი',
        slug: `project-${timestamp}`,
        visible: false,
        order_index: projects.length,
        layout_type: 'layout_a',
        gallery_layout: 'grid_3',
        project_type: 'web',
        industry_ids: [],
        gallery_images: [],
        project_tabs: [],
        testimonial_data: null,
        testimonial_visible: true,
        project_facts: [],
        project_features: [],
        facebook_page_url: '',
        facebook_page_data: null,
        social_media_links: {
          facebook: { url: '', followers: '' },
          instagram: { url: '', followers: '' },
          tiktok: { url: '', followers: '' },
          linkedin: { url: '', followers: '' },
          youtube: { url: '', followers: '' }
        }
    };

    const { data, error } = await supabase.from('portfolio_projects').insert([newProject]).select();
    if (!error && data) {
        const p = data[0];
        p.industry_ids = p.industry_ids || [];
        p.gallery_images = p.gallery_images || [];
        p.gallery_layout = p.gallery_layout || 'grid_3';
        p.project_tabs = p.project_tabs || [];
        p.testimonial_data = null;
        p.project_facts = p.project_facts || [];
        p.project_features = p.project_features || [];
        p.facebook_page_data = null;
        p.social_media_links = p.social_media_links || newProject.social_media_links;
        
        setProjects([...projects, p]);
        setEditingId(p.id);
        toast({ title: 'Created', description: 'New project added.' });
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to create project.' });
    }
  };

  const handleDuplicateProject = async (project, e) => {
    e.stopPropagation();
    try {
        const newSlug = `${project.slug}-copy-${Math.floor(Date.now() / 1000)}`;
        const projectCopy = JSON.parse(JSON.stringify(project));
        
        delete projectCopy.id;
        delete projectCopy.created_at;
        delete projectCopy.updated_at;
        
        projectCopy.title_en = `${projectCopy.title_en} (Copy)`;
        projectCopy.slug = newSlug;
        projectCopy.visible = false;
        projectCopy.order_index = projects.length;

        const { data, error } = await supabase.from('portfolio_projects').insert([projectCopy]).select();
        if (error) throw error;
        
        if (data && data[0]) {
            const p = data[0];
            p.industry_ids = p.industry_ids || [];
            p.gallery_images = p.gallery_images || [];
            p.gallery_layout = p.gallery_layout || 'grid_3';
            p.project_tabs = p.project_tabs || [];
            p.testimonial_data = p.testimonial_data || null;
            p.project_facts = p.project_facts || [];
            p.project_features = p.project_features || [];
            p.facebook_page_data = p.facebook_page_data || null;
            p.social_media_links = p.social_media_links || {
              facebook: { url: '', followers: '' },
              instagram: { url: '', followers: '' },
              tiktok: { url: '', followers: '' },
              linkedin: { url: '', followers: '' },
              youtube: { url: '', followers: '' }
            };

            setProjects([...projects, p]);
            toast({ title: 'Success', description: 'Project duplicated successfully.' });
        }
    } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to duplicate project.' });
    }
  };

  const handleDeleteProject = async (id, e) => {
      e.stopPropagation();
      if(!window.confirm("Delete this project? This action cannot be undone.")) return;
      await supabase.from('portfolio_projects').delete().eq('id', id);
      setProjects(projects.filter(p => p.id !== id));
      toast({ title: 'Deleted', description: 'Project removed.' });
  };

  if (loading) return <div className="text-white p-8 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading Portfolio...</div>;

  const itemHandlers = {
      handleDeleteProject,
      handleDuplicateProject,
      moveProject,
      updateProjectLocal,
      sanitizeSlug,
      handleImageUpload,
      isUploading,
      handleGalleryUpload,
      translateText,
      translatingId,
      handleAddTestimonial,
      handleDeleteTestimonial,
      updateNestedProjectLocal,
      handleTestimonialLogoUpload,
      handleTabFileUpload,
      updateSocialMediaLink,
      handleSaveProject,
      setEditingId,
      availableIndustries
  };

  return (
    <div className="bg-[#0A0F1C] p-4 rounded-xl min-h-screen border border-[#5468E7]/20">
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <LayoutGrid className="w-6 h-6 text-[#5468E7]" />
            <h2 className="text-xl font-bold text-white">Portfolio Management</h2>
        </div>
        <Button onClick={handleAddProject} className="bg-[#5468E7] hover:bg-[#4353b8] text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Project
        </Button>
      </div>

      <div className="bg-[#0D1126] border border-[#5468E7]/30 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4" /> Display Settings
            </h3>
            <Button size="sm" onClick={handleSettingsSave} variant="outline" className="h-8 border-[#5468E7] text-[#5468E7] hover:bg-[#5468E7] hover:text-white">
                Save Global Settings
            </Button>
        </div>
        <div className="space-y-4 max-w-md">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Projects on Home Page</span>
                <span className="text-[#5468E7] font-bold">{pageSettings.home_page_count}</span>
            </div>
            <Slider 
                value={[pageSettings.home_page_count]} 
                max={12} 
                step={1} 
                onValueChange={(val) => setPageSettings({...pageSettings, home_page_count: val[0]})}
                className="py-4"
            />
        </div>
      </div>

      <Reorder.Group axis="y" values={projects} onReorder={handleReorder} className="space-y-4">
        {projects.map((project, index) => (
            <div key={project.id} onPointerUp={handleDragEnd}>
                <PortfolioProjectItem 
                    project={project} 
                    index={index}
                    totalCount={projects.length}
                    isExpanded={editingId === project.id}
                    toggleExpand={(id) => setEditingId(editingId === id ? null : id)}
                    handlers={itemHandlers}
                />
            </div>
        ))}
      </Reorder.Group>
    </div>
  );
};

export default PortfolioTab;