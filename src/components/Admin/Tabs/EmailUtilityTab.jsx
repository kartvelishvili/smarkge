import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Mail, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const EmailUtilityTab = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  const handleSendAll = async () => {
    // Close the confirmation dialog
    setIsConfirmOpen(false);
    
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-all-applications');

      if (error) throw error;

      setResult(data);
      
      toast({
        title: "Batch Process Completed",
        description: `Processed ${data.total} applications. Sent: ${data.sent}, Errors: ${data.errors}`,
        className: data.errors > 0 ? "bg-yellow-600 text-white" : "bg-green-600 text-white"
      });

    } catch (error) {
      console.error('Error invoking function:', error);
      toast({
        variant: "destructive",
        title: "Function Invocation Failed",
        description: error.message || "Could not connect to the edge function."
      });
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Email Utilities</h2>
          <p className="text-gray-400">Manage automated email tasks and bulk operations.</p>
        </div>
      </div>

      <Card className="bg-[#0D1126] border-[#5468E7]/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#5468E7]" />
            Bulk Application Resend
          </CardTitle>
          <CardDescription className="text-gray-400">
            This tool fetches all applications from the database and resends the notification email to <strong>info@smarketer.ge</strong>.
            Use this if emails were missed or to migrate data to a new inbox.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-yellow-500 font-semibold text-sm">Warning</h4>
                <p className="text-yellow-200/70 text-sm mt-1">
                  This action will send one email for EVERY application currently in the database. 
                  Ensure the destination inbox (info@smarketer.ge) is ready to receive this volume.
                </p>
              </div>
            </div>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <DialogTrigger asChild>
                <Button 
                  disabled={loading}
                  className="w-full sm:w-auto self-start bg-[#5468E7] hover:bg-[#4355d6] text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Applications...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send All Emails Now
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1A1F36] border-[#5468E7]/30 text-white">
                <DialogHeader>
                  <DialogTitle>Confirm Bulk Email Send</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Are you sure you want to send emails for <strong>ALL</strong> applications in the database? 
                    This might take a while and will send many emails to info@smarketer.ge.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsConfirmOpen(false)} 
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSendAll} 
                    className="bg-[#5468E7] hover:bg-[#4355d6] text-white"
                  >
                    Yes, Send All
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {result && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                {result.error ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{result.error}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <CheckCircle2 className="text-green-500 w-5 h-5" />
                      Operation Summary
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                        <div className="text-2xl font-bold text-white">{result.total}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Total</div>
                      </div>
                      <div className="bg-green-900/20 p-3 rounded border border-green-900/30">
                        <div className="text-2xl font-bold text-green-400">{result.sent}</div>
                        <div className="text-xs text-green-400/70 uppercase tracking-wider">Sent</div>
                      </div>
                      <div className="bg-red-900/20 p-3 rounded border border-red-900/30">
                        <div className="text-2xl font-bold text-red-400">{result.errors}</div>
                        <div className="text-xs text-red-400/70 uppercase tracking-wider">Failed</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailUtilityTab;