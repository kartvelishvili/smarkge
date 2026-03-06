import React, { useState, useEffect } from 'react';
import { Save, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const TestimonialsTab = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    title_en: 'Client Feedback',
    title_ka: 'გამოხმაურებები',
    animation_speed: 180 // Default to 180 as requested
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        // Ensure default if not set
        setConfig({
          ...data,
          animation_speed: data.animation_speed || 180
        });
      }
    } catch (error) {
      console.error('Error fetching testimonials settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Check if ID exists to update, otherwise insert
      const { data: existing } = await supabase.from('testimonials_settings').select('id').limit(1).maybeSingle();
      
      let result;
      if (existing) {
        result = await supabase
          .from('testimonials_settings')
          .update(config)
          .eq('id', existing.id);
      } else {
        result = await supabase
          .from('testimonials_settings')
          .insert([config]);
      }

      if (result.error) throw result.error;
      toast({ title: 'Success', description: 'Testimonials settings updated successfully.' });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
    }
  };

  if (loading) return <div className="text-white">Loading settings...</div>;

  return (
    <div className="bg-[#0D1126] border border-[#5468E7]/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6 bg-[#0D1126] p-4 rounded-lg border border-[#5468E7]/30">
        <Quote className="w-6 h-6 text-[#5468E7]" />
        <h2 className="text-xl font-bold text-white">Testimonials Section Configuration</h2>
      </div>

      <div className="space-y-6">
        {/* Titles */}
        <div className="grid md:grid-cols-2 gap-6 bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5">
          <h3 className="md:col-span-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Section Titles</h3>
          <div>
            <label className="text-xs text-gray-500 block mb-2">Title (English)</label>
            <input
              value={config.title_en || ''}
              onChange={(e) => setConfig({ ...config, title_en: e.target.value })}
              className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] outline-none"
              placeholder="Client Feedback"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-2">Title (Georgian)</label>
            <input
              value={config.title_ka || ''}
              onChange={(e) => setConfig({ ...config, title_ka: e.target.value })}
              className="w-full bg-[#0D1126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#5468E7] outline-none"
              placeholder="გამოხმაურებები"
            />
          </div>
        </div>

        {/* Animation Speed */}
        <div className="bg-[#0A0F1C]/50 p-6 rounded-lg border border-white/5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Marquee Animation Speed</h3>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-400 text-sm">Duration (Seconds per loop)</label>
              <span className="text-xs font-mono bg-[#5468E7]/20 text-[#5468E7] px-2 py-1 rounded">
                {config.animation_speed}s
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-6">Lower value = Faster speed. Higher value = Slower speed (Default: 180s)</p>
            <div className="flex gap-4 items-center">
              <span className="text-xs text-gray-500">Fast (10s)</span>
              <Slider
                value={[config.animation_speed || 180]}
                min={10}
                max={600}
                step={10}
                onValueChange={(val) => setConfig({ ...config, animation_speed: val[0] })}
                className="flex-grow"
              />
              <span className="text-xs text-gray-500">Slow (600s)</span>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full bg-[#5468E7] py-6 text-lg">
          <Save className="w-5 h-5 mr-2" /> Save Testimonials Settings
        </Button>
      </div>
    </div>
  );
};

export default TestimonialsTab;