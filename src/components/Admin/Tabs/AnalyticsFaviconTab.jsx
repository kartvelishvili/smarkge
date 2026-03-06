import React, { useState, useEffect } from 'react';
import { Save, Upload, BarChart, Image as ImageIcon, Code, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const AnalyticsFaviconTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [settings, setSettings] = useState({
    google_analytics_id: '',
    google_tag_code: '',
    favicon_url: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        const newSettings = { ...settings };
        data.forEach(item => {
          if (item.key in newSettings) {
            newSettings[item.key] = item.value;
          }
        });
        setSettings(newSettings);
      }
    } catch (e) {
      console.error("Error fetching settings:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare upsert data
      const updates = Object.entries(settings).map(([key, value]) => ({ 
        key, 
        value: value || '' // Ensure no nulls
      }));

      const { error } = await supabase.from('site_settings').upsert(updates);

      if (error) throw error;

      toast({ 
        title: 'Success / წარმატება', 
        description: 'Settings saved successfully. Refresh the page to see changes. / პარამეტრები შენახულია.' 
      });
      
      // Optional: Force reload to apply new head scripts immediately (user might need to refresh anyway)
    } catch (error) {
      console.error(error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'Failed to save settings.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/x-icon', 'image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'image/vnd.microsoft.icon'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: "Invalid File Type / არასწორი ფაილი",
        description: "Please upload .ico, .png, .svg, or .webp file."
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `favicon_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio') // Using existing public bucket
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      setSettings(prev => ({ ...prev, favicon_url: publicUrl }));
      
      toast({
        title: "Upload Successful / აიტვირთა",
        description: "Favicon uploaded. Don't forget to save changes."
      });
    } catch (error) {
      console.error('Error uploading favicon:', error);
      toast({
        variant: 'destructive',
        title: "Upload Failed",
        description: error.message
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-white p-6">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-[#0D1126] border border-[#5468E7]/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6 bg-[#0A0F1C] p-4 rounded-lg border border-[#5468E7]/30">
          <BarChart className="w-6 h-6 text-[#5468E7]" />
          <div>
            <h2 className="text-xl font-bold text-white">Google Tag & Analytics</h2>
            <p className="text-sm text-gray-400">Manage your tracking codes and site identity</p>
          </div>
        </div>

        <div className="grid gap-8">
          
          {/* Analytics Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <Code className="w-5 h-5" /> Analytics Configuration
            </h3>

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="ga_id" className="text-white">Google Analytics ID / Google Analytics-ის ID</Label>
                <div className="relative">
                  <Input 
                    id="ga_id"
                    placeholder="G-XXXXXXXXXX" 
                    value={settings.google_analytics_id}
                    onChange={(e) => setSettings({...settings, google_analytics_id: e.target.value})}
                    className="bg-[#0A0F1C] border-white/10 text-white pl-10"
                  />
                  <BarChart className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                </div>
                <p className="text-xs text-gray-500">
                  Enter your Measurement ID (starts with G-). Standard GA4 script will be injected automatically.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gtm_code" className="text-white">Google Tag Manager / Custom Scripts</Label>
                <Textarea 
                  id="gtm_code"
                  placeholder="<script>...</script>"
                  value={settings.google_tag_code}
                  onChange={(e) => setSettings({...settings, google_tag_code: e.target.value})}
                  className="bg-[#0A0F1C] border-white/10 text-white min-h-[150px] font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Paste full script code here (GTM, Meta Pixel, Hotjar, etc.). Includes &lt;script&gt; tags.
                </p>
              </div>
            </div>
          </div>

          {/* Favicon Section */}
          <div className="space-y-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <ImageIcon className="w-5 h-5" /> Favicon Management
            </h3>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 space-y-4 w-full">
                <Label className="text-white">Upload New Favicon / ფავიცონის ატვირთვა</Label>
                <div className="flex gap-4 items-center">
                   <Input 
                      type="file" 
                      accept=".ico,.png,.jpg,.jpeg,.svg,.webp"
                      onChange={handleFaviconUpload}
                      disabled={uploading}
                      className="bg-[#0A0F1C] border-white/10 text-white file:bg-[#5468E7] file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 hover:file:bg-[#4353b8]"
                   />
                   {uploading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5468E7]"></div>}
                </div>
                <p className="text-xs text-gray-500">
                  Supported formats: .ico, .png, .svg, .webp. Recommended size: 32x32 or 16x16.
                </p>
              </div>

              {/* Preview */}
              <div className="bg-[#0A0F1C] p-6 rounded-lg border border-white/10 flex flex-col items-center gap-3 min-w-[150px]">
                <span className="text-xs text-gray-400 uppercase font-semibold">Current Preview</span>
                {settings.favicon_url ? (
                  <div className="relative group">
                     <img 
                       src={settings.favicon_url} 
                       alt="Favicon Preview" 
                       className="w-16 h-16 object-contain"
                     />
                     <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                       <CheckCircle2 className="w-3 h-3 text-white" />
                     </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-white/5 rounded flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <span className="text-[10px] text-gray-600 break-all max-w-[150px] text-center">
                  {settings.favicon_url ? 'Active' : 'No favicon set'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleSave} 
        disabled={saving}
        className="w-full bg-[#5468E7] hover:bg-[#4353b8] text-white py-6 text-lg shadow-lg shadow-blue-900/20"
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Saving...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Save className="w-5 h-5" /> Save All Changes / შენახვა
          </span>
        )}
      </Button>
    </div>
  );
};

export default AnalyticsFaviconTab;