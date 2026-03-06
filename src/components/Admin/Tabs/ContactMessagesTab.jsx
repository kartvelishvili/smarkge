import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  RefreshCw,
  Save,
  Settings,
  LayoutTemplate
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

const ContactMessagesTab = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  // Settings State
  const [settings, setSettings] = useState({
    id: null,
    design_style: 'minimal'
  });
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    fetchSettings();
  }, []);

  // --- MESSAGES LOGIC ---

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load contact messages."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setIsDetailOpen(false);
      
      toast({ title: "Success", description: "Message deleted successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete message." });
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setMessages(messages.map(m => m.id === id ? { ...m, status: newStatus } : m));
      if (selectedMessage?.id === id) setSelectedMessage({ ...selectedMessage, status: newStatus });
      
      toast({ title: "Updated", description: `Message marked as ${newStatus}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update status." });
    }
  };

  const openMessage = (msg) => {
    setSelectedMessage(msg);
    setIsDetailOpen(true);
    if (msg.status === 'new') {
      handleStatusUpdate(msg.id, 'read');
    }
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>;
      case 'read': return <Badge variant="outline" className="text-gray-400 border-gray-600">Read</Badge>;
      case 'replied': return <Badge className="bg-green-600 hover:bg-green-700">Replied</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // --- SETTINGS LOGIC ---

  const fetchSettings = async () => {
    try {
      setSettingsLoading(true);
      const { data, error } = await supabase
        .from('contact_settings')
        .select('id, design_style')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error

      if (data) {
        setSettings({
          id: data.id,
          design_style: data.design_style || 'minimal'
        });
      } else {
        // Init default
        setSettings({
          id: null,
          design_style: 'minimal'
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load settings." });
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSettingsLoading(true);
      
      const payload = {
        design_style: settings.design_style,
        updated_at: new Date().toISOString()
      };

      let error;
      
      if (settings.id) {
         const { error: updateError } = await supabase
            .from('contact_settings')
            .update(payload)
            .eq('id', settings.id);
         error = updateError;
      } else {
         const { data: insertedData, error: insertError } = await supabase
            .from('contact_settings')
            .insert([payload])
            .select()
            .single();
         error = insertError;
         if (insertedData) {
             setSettings(prev => ({ ...prev, id: insertedData.id }));
         }
      }

      if (error) throw error;
      toast({ title: "Success", description: "Design style saved successfully." });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save settings." });
    } finally {
      setSettingsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="bg-[#0D1126] border border-[#5468E7]/30 p-1 w-full justify-start mb-6">
          <TabsTrigger value="messages" className="data-[state=active]:bg-[#5468E7] data-[state=active]:text-white">
            <MessageSquare className="w-4 h-4 mr-2" /> Messages
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#5468E7] data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" /> Page Settings
          </TabsTrigger>
        </TabsList>

        {/* --- MESSAGES TAB CONTENT --- */}
        <TabsContent value="messages" className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0D1126] p-4 rounded-lg border border-[#5468E7]/30">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-[#5468E7]" />
              <div>
                <h2 className="text-xl font-bold text-white">Inbox</h2>
                <p className="text-xs text-gray-400">Manage inquiries from your website</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchMessages} className="bg-[#0A0F1C] border-white/10 text-gray-300 hover:text-white">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </div>
          </div>

          {/* Stats / Filter Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              onClick={() => setFilter('all')}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${filter === 'all' ? 'bg-[#5468E7]/20 border-[#5468E7]' : 'bg-[#0A0F1C] border-white/10 hover:border-white/20'}`}
            >
              <div className="text-2xl font-bold text-white mb-1">{messages.length}</div>
              <div className="text-xs text-gray-400 font-medium uppercase">Total Messages</div>
            </div>
            <div 
              onClick={() => setFilter('new')}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${filter === 'new' ? 'bg-blue-500/20 border-blue-500' : 'bg-[#0A0F1C] border-white/10 hover:border-white/20'}`}
            >
              <div className="text-2xl font-bold text-blue-400 mb-1">{messages.filter(m => m.status === 'new').length}</div>
              <div className="text-xs text-gray-400 font-medium uppercase">New</div>
            </div>
            <div 
              onClick={() => setFilter('read')}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${filter === 'read' ? 'bg-gray-500/20 border-gray-500' : 'bg-[#0A0F1C] border-white/10 hover:border-white/20'}`}
            >
              <div className="text-2xl font-bold text-gray-300 mb-1">{messages.filter(m => m.status === 'read').length}</div>
              <div className="text-xs text-gray-400 font-medium uppercase">Read</div>
            </div>
            <div 
              onClick={() => setFilter('replied')}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${filter === 'replied' ? 'bg-green-500/20 border-green-500' : 'bg-[#0A0F1C] border-white/10 hover:border-white/20'}`}
            >
              <div className="text-2xl font-bold text-green-400 mb-1">{messages.filter(m => m.status === 'replied').length}</div>
              <div className="text-xs text-gray-400 font-medium uppercase">Replied</div>
            </div>
          </div>

          {/* Messages Table */}
          <div className="bg-[#0A0F1C] rounded-lg border border-white/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-[#0D1126]">
                <TableRow className="border-white/5 hover:bg-[#0D1126]">
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Name</TableHead>
                  <TableHead className="text-gray-400">Subject</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-right text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">Loading messages...</TableCell>
                  </TableRow>
                ) : filteredMessages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">No messages found.</TableCell>
                  </TableRow>
                ) : (
                  filteredMessages.map((msg) => (
                    <TableRow 
                      key={msg.id} 
                      className={`border-white/5 cursor-pointer transition-colors ${msg.status === 'new' ? 'bg-[#5468E7]/5 hover:bg-[#5468E7]/10' : 'hover:bg-white/5'}`}
                      onClick={() => openMessage(msg)}
                    >
                      <TableCell className="font-mono text-xs text-gray-400">
                        {format(new Date(msg.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium text-gray-200">
                        <div>{msg.name}</div>
                        <div className="text-xs text-gray-500">{msg.email}</div>
                      </TableCell>
                      <TableCell className="text-gray-300 max-w-[200px] truncate">
                        {msg.subject}
                      </TableCell>
                      <TableCell>{getStatusBadge(msg.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={(e) => handleDelete(msg.id, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* --- SETTINGS TAB CONTENT --- */}
        <TabsContent value="settings">
          <div className="bg-[#0D1126] p-6 rounded-lg border border-[#5468E7]/30 space-y-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Contact Page Design</h3>
                <p className="text-sm text-gray-400">Select the layout style for the contact page.</p>
              </div>
              <Button onClick={saveSettings} disabled={settingsLoading} className="bg-[#5468E7] hover:bg-[#4353b8]">
                {settingsLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>

            <div className="bg-[#5468E7]/10 border border-[#5468E7]/20 rounded-lg p-4 flex items-start gap-3">
               <div className="bg-[#5468E7] p-2 rounded-full mt-1">
                  <LayoutTemplate className="w-4 h-4 text-white" />
               </div>
               <div>
                  <h4 className="text-white font-medium text-sm">Design Only</h4>
                  <p className="text-xs text-gray-400 mt-1">
                     Contact information (Address, Phone, Email, etc.) is hardcoded. Use this panel to select your preferred visual style.
                  </p>
               </div>
            </div>

            <div className="space-y-4">
               <Label className="text-white">Select Layout Style</Label>
               <Select 
                 value={settings.design_style} 
                 onValueChange={(val) => setSettings(prev => ({...prev, design_style: val}))}
               >
                  <SelectTrigger className="w-full bg-[#0A0F1C] border-white/10 text-white h-12">
                     <SelectValue placeholder="Select Style" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0F1C] border-white/10 text-white">
                     <SelectItem value="minimal">Modern Minimal (Clean, 2 Column)</SelectItem>
                     <SelectItem value="gradient">Modern Gradient (Bold, 3 Column)</SelectItem>
                     <SelectItem value="card">Modern Card-Based (Grid Layout)</SelectItem>
                  </SelectContent>
               </Select>

               <div className="grid grid-cols-3 gap-4 mt-6">
                  {/* Preview Thumbnails */}
                  <div 
                    onClick={() => setSettings(prev => ({...prev, design_style: 'minimal'}))}
                    className={`cursor-pointer rounded-lg border-2 p-2 transition-all ${settings.design_style === 'minimal' ? 'border-[#5468E7] bg-[#5468E7]/10' : 'border-white/10 hover:border-white/30'}`}
                  >
                     <div className="aspect-[4/3] bg-[#0A0F1C] rounded border border-white/5 mb-2 flex flex-col p-2 gap-1">
                        <div className="w-full h-2 bg-gray-700 rounded-full w-1/3"></div>
                        <div className="flex gap-1 h-full">
                           <div className="w-1/2 bg-gray-800 rounded"></div>
                           <div className="w-1/2 bg-gray-800 rounded"></div>
                        </div>
                     </div>
                     <p className="text-xs text-center text-gray-400 font-medium">Minimal</p>
                  </div>

                  <div 
                    onClick={() => setSettings(prev => ({...prev, design_style: 'gradient'}))}
                    className={`cursor-pointer rounded-lg border-2 p-2 transition-all ${settings.design_style === 'gradient' ? 'border-[#5468E7] bg-[#5468E7]/10' : 'border-white/10 hover:border-white/30'}`}
                  >
                     <div className="aspect-[4/3] bg-gradient-to-br from-gray-900 to-gray-800 rounded border border-white/5 mb-2 flex flex-col p-2 gap-1">
                        <div className="w-full h-8 bg-gray-700/50 rounded mb-1"></div>
                        <div className="flex gap-1 h-full">
                           <div className="w-1/3 bg-gray-700/50 rounded"></div>
                           <div className="w-1/3 bg-gray-700/50 rounded"></div>
                           <div className="w-1/3 bg-gray-700/50 rounded"></div>
                        </div>
                     </div>
                     <p className="text-xs text-center text-gray-400 font-medium">Gradient</p>
                  </div>

                  <div 
                    onClick={() => setSettings(prev => ({...prev, design_style: 'card'}))}
                    className={`cursor-pointer rounded-lg border-2 p-2 transition-all ${settings.design_style === 'card' ? 'border-[#5468E7] bg-[#5468E7]/10' : 'border-white/10 hover:border-white/30'}`}
                  >
                     <div className="aspect-[4/3] bg-[#0A0F1C] rounded border border-white/5 mb-2 p-2 flex flex-wrap gap-1 content-start">
                        <div className="w-full h-4 bg-gray-800 rounded mb-1"></div>
                        <div className="w-[48%] h-8 bg-gray-800 rounded"></div>
                        <div className="w-[48%] h-8 bg-gray-800 rounded"></div>
                        <div className="w-full h-8 bg-gray-800 rounded mt-1"></div>
                     </div>
                     <p className="text-xs text-center text-gray-400 font-medium">Card-Based</p>
                  </div>
               </div>
            </div>

          </div>
        </TabsContent>
      </Tabs>

      {/* Message Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-[#0D1126] border border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>Message Details</span>
              {selectedMessage && getStatusBadge(selectedMessage.status)}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Received on {selectedMessage && format(new Date(selectedMessage.created_at), 'PPpp')}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6 mt-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#0A0F1C] rounded border border-white/5">
                     <span className="text-xs text-gray-500 uppercase font-bold block mb-1">From</span>
                     <div className="font-medium text-white">{selectedMessage.name}</div>
                  </div>
                  <div className="p-3 bg-[#0A0F1C] rounded border border-white/5">
                     <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Phone</span>
                     <div className="font-medium text-white font-mono">{selectedMessage.phone || 'N/A'}</div>
                  </div>
               </div>
               
               <div className="p-3 bg-[#0A0F1C] rounded border border-white/5 flex items-center justify-between group">
                   <div>
                     <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Email</span>
                     <div className="font-medium text-white font-mono">{selectedMessage.email}</div>
                   </div>
                   <a href={`mailto:${selectedMessage.email}`} className="text-[#5468E7] hover:underline text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Reply via Email
                   </a>
               </div>

               <div className="p-4 bg-[#0A0F1C] rounded border border-white/5">
                   <span className="text-xs text-gray-500 uppercase font-bold block mb-2">Subject</span>
                   <div className="font-bold text-white mb-4 border-b border-white/5 pb-2">{selectedMessage.subject}</div>
                   <span className="text-xs text-gray-500 uppercase font-bold block mb-2">Message Content</span>
                   <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                      {selectedMessage.message}
                   </div>
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  {selectedMessage.status !== 'replied' && (
                     <Button 
                       onClick={() => handleStatusUpdate(selectedMessage.id, 'replied')}
                       className="bg-green-600 hover:bg-green-700 text-white"
                     >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Replied
                     </Button>
                  )}
                  {selectedMessage.status === 'replied' && (
                     <Button 
                       onClick={() => handleStatusUpdate(selectedMessage.id, 'read')}
                       variant="outline"
                       className="border-white/10 text-gray-300 hover:text-white"
                     >
                        <Clock className="w-4 h-4 mr-2" /> Mark as Read (Un-reply)
                     </Button>
                  )}
                  <Button 
                    variant="destructive" 
                    onClick={(e) => handleDelete(selectedMessage.id, e)}
                  >
                     <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactMessagesTab;