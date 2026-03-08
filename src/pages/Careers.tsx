
import { MapPin, Globe, Heart, Zap, Database, Cpu, Sun, Users, Compass, Briefcase, ArrowRight, ArrowLeft, Upload, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import beeyieldService from "@/services/beeyieldService";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description_html: string;
  salary_range: string;
  is_active: boolean;
  posted_at: string;
}

const Careers = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Fallback to static data
      setJobs([
        {
          id: "1",
          title: "Senior Agronomist",
          department: "Operations",
          location: "Nairobi, Kenya",
          type: "Full-time",
          description_html: "<p>Lead field operations and ensure hive health across our apiary network.</p><h3>Responsibilities</h3><ul><li>Monitor 50+ hives</li><li>Data collection</li></ul>",
          salary_range: "KES 150,000 - 200,000",
          is_active: true,
          posted_at: new Date().toISOString()
        },
        {
          id: "2",
          title: "Software Engineer",
          department: "Tech",
          location: "Nairobi (Remote)",
          type: "Full-time",
          description_html: "<p>Build the future of agri-tech with React and Python.</p>",
          salary_range: "KES 120,000 - 180,000",
          is_active: true,
          posted_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      setResume(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!resume) {
      toast.error("Please upload your resume");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('job_id', selectedJob.id);
      formData.append('full_name', fullName);
      formData.append('email', email);
      formData.append('phone', phone);
      if (linkedin) {
        formData.append('linkedin_url', linkedin);
      }
      formData.append('resume', resume);

      const { error } = await beeyieldService.submitJobApplication(formData);

      if (error) throw error;

      setUploadSuccess(true);
      toast.success("Application received! We will contact you shortly.");

      setFullName("");
      setEmail("");
      setPhone("");
      setLinkedin("");
      setResume(null);

    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-[#fdfbf6] py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => { setSelectedJob(null); setUploadSuccess(false); }}
            className="mb-8 hover:bg-beeyield-gold/5 group text-slate-900 font-black uppercase text-[10px] tracking-widest"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Careers
          </Button>

          {uploadSuccess ? (
            <Card className="max-w-md mx-auto text-center py-16 border-4 border-beeyield-green rounded-[3rem] bg-white shadow-2xl">
              <CardContent>
                <div className="flex justify-center mb-8">
                  <div className="h-24 w-24 bg-beeyield-green rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase text-slate-900">Mission Accepted.</h2>
                <p className="text-slate-500 mb-10 font-medium">
                  Thanks for applying to be a <span className="text-beeyield-green font-bold">{selectedJob.title}</span>.
                  We've received your credentials and will be in touch.
                </p>
                <Button className="bg-slate-900 text-white rounded-2xl h-14 px-10 font-black shadow-xl" onClick={() => { setSelectedJob(null); setUploadSuccess(false); }}>
                  Browse More Roles
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Left Column: Job Description */}
              <div className="lg:col-span-8 space-y-10">
                <div>
                  <Badge variant="outline" className="mb-4 border-beeyield-gold/30 text-beeyield-gold bg-beeyield-gold/5 font-black uppercase tracking-[0.2em] text-[10px]">
                    {selectedJob.department} Node
                  </Badge>
                  <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-none">{selectedJob.title}</h1>
                  <div className="flex flex-wrap gap-6 text-slate-500">
                    <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
                      <MapPin className="h-3 w-3 text-beeyield-green" /> {selectedJob.location}
                    </div>
                    <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
                      <Briefcase className="h-3 w-3 text-beeyield-gold" /> {selectedJob.type}
                    </div>
                  </div>
                </div>

                <div className="rounded-[2.5rem] bg-white border border-slate-100 shadow-soft p-10 prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:font-medium">
                  <div dangerouslySetInnerHTML={{ __html: selectedJob.description_html }} />
                </div>
              </div>

              {/* Right Column: Sticky Application Form */}
              <div className="lg:col-span-4">
                <div className="sticky top-8">
                  <Card className="border-4 border-slate-900 rounded-[2.5rem] bg-white shadow-2xl overflow-hidden">
                    <div className="bg-slate-900 p-8 text-white">
                      <h3 className="text-xl font-black uppercase tracking-widest">Apply Now</h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">Join the Tesla of Apiculture</p>
                    </div>
                    <CardContent className="p-8">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="font-black uppercase text-[9px] tracking-widest text-slate-400">Full Name</Label>
                          <Input
                            id="fullName"
                            required
                            className="rounded-xl h-12 border-slate-100 focus:border-beeyield-gold transition-all"
                            placeholder="Timothy Nduva"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="font-black uppercase text-[9px] tracking-widest text-slate-400">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            className="rounded-xl h-12 border-slate-100 focus:border-beeyield-gold transition-all"
                            placeholder="timothy@beeyield.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="font-black uppercase text-[9px] tracking-widest text-slate-400">Phone</Label>
                          <Input
                            id="phone"
                            required
                            className="rounded-xl h-12 border-slate-100 focus:border-beeyield-gold transition-all"
                            placeholder="+254 7..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-black uppercase text-[9px] tracking-widest text-slate-400">Resume / CV (PDF)</Label>
                          <div className="border-2 border-dashed border-slate-100 hover:border-beeyield-gold rounded-2xl p-8 transition-all text-center cursor-pointer relative bg-slate-50/50 group">
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={handleFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-3">
                              <Upload className="h-8 w-8 text-slate-300 group-hover:text-beeyield-gold transition-colors" />
                              {resume ? (
                                <div className="text-[10px] font-black text-beeyield-green bg-beeyield-green/5 px-3 py-1.5 rounded-full border border-beeyield-green/10">
                                  {resume.name}
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Upload Credentials</p>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PDF Max 5MB</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button type="submit" className="w-full bg-beeyield-green text-white rounded-2xl h-14 font-black shadow-xl hover:bg-beeyield-green/90 transition-all text-xs uppercase tracking-widest" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transmitting...
                            </>
                          ) : (
                            "Submit Application"
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf6]">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden bg-white mt-16 md:mt-24">
        <div className="container mx-auto px-4 relative z-10 text-center max-w-5xl">
          <Badge variant="outline" className="mb-8 border-beeyield-gold/30 text-beeyield-gold bg-beeyield-gold/5 font-black uppercase tracking-[0.2em] text-[10px]">
            The BeeYield Collective
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-slate-900 leading-[0.85]">
            BUILDING THE <br /><span className="text-beeyield-green">FUTURE OF AGRI.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-12 font-medium max-w-3xl mx-auto">
            We're a team of engineers, agronomists, and optimists on a mission to protect the global food supply chain.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-slate-900 text-white rounded-2xl h-16 px-12 font-black shadow-2xl hover:bg-slate-800" onClick={() => document.getElementById('openings')?.scrollIntoView({ behavior: 'smooth' })}>
              View Openings
            </Button>
          </div>
        </div>

        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-beeyield-green/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-beeyield-gold/5 rounded-full blur-[140px] translate-y-1/2 -translate-x-1/2" />
      </section>

      {/* Values Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Compass, title: "Precision Pioneers", desc: "We aim to deliver predictability to a complex biological process.", color: "bg-blue-50 text-blue-600" },
              { icon: Cpu, title: "Digital First", desc: "We believe data is the key to unlocking sustainable crop yields.", color: "bg-purple-50 text-purple-600" },
              { icon: Sun, title: "Relentless Optimists", desc: "Pollination doesn't have to be a zero-sum game. We win together.", color: "bg-amber-50 text-amber-600" },
              { icon: Heart, title: "Eco-Stewardship", desc: "We are leaders in pollinator health. Every hive counts.", color: "bg-green-50 text-beeyield-green" },
              { icon: Database, title: "Data Integrity", desc: "If you can measure it, you can monitor it. Sci-first operations.", color: "bg-indigo-50 text-indigo-600" },
              { icon: Zap, title: "Continuous Growth", desc: "We're building a global knowledge hub for the next gen.", color: "bg-orange-50 text-orange-600" }
            ].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group p-10 rounded-[2.5rem] bg-[#fdfbf6] border border-slate-50 transition-all hover:shadow-2xl hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner ${v.color}`}>
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tighter text-slate-900">{v.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section id="openings" className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-slate-200 text-slate-400 font-black uppercase tracking-[0.2em] text-[9px]">
              Active Nodes
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-6">Current <span className="text-beeyield-green">Openings.</span></h2>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full">
                <Globe className="h-3.5 w-3.5 text-beeyield-gold" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">HQ: Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20 flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-beeyield-green mb-4" />
                <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-300">Retrieving Datasets...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                <p className="font-black text-slate-400 uppercase tracking-widest">No active vacancies. Re-check sequence later.</p>
              </div>
            ) : (
              jobs.map((job) => (
                <motion.div
                  key={job.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedJob(job)}
                  className="group bg-white border border-slate-100 rounded-[2rem] p-8 hover:border-beeyield-green hover:shadow-2xl transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-3">
                    <Badge className="bg-beeyield-green/5 text-beeyield-green border-beeyield-green/10 font-bold uppercase text-[8px] tracking-[0.15em] mb-1">
                      {job.department}
                    </Badge>
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-beeyield-green transition-colors tracking-tight">{job.title}</h3>
                    <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {job.location}</span>
                      <span className="flex items-center gap-2"><Briefcase className="h-3 w-3" /> {job.type}</span>
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-2">
                    <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-beeyield-green group-hover:border-beeyield-green transition-all">
                      <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-white transition-all" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-20 text-center">
            <div className="inline-block p-1 bg-slate-900 rounded-full">
              <div className="px-6 py-3 border border-white/10 rounded-full flex items-center gap-3">
                <Heart className="h-4 w-4 text-beeyield-gold animate-pulse" />
                <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Join the Collective Mission</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Careers;