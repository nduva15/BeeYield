
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Loader2, Search, Filter, Briefcase, Users, Plus, Edit, Trash2, Download, ExternalLink, Calendar, CheckCircle2 } from "lucide-react";
import { format } from 'date-fns';

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
        const statuses: Record<string, string> = {
            applied: 'bg-blue-100 text-blue-800 border-blue-200',
            reviewing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            interviewed: 'bg-purple-100 text-purple-800 border-purple-200',
            hired: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
        };
        return (
            <Badge variant="outline" className={statuses[status] || 'bg-gray-100'}>
                {status}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        <Briefcase className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{jobs.filter(j => j.is_active).length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {jobs.length} total job listings
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Applications</CardTitle>
                        <Users className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{applications.filter(a => a.status === 'applied').length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Await review
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hiring Success</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{applications.filter(a => a.status === 'hired').length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Candidates hired this year
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="applications" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Applications
                        </TabsTrigger>
                        <TabsTrigger value="jobs" className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Job Board
                        </TabsTrigger>
                    </TabsList>

                    {activeSubTab === 'jobs' && (
                        <Button
                            onClick={() => {
                                setEditingJob(null);
                                setJobForm({ title: '', location: '', type: 'full_time', department: '', description_html: '', is_active: true });
                                setIsJobModalOpen(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Post New Job
                        </Button>
                    )}
                </div>

                <TabsContent value="applications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Candidates & Applications</CardTitle>
                            <CardDescription>Manage incoming applications and candidate progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            ) : applications.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    No applications received yet.
                                </div>
                            ) : (
                                <div className="rounded-md border overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Candidate</TableHead>
                                                <TableHead>Job Title</TableHead>
                                                <TableHead>Applied Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Resume</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {applications.map((app) => (
                                                <TableRow key={app.id}>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-blue-900">{app.full_name}</span>
                                                            <span className="text-xs text-muted-foreground">{app.email}</span>
                                                            <span className="text-xs text-muted-foreground">{app.phone}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="font-normal">
                                                            {app.jobs?.title || 'Unknown Job'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {format(new Date(app.created_at), 'MMM d, yyyy')}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
                                                            onClick={() => handleViewCV(app.resume_url)}
                                                        >
                                                            <Download className="h-4 w-4 mr-1 text-blue-400" />
                                                            View CV
                                                        </Button>
                                                        {app.linkedin_url && (
                                                            <div className="mt-1">
                                                                <a
                                                                    href={app.linkedin_url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-xs text-muted-foreground hover:text-blue-600 flex items-center"
                                                                >
                                                                    <ExternalLink className="h-3 w-3 mr-1" />
                                                                    LinkedIn
                                                                </a>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Select
                                                            value={app.status}
                                                            onValueChange={(val) => handleUpdateAppStatus(app.id, val)}
                                                        >
                                                            <SelectTrigger className="w-[130px] h-8 text-xs ml-auto">
                                                                <SelectValue placeholder="Action" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="reviewing">Reviewing</SelectItem>
                                                                <SelectItem value="interviewed">Interviewed</SelectItem>
                                                                <SelectItem value="hired">Hire</SelectItem>
                                                                <SelectItem value="rejected">Reject</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="jobs">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Board Management</CardTitle>
                            <CardDescription>Manage job listings displayed on the careers page</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {jobs.map((job) => (
                                        <Card key={job.id} className={`overflow-hidden border-l-4 ${job.is_active ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <Badge variant={job.is_active ? "default" : "secondary"} className={job.is_active ? "bg-green-100 text-green-800" : ""}>
                                                        {job.is_active ? 'Active' : 'Draft'}
                                                    </Badge>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-600"
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
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600"
                                                            onClick={() => handleDeleteJob(job.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <CardTitle className="text-lg mt-2">{job.title}</CardTitle>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(job.created_at), 'MMM d, yyyy')}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="text-sm">
                                                <div className="space-y-1 text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="font-normal">{job.department}</Badge>
                                                        <Badge variant="outline" className="font-normal">{job.type}</Badge>
                                                    </div>
                                                    <p className="pt-2">{job.location}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Job Form Modal */}
            <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingJob ? 'Edit Job Posting' : 'Post New Career Opportunity'}</DialogTitle>
                        <DialogDescription>
                            Fill in the details for the job listing. Description supports basic HTML.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="job-title">Job Title</Label>
                                <Input
                                    id="job-title"
                                    placeholder="e.g. Senior Beekeeper"
                                    value={jobForm.title}
                                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="job-dept">Department</Label>
                                <Input
                                    id="job-dept"
                                    placeholder="e.g. Operations"
                                    value={jobForm.department}
                                    onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="job-loc">Location</Label>
                                <Input
                                    id="job-loc"
                                    placeholder="e.g. Nairobi, Kenya"
                                    value={jobForm.location}
                                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="job-type">Employment Type</Label>
                                <Select
                                    value={jobForm.type}
                                    onValueChange={(val) => setJobForm({ ...jobForm, type: val })}
                                >
                                    <SelectTrigger id="job-type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full_time">Full-time</SelectItem>
                                        <SelectItem value="part_time">Part-time</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="internship">Internship</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="job-desc">Job Description (HTML)</Label>
                            <Textarea
                                id="job-desc"
                                placeholder="<h3>Requirements</h3><ul><li>3 years experience</li></ul>"
                                className="h-48 font-mono text-xs"
                                value={jobForm.description_html}
                                onChange={(e) => setJobForm({ ...jobForm, description_html: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="job-active"
                                checked={jobForm.is_active}
                                onChange={(e) => setJobForm({ ...jobForm, is_active: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="job-active">Publicly Visible (Active)</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsJobModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveJob} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {editingJob ? 'Update Listing' : 'Publish Opportunity'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
