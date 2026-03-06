import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Search, Download, Trash2, Eye, ArrowUpDown, X, ExternalLink, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const ApplicationsTab = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterAndSortApplications();
  }, [applications, searchTerm, sortBy, sortOrder]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setErrorState(null);
      
      // Explicitly check for session to ensure we are authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.warn("No active session found when fetching applications");
        // We continue to let the RLS error handler catch the specific 401/403 if needed,
        // or we could throw here.
      }

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      
      let errorMessage = error.message || "Please check console for details.";
      let errorTitle = "Failed to fetch applications";

      // Enhanced RLS error handling
      if (error.code === '42501' || (error.message && error.message.includes('row-level security'))) {
        errorTitle = "Access Denied";
        errorMessage = "You do not have permission to view applications. Please ensure you are logged in as an administrator.";
        setErrorState('access_denied');
      } else {
        setErrorState('generic_error');
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortApplications = () => {
    let filtered = [...applications];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        (app.full_name && app.full_name.toLowerCase().includes(search)) ||
        (app.email && app.email.toLowerCase().includes(search)) ||
        (app.project_name && app.project_name.toLowerCase().includes(search)) ||
        (app.phone && app.phone.includes(search))
      );
    }

    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'created_at') {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      } else {
        aVal = (aVal || '').toString().toLowerCase();
        bVal = (bVal || '').toString().toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredApplications(filtered);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setApplications(applications.map(app =>
        app.id === id ? { ...app, status: newStatus } : app
      ));

      if (selectedApplication?.id === id) {
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      }

      toast({
        title: "Status updated successfully",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setApplications(applications.filter(app => app.id !== id));
      setIsModalOpen(false);
      toast({
        title: "Application deleted",
      });
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Name', 'Email', 'Phone', 'City', 'Project Name', 'Industry',
      'Project Stage', 'Start Timeline', 'Status', 'Submitted Date'
    ];

    const rows = filteredApplications.map(app => [
      app.full_name || '',
      app.email || '',
      app.phone || '',
      app.city || '',
      app.project_name || '',
      app.industry || '',
      app.project_stage || '',
      app.start_timeline || '',
      app.status || 'new',
      app.created_at ? format(new Date(app.created_at), 'yyyy-MM-dd HH:mm') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const styles = {
      new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      reviewed: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      contacted: 'bg-green-500/20 text-green-300 border-green-500/30',
    };

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${styles[status] || styles.new}`}>
        {status}
      </span>
    );
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#5468E7]" />
      </div>
    );
  }

  if (errorState === 'access_denied') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-[#0D1126] rounded-lg border border-red-500/30 p-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
        <p className="text-gray-400 max-w-md mb-6">
          You do not have permission to view applications. This usually happens if you are not logged in with an administrator account in Supabase.
        </p>
        <Button onClick={fetchApplications} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Applications</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white w-full sm:w-64"
            />
          </div>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-[#0D1126] rounded-lg border border-[#5468E7]/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0A0F1C] border-b border-[#5468E7]/30">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort('full_name')}
                    className="text-gray-300 hover:text-white p-0 h-auto font-semibold"
                  >
                    Name
                    <ArrowUpDown className="ml-2 w-4 h-4" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-left">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort('project_name')}
                    className="text-gray-300 hover:text-white p-0 h-auto font-semibold"
                  >
                    Project
                    <ArrowUpDown className="ml-2 w-4 h-4" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-left hidden md:table-cell">
                  <span className="text-gray-300 font-semibold">Industry</span>
                </th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">
                  <span className="text-gray-300 font-semibold">Contact</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort('created_at')}
                    className="text-gray-300 hover:text-white p-0 h-auto font-semibold"
                  >
                    Date
                    <ArrowUpDown className="ml-2 w-4 h-4" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-left">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort('status')}
                    className="text-gray-300 hover:text-white p-0 h-auto font-semibold"
                  >
                    Status
                    <ArrowUpDown className="ml-2 w-4 h-4" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-center">
                  <span className="text-gray-300 font-semibold">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredApplications.map((app, index) => (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-white">{app.full_name}</td>
                    <td className="px-4 py-3 text-gray-300">{app.project_name}</td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {app.industry}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                      <div className="text-sm">
                        <div>{app.email}</div>
                        <div>{app.phone}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {app.created_at && format(new Date(app.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(app.status)}</td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedApplication(app);
                          setIsModalOpen(true);
                        }}
                        className="text-[#5468E7] hover:bg-[#5468E7]/10"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No applications found
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0D1126] border-[#5468E7]/30 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center justify-between">
                  <span>{selectedApplication.project_name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Status Control */}
                <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300 font-semibold">Change Status:</span>
                  <Select
                    value={selectedApplication.status || 'new'}
                    onValueChange={(value) => handleStatusChange(selectedApplication.id, value)}
                  >
                    <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-[#5468E7] mb-2">Contact Info</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Name:</span> <span className="text-white">{selectedApplication.full_name}</span></div>
                      <div><span className="text-gray-400">Email:</span> <span className="text-white">{selectedApplication.email}</span></div>
                      <div><span className="text-gray-400">Phone:</span> <span className="text-white">{selectedApplication.phone}</span></div>
                      <div><span className="text-gray-400">City:</span> <span className="text-white">{selectedApplication.city}</span></div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-[#5468E7] mb-2">Project Info</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Industry:</span> <span className="text-white">{selectedApplication.industry}</span></div>
                      <div><span className="text-gray-400">Stage:</span> <span className="text-white">{selectedApplication.project_stage}</span></div>
                      <div><span className="text-gray-400">Timeline:</span> <span className="text-white">{selectedApplication.start_timeline}</span></div>
                      <div><span className="text-gray-400">Submitted:</span> <span className="text-white">{selectedApplication.created_at ? format(new Date(selectedApplication.created_at), 'PPpp') : '-'}</span></div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="font-semibold text-[#5468E7] mb-2">Description</h4>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{selectedApplication.description}</p>
                </div>

                {/* Main Goal */}
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="font-semibold text-[#5468E7] mb-2">Main Goal</h4>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{selectedApplication.main_goal}</p>
                </div>

                {/* Links */}
                {selectedApplication.links && selectedApplication.links.length > 0 && (
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-[#5468E7] mb-2">Links</h4>
                    <ul className="space-y-1">
                      {selectedApplication.links.map((link, index) => (
                        <li key={index}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                          >
                            {link}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Participation */}
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="font-semibold text-[#5468E7] mb-2">Participation</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedApplication.participation_types && selectedApplication.participation_types.map((type, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#5468E7]/20 text-[#5468E7] rounded-full text-sm border border-[#5468E7]/30"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  {selectedApplication.participation_details && (
                    <div>
                      <span className="text-gray-400 text-sm">Details:</span>
                      <p className="text-gray-300 text-sm mt-1">{selectedApplication.participation_details}</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedApplication.id)}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationsTab;