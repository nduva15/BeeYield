
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminService } from '@/services/adminService';
import { toast } from "sonner";
import { Loader2, Search, Filter, Briefcase, Users, Plus, Edit, Trash2, Download, ExternalLink, Calendar, CheckCircle2, RefreshCw, Globe, MapPin, Building2, UserCheck, ShieldCheck } from "lucide-react";
import { format } from 'date-fns';
import { glass, PageHeader, GlassStatCard } from '@/components/beeyield/GlassTheme';
import { cn } from '@/lib/utils';

export function RecruitmentTab() {
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [activeSubTab, setActiveSubTab] = useState('applications');

    // Job Modal State
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<any | null>(null);
    const [jobForm, setJobForm] = useState({
        title: '',
        location: '',
        type: 'full_time',
        department: '',
        description_html: '',
        is_active: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [jobsData, appsData] = await Promise.all([
                adminService.getJobs(),
                adminService.getApplications()
            ]);
            setJobs(jobsData || []);
            setApplications(appsData || []);
        } catch (error) {
            console.error("Failed to load recruitment data:", error);
            toast.error("Failed to load recruitment data");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveJob = async () => {
        try {
            if (editingJob) {
                await adminService.updateJob(editingJob.id, jobForm);
                toast.success("Job updated successfully");
            } else {
                await adminService.createJob(jobForm);
                toast.success("Job created successfully");
            }
            setIsJobModalOpen(false);
            setEditingJob(null);
            setJobForm({
                title: '',
                location: '',
                type: 'full_time',
                department: '',
                description_html: '',
                is_active: true
            });
            loadData();
        } catch (error) {
            toast.error("Failed to save job");
        }
    };

    const handleDeleteJob = async (id: string) => {
        if (confirm("Are you sure you want to delete this job post? It will also affect application records.")) {
            try {
                await adminService.deleteJob(id);
                toast.success("Job deleted");
                loadData();
            } catch (error) {
                toast.error("Failed to delete job");
            }
        }
    };

    const handleUpdateAppStatus = async (id: string, status: string) => {
        try {
            await adminService.updateApplicationStatus(id, status);
            toast.success(`Status updated to ${status}`);
            loadData();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleViewCV = async (resumeUrl: string) => {
        try {
            // Extract the filename from the URL if it's a full URL
            const parts = resumeUrl.split('/');
            const fileName = parts[parts.length - 1];

            const signedUrl = await adminService.getResumeSignedUrl(fileName);
            window.open(signedUrl, '_blank');
        } catch (error) {
            console.error("Failed to generate signed URL:", error);
            toast.error("Could not open resume. Access denied.");
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            applied: 'bg-primary/10 text-primary border-primary/20',
            reviewing: 'bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20',
            interviewed: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
            hired: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            rejected: 'bg-destructive/10 text-destructive border-destructive/20',
        };
        return (
            <Badge variant="outline" className={cn("font-black text-[9px] px-2 py-0.5 rounded-lg uppercase tracking-widest", styles[status] || 'bg-muted/50 text-muted-foreground')}>
                {status}
            </Badge>
        );
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                icon={Briefcase}
                label="Talent"
                title="Recruitment Portal"
                subtitle="End-to-end management of organizational growth and talent acquisition."
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/50 hover:bg-primary/10 transition-all active:scale-95" onClick={loadData}>
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        </Button>
                        {activeSubTab === 'jobs' && (
                            <Button
                                onClick={() => {
                                    setEditingJob(null);
                                    setJobForm({ title: '', location: '', type: 'full_time', department: '', description_html: '', is_active: true });
                                    setIsJobModalOpen(true);
                                }}
                                className="h-10 px-4 rounded-xl bg-primary text-black font-black text-[11px] tracking-widest uppercase hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Initiate Listing
                            </Button>
                        )}
                    </div>
                }
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <GlassStatCard
                    label="Active Positions"
                    value={jobs.filter(j => j.is_active).length}
                    icon={Briefcase}
                />
                <GlassStatCard
                    label="Inbound Talent"
                    value={applications.filter(a => a.status === 'applied').length}
                    icon={Users}
                />
                <GlassStatCard
                    label="Successful Hires"
                    value={applications.filter(a => a.status === 'hired').length}
                    icon={ShieldCheck}
                    color="text-emerald-500"
                />
            </div>

            <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
                <TabsList className="bg-muted/20 p-1 border border-[#F4D03F]/10 rounded-xl mb-8">
                    <TabsTrigger value="applications" className="flex items-center gap-2 rounded-lg px-6 py-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-black font-black text-[10px] tracking-widest uppercase">
                        <Users className="h-4 w-4" />
                        Applications
                    </TabsTrigger>
                    <TabsTrigger value="jobs" className="flex items-center gap-2 rounded-lg px-6 py-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-black font-black text-[10px] tracking-widest uppercase">
                        <Briefcase className="h-4 w-4" />
                        Operations Board
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="applications">
                    <div className={cn(glass.section, "p-0 overflow-hidden")}>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
                                    <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase">Identity</TableHead>
                                    <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase">Target Position</TableHead>
                                    <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-center">Protocol Class</TableHead>
                                    <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-center">Documents</TableHead>
                                    <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-right">Magnitude</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-24 text-center">
                                            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-50" />
                                            <p className="mt-4 font-black text-[10px] tracking-widest text-muted-foreground uppercase">Accessing talent registry...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : applications.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-24 text-center">
                                            <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                                                <Users className="h-8 w-8 text-muted-foreground/30" />
                                            </div>
                                            <p className="font-black text-[10px] tracking-widest text-muted-foreground uppercase">No applications received yet</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    applications.map((app) => (
                                        <TableRow key={app.id} className="hover:bg-muted/10 transition-all border-b border-[#F4D03F]/10 group">
                                            <TableCell className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-[11px] tracking-tighter uppercase text-primary/80">{app.full_name}</span>
                                                    <span className="font-mono text-[9px] opacity-40 uppercase tracking-widest">{app.email}</span>
                                                    <span className="font-mono text-[8px] opacity-30 mt-0.5 tracking-tighter">{app.phone}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-5">
                                                <div className="inline-flex items-center gap-2 rounded-lg px-2 py-1 bg-primary/5 border border-primary/20">
                                                    <Building2 className="h-3 w-3 text-primary/60" />
                                                    <span className="font-black text-[9px] uppercase tracking-widest">{app.jobs?.title || 'GENERAL_QUERY'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-5 text-center">
                                                {getStatusBadge(app.status)}
                                            </TableCell>
                                            <TableCell className="px-6 py-5">
                                                <div className="flex flex-col gap-1.5 items-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 px-3 rounded-lg border-border/50 font-black text-[8px] tracking-widest uppercase hover:bg-primary/10 transition-all"
                                                        onClick={() => handleViewCV(app.resume_url)}
                                                    >
                                                        <Download className="h-3 w-3 mr-1.5" />
                                                        RETRIEVE_CV
                                                    </Button>
                                                    {app.linkedin_url && (
                                                        <a
                                                            href={app.linkedin_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-1 font-black text-[7px] tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity"
                                                        >
                                                            <ExternalLink className="h-2.5 w-2.5" />
                                                            SOCIAL_AUTH
                                                        </a>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-5 text-right">
                                                <Select
                                                    value={app.status}
                                                    onValueChange={(val) => handleUpdateAppStatus(app.id, val)}
                                                >
                                                    <SelectTrigger className="w-[120px] h-8 rounded-lg border-border/50 text-black font-black text-[9px] tracking-widest uppercase bg-primary hover:bg-primary/90 transition-all ml-auto">
                                                        <SelectValue placeholder="ACTION" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border border-[#F4D03F]/10">
                                                        <SelectItem value="reviewing" className="font-black text-[9px] uppercase tracking-widest">Protocol Review</SelectItem>
                                                        <SelectItem value="interviewed" className="font-black text-[9px] uppercase tracking-widest">Interview Gate</SelectItem>
                                                        <SelectItem value="hired" className="font-black text-[9px] uppercase tracking-widest text-emerald-500">Authorize Hire</SelectItem>
                                                        <SelectItem value="rejected" className="font-black text-[9px] uppercase tracking-widest text-destructive">Decline Asset</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="jobs">
                    {loading ? (
                        <div className="flex justify-center p-24">
                            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {jobs.map((job) => (
                                <div key={job.id} className={cn(
                                    glass.section,
                                    "p-6 group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.98]",
                                    !job.is_active && "opacity-60 grayscale-[0.5]"
                                )}>
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant="outline" className={cn(
                                            "font-black text-[8px] tracking-widest px-2 py-0.5 rounded-lg uppercase",
                                            job.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted/50 text-muted-foreground border-border/50"
                                        )}>
                                            {job.is_active ? 'DEPLOYED' : 'QUARANTINE'}
                                        </Badge>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg border-border/50 hover:bg-primary/10 transition-all group-hover:border-primary/30"
                                                onClick={() => {
                                                    setEditingJob(job);
                                                    setJobForm({
                                                        title: job.title,
                                                        location: job.location,
                                                        type: job.type,
                                                        department: job.department,
                                                        description_html: job.description_html,
                                                        is_active: job.is_active
                                                    });
                                                    setIsJobModalOpen(true);
                                                }}
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg border-border/50 text-destructive hover:bg-destructive/10 transition-all"
                                                onClick={() => handleDeleteJob(job.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <h3 className="font-black text-xl tracking-tighter uppercase mb-1 leading-tight">{job.title}</h3>
                                    <div className="flex items-center gap-2 font-mono text-[9px] opacity-40 uppercase tracking-widest mb-6">
                                        <Calendar className="h-3 w-3" />
                                        <span>ESTD: {format(new Date(job.created_at), 'yyyy.MM.dd')}</span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="font-black text-[8px] tracking-widest rounded-lg border-border/50 uppercase">{job.department}</Badge>
                                            <Badge variant="outline" className="font-black text-[8px] tracking-widest rounded-lg border-border/50 uppercase">{job.type.replace('_', ' ')}</Badge>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2 text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5 opacity-40" />
                                            <span className="font-black text-[9px] uppercase tracking-widest">{job.location}</span>
                                        </div>
                                    </div>

                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Job Form Modal */}
            <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
                <DialogContent className="max-w-2xl bg-background/80 backdrop-blur-2xl border-[#F4D03F]/20 rounded-2xl shadow-2xl p-0 overflow-hidden">
                    <div className="p-8 space-y-8 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                                    <Plus className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <div className="font-black text-[10px] uppercase tracking-widest text-[#F4D03F] mb-1 opacity-80">Operational Sync</div>
                                    <DialogTitle className="font-black text-2xl tracking-tighter uppercase leading-none">
                                        {editingJob ? 'Refactor Listing' : 'Initiate Opportunity'}
                                    </DialogTitle>
                                </div>
                            </div>
                            <DialogDescription className="font-bold text-xs uppercase tracking-widest opacity-60">
                                Define the parameters for the talent acquisition protocol.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <Label className="font-black text-[10px] uppercase tracking-widest opacity-50 ml-1">Protocol Title</Label>
                                    <Input
                                        placeholder="e.g. SENIOR BEEKEEPER"
                                        className="h-12 bg-white/5 border-border/50 rounded-xl font-black text-xs uppercase focus:ring-primary focus:border-primary transition-all px-4"
                                        value={jobForm.title}
                                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="font-black text-[10px] uppercase tracking-widest opacity-50 ml-1">Entity Department</Label>
                                    <Input
                                        placeholder="e.g. OPERATIONS"
                                        className="h-12 bg-white/5 border-border/50 rounded-xl font-black text-xs uppercase focus:ring-primary focus:border-primary transition-all px-4"
                                        value={jobForm.department}
                                        onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <Label className="font-black text-[10px] uppercase tracking-widest opacity-50 ml-1">Geospatial Marker</Label>
                                    <Input
                                        placeholder="e.g. NAIROBI, KENYA"
                                        className="h-12 bg-white/5 border-border/50 rounded-xl font-black text-xs uppercase focus:ring-primary focus:border-primary transition-all px-4"
                                        value={jobForm.location}
                                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="font-black text-[10px] uppercase tracking-widest opacity-50 ml-1">Engagement Model</Label>
                                    <Select
                                        value={jobForm.type}
                                        onValueChange={(val) => setJobForm({ ...jobForm, type: val })}
                                    >
                                        <SelectTrigger className="h-12 bg-white/5 border-border/50 rounded-xl font-black text-xs uppercase focus:ring-primary transition-all px-4">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border border-[#F4D03F]/10">
                                            <SelectItem value="full_time" className="font-black text-[10px] uppercase tracking-widest">Full-Spectrum</SelectItem>
                                            <SelectItem value="part_time" className="font-black text-[10px] uppercase tracking-widest">Partial Sync</SelectItem>
                                            <SelectItem value="contract" className="font-black text-[10px] uppercase tracking-widest">Fixed Protocol</SelectItem>
                                            <SelectItem value="internship" className="font-black text-[10px] uppercase tracking-widest text-primary">Bridge Program</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Label className="font-black text-[10px] uppercase tracking-widest opacity-50 ml-1">Mission briefing (RAW_HTML)</Label>
                                <Textarea
                                    placeholder="<h3>Requirements</h3><ul><li>3 years experience</li></ul>"
                                    className="h-48 bg-white/5 border-border/50 rounded-xl font-mono text-[10px] focus:ring-primary focus:border-primary transition-all p-4 resize-none"
                                    value={jobForm.description_html}
                                    onChange={(e) => setJobForm({ ...jobForm, description_html: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="job-active-modal"
                                    checked={jobForm.is_active}
                                    onChange={(e) => setJobForm({ ...jobForm, is_active: e.target.checked })}
                                    className="h-5 w-5 rounded-lg accent-primary cursor-pointer"
                                />
                                <Label htmlFor="job-active-modal" className="font-black text-[11px] uppercase tracking-widest cursor-pointer">Authorize Public Deployment</Label>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 gap-3 flex flex-row">
                            <Button variant="outline" onClick={() => setIsJobModalOpen(false)} className="h-12 px-8 rounded-xl border-border/50 font-black text-[11px] tracking-widest uppercase transition-all flex-1">
                                Abort
                            </Button>
                            <Button onClick={handleSaveJob} className="h-12 px-8 rounded-xl bg-primary text-black font-black text-[11px] tracking-widest uppercase hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex-1">
                                {editingJob ? 'Update Protocol' : 'Finalize Deployment'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

