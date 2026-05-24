import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  User, Mail, Shield, LogOut, CheckCircle2, AlertTriangle, Loader2, Sparkles, 
  Briefcase, Phone, Plus, MessageSquare, Send, Globe, Award, CreditCard, Clock, Activity,
  Save
} from 'lucide-react';
import { authClient } from '../lib/auth-client';

interface DashboardPortalProps {
  initialUser: {
    id: string;
    name: string;
    email: string;
    role: 'lead' | 'contact' | 'client';
    image?: string;
  };
}

export function DashboardPortal({ initialUser }: DashboardPortalProps) {
  const [user, setUser] = useState(initialUser);
  const [activeMenu, setActiveMenu] = useState<'overview' | 'workspace'>('overview');

  // Leads State
  const [leads, setLeads] = useState<any[]>([]);
  const [leadPhone, setLeadPhone] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadNotes, setLeadNotes] = useState('');
  const [isLeadsLoading, setIsLeadsLoading] = useState(false);

  // Contacts State
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isContactsLoading, setIsContactsLoading] = useState(false);

  // Clients State
  const [clients, setClients] = useState<any[]>([]);
  const [clientCompany, setClientCompany] = useState('');
  const [clientWebsite, setClientWebsite] = useState('');
  const [clientTier, setClientTier] = useState<'free' | 'basic' | 'premium'>('free');
  const [isClientsLoading, setIsClientsLoading] = useState(false);

  // Global UI State
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/dashboard/login';
  };

  // Fetch data depending on user role
  const fetchRoleData = async () => {
    if (user.role === 'lead') {
      setIsLeadsLoading(true);
      try {
        const res = await fetch('/api/leads');
        const resData = await res.json();
        if (resData.success) setLeads(resData.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLeadsLoading(false);
      }
    } else if (user.role === 'contact') {
      setIsContactsLoading(true);
      try {
        const res = await fetch('/api/contacts');
        const resData = await res.json();
        if (resData.success) setContacts(resData.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsContactsLoading(false);
      }
    } else if (user.role === 'client') {
      setIsClientsLoading(true);
      try {
        const res = await fetch('/api/clients');
        const resData = await res.json();
        if (resData.success) {
          setClients(resData.data);
          if (resData.data.length > 0) {
            setClientCompany(resData.data[0].companyName || '');
            setClientWebsite(resData.data[0].website || '');
            setClientTier(resData.data[0].tier || 'free');
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsClientsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchRoleData();
  }, [user.role]);

  // Lead Submit Handler
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: leadPhone, company: leadCompany, notes: leadNotes }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Lead submitted successfully!', 'success');
        setLeadPhone('');
        setLeadCompany('');
        setLeadNotes('');
        fetchRoleData();
      } else {
        showToast(data.error || 'Failed to submit lead', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Contact Submit Handler
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: contactPhone, subject: contactSubject, message: contactMessage }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Inquiry submitted successfully!', 'success');
        setContactPhone('');
        setContactSubject('');
        setContactMessage('');
        fetchRoleData();
      } else {
        showToast(data.error || 'Failed to submit inquiry', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Client Submit Handler
  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: clientCompany, website: clientWebsite, tier: clientTier }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Profile updated successfully!', 'success');
        fetchRoleData();
      } else {
        showToast(data.error || 'Failed to update client profile', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl transition-all duration-300 animate-slide-in ${
          toast.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300 backdrop-blur' 
            : 'bg-rose-950/80 border-rose-800 text-rose-300 backdrop-blur'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <AlertTriangle className="h-5 w-5 text-rose-400" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Sidebar Panel */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-900 bg-slate-900/20 backdrop-blur flex flex-col flex-shrink-0">
        <div className="h-16 border-b border-slate-900 px-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-400 animate-pulse" />
          <span className="font-extrabold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent text-lg">Maybesoft</span>
        </div>

        {/* User Card */}
        <div className="p-6 border-b border-slate-900 bg-slate-900/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow shadow-cyan-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-sm text-slate-100 truncate">{user.name}</div>
              <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 font-mono uppercase">
                <Shield className="h-3 w-3 text-cyan-400" /> {user.role}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveMenu('overview')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeMenu === 'overview' 
                ? 'bg-slate-900 border border-slate-800 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/35 border border-transparent'
            }`}
          >
            <Activity className="h-4.5 w-4.5" /> Overview
          </button>
          
          <button 
            onClick={() => setActiveMenu('workspace')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeMenu === 'workspace' 
                ? 'bg-slate-900 border border-slate-800 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/35 border border-transparent'
            }`}
          >
            <Briefcase className="h-4.5 w-4.5" /> Active Workspace
          </button>
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/40">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 py-3 rounded-xl transition-all"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-900 px-8 flex items-center justify-between">
          <h2 className="font-extrabold text-white tracking-tight capitalize">{activeMenu} Area</h2>
          <div className="text-xs text-slate-500 font-mono">Session Secure</div>
        </header>

        {/* Dynamic Screen rendering */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* SCREEN 1: OVERVIEW */}
          {activeMenu === 'overview' && (
            <div className="space-y-6 max-w-4xl">
              {/* Welcome banner */}
              <div className="relative overflow-hidden rounded-3xl border border-slate-900 bg-slate-900/30 p-8 shadow">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-indigo-500/5"></div>
                <div className="relative z-10 space-y-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Portal Overview</span>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome, {user.name}!</h1>
                  <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                    You are logged in as a <strong className="text-cyan-300 font-semibold capitalize">{user.role}</strong>. Under the active workspace tab, you can manage your operations, view records, and configure settings.
                  </p>
                </div>
              </div>

              {/* Stats Widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="border-slate-900 bg-slate-900/20 backdrop-blur">
                  <CardHeader className="pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Role</span>
                  </CardHeader>
                  <CardContent className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-cyan-950/40 border border-cyan-800 text-cyan-400 flex items-center justify-center">
                      <Shield className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-black capitalize text-slate-200">{user.role}</span>
                  </CardContent>
                </Card>

                <Card className="border-slate-900 bg-slate-900/20 backdrop-blur">
                  <CardHeader className="pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Contact</span>
                  </CardHeader>
                  <CardContent className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-950/40 border border-indigo-800 text-indigo-400 flex items-center justify-center">
                      <Mail className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-slate-300 font-mono truncate max-w-[150px]">{user.email}</span>
                  </CardContent>
                </Card>

                <Card className="border-slate-900 bg-slate-900/20 backdrop-blur">
                  <CardHeader className="pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Workspace Records</span>
                  </CardHeader>
                  <CardContent className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-950/40 border border-purple-800 text-purple-400 flex items-center justify-center">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-black text-slate-200">
                      {user.role === 'lead' ? leads.length : user.role === 'contact' ? contacts.length : clients.length}
                    </span>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* SCREEN 2: WORKSPACE (ROLE-SPECIFIC) */}
          {activeMenu === 'workspace' && (
            <div className="max-w-4xl space-y-8">
              
              {/* --- WORKSPACE FOR ROLE: LEAD --- */}
              {user.role === 'lead' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Lead Submission Form */}
                  <div className="space-y-6">
                    <Card className="border-slate-800 bg-slate-900/40 shadow-xl rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                          <Plus className="h-5 w-5 text-cyan-400" /> Log Business Lead
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleLeadSubmit} className="space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="leadPhone" className="text-xs text-slate-400">Phone Number</Label>
                            <Input 
                              id="leadPhone"
                              value={leadPhone}
                              onChange={(e) => setLeadPhone(e.target.value)}
                              placeholder="+353 89 430 3043"
                              className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-cyan-500/50 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="leadCompany" className="text-xs text-slate-400">Company Name</Label>
                            <Input 
                              id="leadCompany"
                              value={leadCompany}
                              onChange={(e) => setLeadCompany(e.target.value)}
                              placeholder="Acme Corporation"
                              className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-cyan-500/50 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="leadNotes" className="text-xs text-slate-400">Initial Project Notes</Label>
                            <Textarea 
                              id="leadNotes"
                              value={leadNotes}
                              onChange={(e) => setLeadNotes(e.target.value)}
                              placeholder="Looking to build a premium Astro site with GitHub CMS..."
                              className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-cyan-500/50 rounded-xl min-h-[100px]"
                            />
                          </div>

                          <Button type="submit" disabled={actionLoading} className="w-full h-11 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl border-none shadow transition-all flex items-center justify-center gap-2">
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4.5 w-4.5" />}
                            Submit Lead Request
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Leads Data Table */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      Your Registered Leads
                    </h3>
                    
                    {isLeadsLoading ? (
                      <div className="flex py-10 justify-center text-slate-500"><Loader2 className="animate-spin h-6 w-6 text-slate-600" /></div>
                    ) : leads.length === 0 ? (
                      <div className="text-slate-500 border border-dashed border-slate-800/80 p-8 rounded-2xl text-center text-xs">No leads registered yet. Submit the form on the left!</div>
                    ) : (
                      <div className="space-y-3.5">
                        {leads.map(lead => (
                          <div key={lead.id} className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 hover:border-slate-800 transition-all space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200 text-sm">{lead.company || 'Personal Project'}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                                lead.status === 'new' ? 'bg-cyan-950 border-cyan-800 text-cyan-300' : 'bg-emerald-950 border-emerald-800 text-emerald-300'
                              }`}>{lead.status}</span>
                            </div>
                            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-slate-500" /> {lead.phone || 'No phone provided'}
                            </div>
                            {lead.notes && <div className="text-xs text-slate-500 bg-slate-950/40 p-2.5 rounded-lg italic leading-relaxed">{lead.notes}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- WORKSPACE FOR ROLE: CONTACT --- */}
              {user.role === 'contact' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Contact Form */}
                  <div className="space-y-6">
                    <Card className="border-slate-800 bg-slate-900/40 shadow-xl rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-indigo-400" /> Send Support Message
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="contactPhone" className="text-xs text-slate-400">Phone</Label>
                            <Input 
                              id="contactPhone"
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              placeholder="+353 89 430 3043"
                              className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-indigo-500/50 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="contactSubject" className="text-xs text-slate-400">Subject</Label>
                            <Input 
                              id="contactSubject"
                              value={contactSubject}
                              onChange={(e) => setContactSubject(e.target.value)}
                              placeholder="API Billing Issue"
                              required
                              className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-indigo-500/50 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="contactMessage" className="text-xs text-slate-400">Message Body</Label>
                            <Textarea 
                              id="contactMessage"
                              value={contactMessage}
                              onChange={(e) => setContactMessage(e.target.value)}
                              placeholder="Detail your question..."
                              required
                              className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-indigo-500/50 rounded-xl min-h-[100px]"
                            />
                          </div>

                          <Button type="submit" disabled={actionLoading} className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl border-none shadow transition-all flex items-center justify-center gap-2">
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
                            Send Inquiry
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Support History */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      Support Ticket History
                    </h3>

                    {isContactsLoading ? (
                      <div className="flex py-10 justify-center text-slate-500"><Loader2 className="animate-spin h-6 w-6 text-slate-600" /></div>
                    ) : contacts.length === 0 ? (
                      <div className="text-slate-500 border border-dashed border-slate-800/80 p-8 rounded-2xl text-center text-xs">No inquiries logged yet. Write a message on the left!</div>
                    ) : (
                      <div className="space-y-3.5">
                        {contacts.map(ticket => (
                          <div key={ticket.id} className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 hover:border-slate-800 transition-all space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200 text-sm">{ticket.subject}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                                ticket.status === 'pending' ? 'bg-amber-950 border-amber-900 text-amber-300' : 'bg-emerald-950 border-emerald-800 text-emerald-300'
                              }`}>{ticket.status}</span>
                            </div>
                            <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg">{ticket.message}</div>
                            <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono pt-1">
                              <span>Phone: {ticket.phone || 'N/A'}</span>
                              <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- WORKSPACE FOR ROLE: CLIENT --- */}
              {user.role === 'client' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Client Settings */}
                  <div className="space-y-6">
                    <Card className="border-slate-800 bg-slate-900/40 shadow-xl rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                          <Globe className="h-5 w-5 text-purple-400" /> Corporate Profile Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleClientSubmit} className="space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="clientCompany" className="text-xs text-slate-400">Corporate Name</Label>
                            <Input 
                              id="clientCompany"
                              value={clientCompany}
                              onChange={(e) => setClientCompany(e.target.value)}
                              placeholder="Acme Global Inc"
                              className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-purple-500/50 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="clientWebsite" className="text-xs text-slate-400">Website Address</Label>
                            <Input 
                              id="clientWebsite"
                              value={clientWebsite}
                              onChange={(e) => setClientWebsite(e.target.value)}
                              placeholder="https://acme.org"
                              className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-purple-500/50 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs text-slate-400">Subscription Plan Tier</Label>
                            <div className="grid grid-cols-3 gap-2">
                              {['free', 'basic', 'premium'].map(t => (
                                <button
                                  type="button"
                                  key={t}
                                  onClick={() => setClientTier(t as any)}
                                  className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                                    clientTier === t 
                                      ? 'bg-purple-950 border-purple-500 text-purple-300' 
                                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>

                          <Button type="submit" disabled={actionLoading} className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white rounded-xl border-none shadow transition-all flex items-center justify-center gap-2">
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4.5 w-4.5" />}
                            Update Profile Details
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Plan Details & Billing widget */}
                  <div className="space-y-6">
                    <Card className="border-slate-800 bg-slate-900/30 rounded-2xl overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-4">
                        <Award className="h-10 w-10 text-purple-500/30 animate-pulse" />
                      </div>
                      <CardHeader>
                        <span className="text-[10px] bg-purple-950 border border-purple-900 text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider w-fit">ACTIVE TIER</span>
                        <CardTitle className="text-2xl font-black capitalize text-slate-100">{clientTier} Membership</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-xs text-slate-400">
                        <p className="leading-relaxed">
                          Your account status has been updated in the local cloud architecture. With a <strong className="text-purple-300 capitalize">{clientTier}</strong> tier, you unlock advanced endpoints, API nodes, and optimized load timings.
                        </p>

                        <div className="pt-4 border-t border-slate-900 space-y-2">
                          <div className="flex items-center justify-between">
                            <span>Billing Status</span>
                            <span className="flex items-center gap-1 font-bold text-emerald-400">
                              <CreditCard className="h-4 w-4" /> Paid / Verified
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Cycle Renew Date</span>
                            <span className="flex items-center gap-1 font-bold text-slate-300">
                              <Clock className="h-4 w-4" /> June 24, 2026
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
