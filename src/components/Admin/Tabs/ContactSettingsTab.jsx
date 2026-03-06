import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  Calendar,
  Filter,
  RefreshCw,
  LayoutTemplate,
  CheckCircle2,
  Palette,
  Layout,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ContactSettingsTab = () => {
  const { toast } = useToast();
  
  // Design State
  const [currentStyle, setCurrentStyle] = useState('card');
  const [styleLoading, setStyleLoading] = useState(false);

  // Messages State
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchMessages();

    // Real-time subscription for messages
    const msgSubscription = supabase
      .channel('contact_messages_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgSubscription);
    };
  }, []);

  // --- SETTINGS LOGIC ---
  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('contact_settings')
        .select('design_style')
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setCurrentStyle(data.design_style || 'card');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveStyle = async () => {
    setStyleLoading(true);
    try {
      // First check if row exists
      const { data: existing } = await supabase
        .from('contact_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      let error;
      if (existing) {
        const { error: err } = await supabase
          .from('contact_settings')
          .update({ design_style: currentStyle })
          .eq('id', existing.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('contact_settings')
          .insert([{ design_style: currentStyle }]);
        error = err;
      }

      if (error) throw error;
      toast({ title: "დიზაინი განახლდა", description: "ცვლილებები წარმატებით შეინახა" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "შეცდომა", description: "დიზაინის შენახვა ვერ მოხერხდა" });
    } finally {
      setStyleLoading(false);
    }
  };

  // --- MESSAGES LOGIC ---
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('ნამდვილად გსურთ წაშლა?')) return;
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({ title: "წაშლილია", description: "შეტყობინება წაიშალა." });
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setDetailOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "შეცდომა", description: "ვერ მოხერხდა წაშლა" });
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
      if (selectedMessage?.id === id) setSelectedMessage({ ...selectedMessage, status: newStatus });
      
      toast({ title: "სტატუსი განახლდა", description: `სტატუსი შეიცვალა: ${newStatus}` });
    } catch (error) {
      toast({ variant: "destructive", title: "შეცდომა", description: "სტატუსის განახლება ვერ მოხერხდა" });
    }
  };

  const openMessageDetail = (msg) => {
    setSelectedMessage(msg);
    setDetailOpen(true);
    if (msg.status === 'new') {
      handleUpdateStatus(msg.id, 'read');
    }
  };

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>;
      case 'read': return <Badge variant="outline" className="text-gray-400 border-gray-600">Read</Badge>;
      case 'replied': return <Badge className="bg-green-600 hover:bg-green-700">Replied</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const DesignOption = ({ value, title, description, icon: Icon }) => (
    <div 
      className={`relative cursor-pointer rounded-xl border-2 p-4 hover:bg-white/5 transition-all ${
        currentStyle === value 
          ? 'border-[#5468E7] bg-[#5468E7]/10' 
          : 'border-white/10'
      }`}
      onClick={() => setCurrentStyle(value)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${currentStyle === value ? 'bg-[#5468E7] text-white' : 'bg-white/10 text-gray-400'}`}>
           <Icon className="w-5 h-5" />
        </div>
        {currentStyle === value && (
          <CheckCircle2 className="w-5 h-5 text-[#5468E7]" />
        )}
      </div>
      <h3 className="font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="bg-[#0A0F1C] border border-white/10 p-1">
          <TabsTrigger value="messages" className="data-[state=active]:bg-[#5468E7]">
             <MessageSquare className="w-4 h-4 mr-2" />
             შეტყობინებები
          </TabsTrigger>
          <TabsTrigger value="design" className="data-[state=active]:bg-[#5468E7]">
             <Palette className="w-4 h-4 mr-2" />
             დიზაინი
          </TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="mt-6">
           <div className="bg-[#0A0F1C] border border-white/10 rounded-xl p-8 max-w-4xl">
              <div className="mb-8">
                 <h2 className="text-2xl font-bold text-white mb-2">დიზაინის სტილი</h2>
                 <p className="text-gray-400">აირჩიეთ Contact გვერდის ვიზუალური სტილი</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <DesignOption 
                   value="minimal" 
                   title="Modern Minimal" 
                   description="სუფთა, მარტივი დიზაინი აქცენტით შინაარსზე"
                   icon={Layout}
                 />
                 <DesignOption 
                   value="gradient" 
                   title="Modern Gradient" 
                   description="ფერადი გრადიენტები და თანამედროვე ვიზუალი"
                   icon={LayoutGrid}
                 />
                 <DesignOption 
                   value="card" 
                   title="Modern Card-Based" 
                   description="ბარათული სისტემა, ინფორმაციის მკაფიო დაყოფა"
                   icon={LayoutTemplate}
                 />
              </div>

              <Button 
                onClick={handleSaveStyle} 
                disabled={styleLoading}
                className="bg-[#5468E7] hover:bg-[#4353b8] min-w-[150px]"
              >
                 {styleLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                 შენახვა
              </Button>
           </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-8 mt-6">
          {/* Header & Filters */}
          <div className="bg-[#0A0F1C] border border-white/10 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="bg-[#5468E7]/20 p-3 rounded-xl">
                 <MessageSquare className="w-6 h-6 text-[#5468E7]" />
               </div>
               <div>
                 <h2 className="font-bold text-white text-xl">შეტყობინებები</h2>
                 <p className="text-xs text-gray-400">სულ: {filteredMessages.length}</p>
               </div>
             </div>

             <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                   <Input 
                      placeholder="ძებნა..." 
                      className="pl-9 bg-[#0D1126] border-white/10 text-white focus:border-[#5468E7]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-[#0D1126] border-white/10 text-white">
                    <div className="flex items-center gap-2">
                      <Filter className="w-3 h-3" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#0D1126] border-white/10 text-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                  </SelectContent>
                </Select>
             </div>
          </div>

          {/* Messages Table */}
          <div className="bg-[#0A0F1C] border border-white/10 rounded-xl overflow-hidden shadow-lg">
            <Table>
              <TableHeader className="bg-[#0D1126] border-b border-white/10">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-gray-400 font-medium w-[180px]">თარიღი</TableHead>
                  <TableHead className="text-gray-400 font-medium">სახელი / ელ-ფოსტა</TableHead>
                  <TableHead className="text-gray-400 font-medium">თემა</TableHead>
                  <TableHead className="text-gray-400 font-medium w-[100px]">სტატუსი</TableHead>
                  <TableHead className="text-gray-400 font-medium text-right w-[100px]">მოქმედება</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messagesLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <span>იტვირთება...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredMessages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                      შეტყობინებები არ მოიძებნა
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMessages.map((msg) => (
                    <TableRow 
                      key={msg.id} 
                      className={`border-white/5 transition-colors cursor-pointer group ${
                        msg.status === 'new' ? 'bg-[#5468E7]/5 hover:bg-[#5468E7]/10' : 'hover:bg-white/5'
                      }`}
                      onClick={() => openMessageDetail(msg)}
                    >
                      <TableCell className="text-gray-400 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(msg.created_at), 'dd MMM yyyy')}
                        </div>
                        <div className="ml-5 text-[10px] opacity-60">
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-200 text-sm">{msg.name}</div>
                        <div className="text-xs text-gray-500">{msg.email}</div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-300">
                        {msg.subject}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(msg.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}
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
      </Tabs>

      {/* Message Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-[#0A0F1C] border border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center text-xl">
              <span>შეტყობინების დეტალები</span>
              {selectedMessage && getStatusBadge(selectedMessage.status)}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              მიღებულია: {selectedMessage && format(new Date(selectedMessage.created_at), 'PPpp')}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="mt-4 space-y-6">
              {/* Contact Info Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-[#0D1126] border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs uppercase font-bold">
                    <LayoutTemplate className="w-3 h-3" /> სახელი
                  </div>
                  <div className="text-white font-medium">{selectedMessage.name}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#0D1126] border border-white/5">
                   <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs uppercase font-bold">
                    <Phone className="w-3 h-3" /> ტელეფონი
                  </div>
                  <div className="text-white font-medium font-mono">{selectedMessage.phone || '-'}</div>
                </div>
                <div className="sm:col-span-2 p-3 rounded-lg bg-[#0D1126] border border-white/5 group relative">
                   <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs uppercase font-bold">
                    <Mail className="w-3 h-3" /> ელ-ფოსტა
                  </div>
                  <div className="text-white font-medium font-mono">{selectedMessage.email}</div>
                  <a 
                    href={`mailto:${selectedMessage.email}`}
                    className="absolute right-3 top-3 text-xs bg-[#5468E7] text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Reply
                  </a>
                </div>
              </div>

              {/* Content Card */}
              <div className="p-4 rounded-lg bg-[#0D1126] border border-white/5">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">თემა:</h3>
                <div className="font-medium text-white text-lg mb-4 pb-4 border-b border-white/5">
                  {selectedMessage.subject}
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">შინაარსი:</h3>
                <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <div className="flex gap-2 w-full justify-end">
                  {selectedMessage.status !== 'replied' && (
                    <Button 
                      onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      მონიშვნა პასუხგაცემულად
                    </Button>
                  )}
                  {selectedMessage.status === 'replied' && (
                    <Button 
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedMessage.id, 'read')}
                      className="border-white/10 text-gray-300 hover:text-white"
                    >
                       პასუხის გაუქმება
                    </Button>
                  )}
                  <Button 
                    variant="destructive"
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    წაშლა
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactSettingsTab;