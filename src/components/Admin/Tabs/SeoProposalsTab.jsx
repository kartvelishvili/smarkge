import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertTriangle, CheckCircle, Clock, XCircle, FileText, Filter,
  ChevronDown, ChevronUp, Search, Shield, Eye, EyeOff,
  ArrowUpCircle, ArrowRightCircle, ArrowDownCircle, BarChart3,
  Calendar, Undo2, PlayCircle, Loader2, RefreshCw
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────
const STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500', icon: FileText },
  { value: 'awaiting_approval', label: 'Awaiting Approval', color: 'bg-yellow-500', icon: Clock },
  { value: 'approved', label: 'Approved', color: 'bg-green-500', icon: CheckCircle },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500', icon: XCircle },
  { value: 'implemented', label: 'Implemented', color: 'bg-blue-500', icon: PlayCircle },
];

const SEVERITIES = [
  { value: 'critical', label: 'Critical', color: 'text-red-400', icon: AlertTriangle },
  { value: 'warning', label: 'Warning', color: 'text-yellow-400', icon: AlertTriangle },
  { value: 'info', label: 'Info', color: 'text-blue-400', icon: FileText },
];

const IMPACTS = [
  { value: 'high', label: 'High', color: 'text-green-400', icon: ArrowUpCircle },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400', icon: ArrowRightCircle },
  { value: 'low', label: 'Low', color: 'text-gray-400', icon: ArrowDownCircle },
];

const CATEGORIES = [
  { value: 'technical', label: 'Technical SEO' },
  { value: 'content', label: 'Content' },
  { value: 'performance', label: 'Performance' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'structured-data', label: 'Structured Data' },
];

const PHASES = [
  { value: '30', label: '30-Day (Urgent)' },
  { value: '60', label: '60-Day (Important)' },
  { value: '90', label: '90-Day (Strategic)' },
];

// ─── Helper: badge ──────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = STATUSES.find(x => x.value === status) || STATUSES[0];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${s.color}`}>
      <Icon className="w-3 h-3" /> {s.label}
    </span>
  );
};

const SeverityBadge = ({ severity }) => {
  const s = SEVERITIES.find(x => x.value === severity) || SEVERITIES[2];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${s.color}`}>
      <Icon className="w-3.5 h-3.5" /> {s.label}
    </span>
  );
};

const ImpactBadge = ({ impact }) => {
  const i = IMPACTS.find(x => x.value === impact) || IMPACTS[2];
  const Icon = i.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${i.color}`}>
      <Icon className="w-3.5 h-3.5" /> {i.label}
    </span>
  );
};

// ─── Summary Dashboard ──────────────────────────────────────
const SummaryDashboard = ({ proposals }) => {
  const stats = useMemo(() => {
    const byStatus = {};
    STATUSES.forEach(s => { byStatus[s.value] = 0; });
    const byPhase = { '30': 0, '60': 0, '90': 0 };
    const bySeverity = { critical: 0, warning: 0, info: 0 };
    
    proposals.forEach(p => {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      byPhase[p.phase] = (byPhase[p.phase] || 0) + 1;
      bySeverity[p.severity] = (bySeverity[p.severity] || 0) + 1;
    });
    
    return { byStatus, byPhase, bySeverity, total: proposals.length };
  }, [proposals]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {/* Total */}
      <div className="bg-[#0D1126] border border-[#5468E7]/20 rounded-xl p-4">
        <div className="text-xs text-gray-400">Total Proposals</div>
        <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
      </div>
      {/* Critical */}
      <div className="bg-[#0D1126] border border-red-500/20 rounded-xl p-4">
        <div className="text-xs text-gray-400">Critical Issues</div>
        <div className="text-2xl font-bold text-red-400 mt-1">{stats.bySeverity.critical}</div>
      </div>
      {/* Awaiting */}
      <div className="bg-[#0D1126] border border-yellow-500/20 rounded-xl p-4">
        <div className="text-xs text-gray-400">Awaiting Approval</div>
        <div className="text-2xl font-bold text-yellow-400 mt-1">{stats.byStatus.awaiting_approval}</div>
      </div>
      {/* Implemented */}
      <div className="bg-[#0D1126] border border-green-500/20 rounded-xl p-4">
        <div className="text-xs text-gray-400">Implemented</div>
        <div className="text-2xl font-bold text-green-400 mt-1">{stats.byStatus.implemented}</div>
      </div>

      {/* Phase breakdown */}
      <div className="col-span-2 md:col-span-4 bg-[#0D1126] border border-[#5468E7]/20 rounded-xl p-4">
        <div className="text-xs text-gray-400 mb-3">Phase Progress</div>
        <div className="flex gap-6 flex-wrap">
          {PHASES.map(phase => {
            const count = stats.byPhase[phase.value];
            const implemented = proposals.filter(p => p.phase === phase.value && p.status === 'implemented').length;
            const pct = count > 0 ? Math.round((implemented / count) * 100) : 0;
            return (
              <div key={phase.value} className="flex-1 min-w-[120px]">
                <div className="text-sm text-white font-medium">{phase.label}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-[#1a1f3a] rounded-full overflow-hidden">
                    <div className="h-full bg-[#5468E7] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{implemented}/{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Proposal Detail View ───────────────────────────────────
const ProposalDetail = ({ proposal, onStatusChange, updating }) => {
  const [notes, setNotes] = useState(proposal.admin_notes || '');
  const [showNotesInput, setShowNotesInput] = useState(false);

  const handleApprove = () => onStatusChange(proposal.id, 'approved', notes);
  const handleReject = () => onStatusChange(proposal.id, 'rejected', notes);
  const handleImplement = () => onStatusChange(proposal.id, 'implemented', notes);
  const handleSubmitForApproval = () => onStatusChange(proposal.id, 'awaiting_approval', notes);
  const handleRevert = () => onStatusChange(proposal.id, 'draft', notes);

  return (
    <div className="bg-[#111633] border border-[#5468E7]/10 rounded-xl p-5 mt-2 space-y-4">
      {/* Metadata row */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Phase: {PHASES.find(p => p.value === proposal.phase)?.label}</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ETA: {proposal.eta_days} day(s)</span>
        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Risk: <span className={proposal.risk === 'high' ? 'text-red-400' : proposal.risk === 'medium' ? 'text-yellow-400' : 'text-green-400'}>{proposal.risk}</span></span>
        <span className="flex items-center gap-1">{proposal.visual_change_required ? <Eye className="w-3 h-3 text-yellow-400" /> : <EyeOff className="w-3 h-3 text-green-400" />} {proposal.visual_change_required ? 'Visual Change' : 'No Visual Change'}</span>
      </div>

      {/* Issue */}
      <div>
        <Label className="text-gray-400 text-xs">Problem</Label>
        <p className="text-gray-200 text-sm mt-1">{proposal.issue}</p>
      </div>

      {/* Technical Change */}
      <div>
        <Label className="text-gray-400 text-xs">Technical Change</Label>
        <pre className="text-gray-200 text-sm mt-1 bg-[#0A0F1C] p-3 rounded-lg whitespace-pre-wrap font-mono text-xs max-h-48 overflow-y-auto">{proposal.technical_change}</pre>
      </div>

      {/* SEO Impact */}
      <div>
        <Label className="text-gray-400 text-xs">Expected SEO Impact</Label>
        <p className="text-gray-200 text-sm mt-1">{proposal.expected_seo_impact}</p>
      </div>

      {/* Rollback Plan */}
      {proposal.rollback_plan && (
        <div>
          <Label className="text-gray-400 text-xs flex items-center gap-1"><Undo2 className="w-3 h-3" /> Rollback Plan</Label>
          <p className="text-gray-300 text-sm mt-1">{proposal.rollback_plan}</p>
        </div>
      )}

      {/* Visual Options */}
      {proposal.visual_change_required && proposal.visual_options?.length > 0 && (
        <div>
          <Label className="text-gray-400 text-xs">Visual Options (A/B/C)</Label>
          <div className="mt-2 space-y-2">
            {proposal.visual_options.map((opt, i) => (
              <div key={i} className="bg-[#0A0F1C] p-3 rounded-lg border border-[#5468E7]/10">
                <span className="text-xs font-bold text-[#5468E7]">Option {String.fromCharCode(65 + i)}:</span>
                <p className="text-sm text-gray-300 mt-1">{opt.description || opt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Notes */}
      <div>
        <button onClick={() => setShowNotesInput(!showNotesInput)} className="text-xs text-[#5468E7] hover:underline flex items-center gap-1">
          <FileText className="w-3 h-3" /> {showNotesInput ? 'Hide notes' : 'Add notes'}
        </button>
        {showNotesInput && (
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Admin notes (optional)..."
            className="mt-2 w-full bg-[#0A0F1C] border border-[#5468E7]/20 rounded-lg p-3 text-sm text-gray-200 resize-none h-20"
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#5468E7]/10">
        {proposal.status === 'draft' && (
          <Button size="sm" onClick={handleSubmitForApproval} disabled={updating} className="bg-yellow-600 hover:bg-yellow-700 text-white">
            {updating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Clock className="w-3 h-3 mr-1" />} Submit for Approval
          </Button>
        )}
        {proposal.status === 'awaiting_approval' && (
          <>
            <Button size="sm" onClick={handleApprove} disabled={updating} className="bg-green-600 hover:bg-green-700 text-white">
              {updating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />} Approve
            </Button>
            <Button size="sm" onClick={handleReject} disabled={updating} className="bg-red-600 hover:bg-red-700 text-white">
              {updating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <XCircle className="w-3 h-3 mr-1" />} Reject
            </Button>
          </>
        )}
        {proposal.status === 'approved' && (
          <Button size="sm" onClick={handleImplement} disabled={updating} className="bg-blue-600 hover:bg-blue-700 text-white">
            {updating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <PlayCircle className="w-3 h-3 mr-1" />} Mark Implemented
          </Button>
        )}
        {(proposal.status === 'rejected' || proposal.status === 'implemented') && (
          <Button size="sm" variant="outline" onClick={handleRevert} disabled={updating} className="border-gray-600 text-gray-300 hover:bg-[#1a1f3a]">
            {updating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Undo2 className="w-3 h-3 mr-1" />} Revert to Draft
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────
const SeoProposalsTab = () => {
  const { toast } = useToast();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterPhase, setFilterPhase] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Fetch ────────────────────────────────────────────────
  const fetchProposals = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('seo_proposals')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setProposals(data || []);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProposals();

    const channel = supabase
      .channel('seo_proposals_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seo_proposals' }, () => {
        fetchProposals();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchProposals]);

  // ─── Status Change ────────────────────────────────────────
  const handleStatusChange = async (id, newStatus, notes) => {
    setUpdating(true);
    try {
      const updateData = { status: newStatus };
      if (notes !== undefined) updateData.admin_notes = notes;

      const { error } = await supabase
        .from('seo_proposals')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setProposals(prev => prev.map(p => p.id === id ? { ...p, ...updateData } : p));
      toast({ title: 'Status Updated', description: `Proposal moved to "${STATUSES.find(s => s.value === newStatus)?.label}"` });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  // ─── Filtered list ────────────────────────────────────────
  const filtered = useMemo(() => {
    return proposals.filter(p => {
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      if (filterSeverity !== 'all' && p.severity !== filterSeverity) return false;
      if (filterPhase !== 'all' && p.phase !== filterPhase) return false;
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.proposal_id.toLowerCase().includes(q) ||
          p.page.toLowerCase().includes(q) ||
          p.issue.toLowerCase().includes(q) ||
          p.technical_change.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [proposals, filterStatus, filterSeverity, filterPhase, filterCategory, searchQuery]);

  // Sort: critical first, then by phase
  const sorted = useMemo(() => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    const phaseOrder = { '30': 0, '60': 1, '90': 2 };
    return [...filtered].sort((a, b) => {
      if (severityOrder[a.severity] !== severityOrder[b.severity])
        return severityOrder[a.severity] - severityOrder[b.severity];
      return phaseOrder[a.phase] - phaseOrder[b.phase];
    });
  }, [filtered]);

  if (loading) {
    return (
      <Card className="bg-[#0D1126] border-[#5468E7]/30">
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#5468E7] animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0D1126] border-[#5468E7]/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#5468E7]" />
            SEO Improvement Proposals
          </CardTitle>
          <Button size="sm" variant="outline" onClick={fetchProposals} className="border-[#5468E7]/30 text-gray-300 hover:bg-[#5468E7]/10">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          No approval — no visual change. Review, approve, and track all SEO improvements.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dashboard */}
        <SummaryDashboard proposals={proposals} />

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search proposals..."
              className="pl-9 bg-[#0A0F1C] border-[#5468E7]/20 text-gray-200 h-9"
            />
          </div>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-[#0A0F1C] border border-[#5468E7]/20 rounded-md px-2 h-9 text-xs text-gray-300">
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="bg-[#0A0F1C] border border-[#5468E7]/20 rounded-md px-2 h-9 text-xs text-gray-300">
            <option value="all">All Severities</option>
            {SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <select value={filterPhase} onChange={e => setFilterPhase(e.target.value)} className="bg-[#0A0F1C] border border-[#5468E7]/20 rounded-md px-2 h-9 text-xs text-gray-300">
            <option value="all">All Phases</option>
            {PHASES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>

          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-[#0A0F1C] border border-[#5468E7]/20 rounded-md px-2 h-9 text-xs text-gray-300">
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          {(filterStatus !== 'all' || filterSeverity !== 'all' || filterPhase !== 'all' || filterCategory !== 'all' || searchQuery) && (
            <button
              onClick={() => { setFilterStatus('all'); setFilterSeverity('all'); setFilterPhase('all'); setFilterCategory('all'); setSearchQuery(''); }}
              className="text-xs text-[#5468E7] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="text-xs text-gray-500">
          Showing {sorted.length} of {proposals.length} proposals
        </div>

        {/* Proposals List */}
        <div className="space-y-2">
          {sorted.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No proposals found</p>
            </div>
          ) : (
            sorted.map(proposal => {
              const isExpanded = expandedId === proposal.id;
              return (
                <div key={proposal.id} className="bg-[#0A0F1C] border border-[#5468E7]/10 rounded-xl overflow-hidden hover:border-[#5468E7]/25 transition-colors">
                  {/* Row header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : proposal.id)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3"
                  >
                    {/* Proposal ID */}
                    <span className="text-xs font-mono text-[#5468E7] w-20 shrink-0">{proposal.proposal_id}</span>

                    {/* Severity */}
                    <div className="w-20 shrink-0"><SeverityBadge severity={proposal.severity} /></div>

                    {/* Page + Issue */}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-500">{proposal.page}</span>
                      <p className="text-sm text-gray-200 truncate">{proposal.issue}</p>
                    </div>

                    {/* Impact */}
                    <div className="w-20 shrink-0 hidden md:block"><ImpactBadge impact={proposal.impact} /></div>

                    {/* Visual? */}
                    <div className="w-8 shrink-0 hidden md:flex justify-center">
                      {proposal.visual_change_required ? (
                        <Eye className="w-4 h-4 text-yellow-400" title="Visual change required" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-green-400/50" title="No visual change" />
                      )}
                    </div>

                    {/* Category badge */}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#5468E7]/10 text-[#5468E7] hidden lg:inline-block">
                      {CATEGORIES.find(c => c.value === proposal.category)?.label}
                    </span>

                    {/* Status */}
                    <div className="w-36 shrink-0 hidden sm:block"><StatusBadge status={proposal.status} /></div>

                    {/* Expand */}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <ProposalDetail proposal={proposal} onStatusChange={handleStatusChange} updating={updating} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SeoProposalsTab;
