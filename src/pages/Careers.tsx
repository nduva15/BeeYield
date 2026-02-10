
import { MapPin, Globe, Heart, Zap, Database, Cpu, Sun, Users, Compass, Briefcase, ArrowRight, ArrowLeft, Upload, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      // Fallback to static data if DB fails (for demo purposes if migration failed)
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
      if (!supabase) throw new Error("Supabase client not initialized");

      // 1. Upload Resume
      const fileExt = resume.name.split('.').pop();
      const fileName = `${selectedJob.id}/${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resume);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      // 2. Insert Application
      const { error: dbError } = await supabase
        .from('job_applications')
        .insert({
          job_id: selectedJob.id,
          full_name: fullName,
          email: email,
          phone: phone,
          linkedin_url: linkedin,
          resume_url: publicUrl,
          status: 'applied'
        });

      if (dbError) throw dbError;

      setUploadSuccess(true);
      toast.success("Application received! We will contact you shortly.");

      // Cleanup
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
      <div className="min-h-screen bg-background py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => { setSelectedJob(null); setUploadSuccess(false); }}
            className="mb-8 hover:bg-muted group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Jobs
          </Button>

          {uploadSuccess ? (
            <Card className="max-w-md mx-auto text-center py-12 border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-900">
              <CardContent>
                <div className="flex justify-center mb-6">
                  <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-3">Application Received!</h2>
                <p className="text-muted-foreground mb-8">
                  Thanks for applying to be a <strong>{selectedJob.title}</strong>.
                  We've sent a detailed confirmation to {email}.
                </p>
                <Button onClick={() => { setSelectedJob(null); setUploadSuccess(false); }}>
                  Browse More Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Left Column: Job Description */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-4">{selectedJob.title}</h1>
                  <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-full text-sm">
                      <MapPin className="h-4 w-4" /> {selectedJob.location}
                    </div>
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-full text-sm">
                      <Briefcase className="h-4 w-4" /> {selectedJob.type}
                    </div>
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-full text-sm">
                      <Users className="h-4 w-4" /> {selectedJob.department}
                    </div>
                  </div>
                </div>

                <Card className="border-none shadow-sm bg-card/50">
                  <CardContent className="p-8 prose prose-gray max-w-none dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: selectedJob.description_html }} />

                    {!selectedJob.description_html && (
                      <div className="space-y-6">
                        <h3>About the role</h3>
                        <p>
                          As a key member of the {selectedJob.department} team, you will be responsible for
                          driving innovation and ensuring the highest standards of quality in your work.
                        </p>
                        <h3>Responsibilities</h3>
                        <ul>
                          <li>Collaborate with cross-functional teams</li>
                          <li>Drive project timelines and deliverables</li>
                          <li>Maintain high code/operational quality</li>
                        </ul>
                        <h3>Requirements</h3>
                        <ul>
                          <li>3+ years of relevant experience</li>
                          <li>Strong communication skills</li>
                          <li>Passion for ag-tech and sustainability</li>
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Sticky Application Form */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <Card className="border-primary/20 shadow-lg overflow-hidden">
                    <div className="h-2 bg-primary w-full" />
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-6">Apply for this role</h3>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            required
                            placeholder="Timothy Nduva"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            placeholder="timothy@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            required
                            placeholder="+254 700 000000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="linkedin">LinkedIn URL (Optional)</Label>
                          <Input
                            id="linkedin"
                            type="url"
                            placeholder="https://linkedin.com/in/..."
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Resume / CV (PDF)</Label>
                          <div className="border-2 border-dashed border-input hover:border-primary rounded-lg p-6 transition-colors text-center cursor-pointer relative bg-muted/20">
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={handleFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="h-8 w-8 text-muted-foreground" />
                              {resume ? (
                                <div className="text-sm font-medium text-primary break-all bg-primary/10 px-2 py-1 rounded">
                                  {resume.name}
                                </div>
                              ) : (
                                <>
                                  <span className="text-sm font-medium">Click to upload</span>
                                  <span className="text-xs text-muted-foreground">PDF only (Max 5MB)</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button type="submit" className="w-full mt-4" size="lg" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                            </>
                          ) : (
                            "Send Application"
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-secondary via-background to-primary/10 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            Join the Hive
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-foreground">
            Join Us to Make <br /> an Impact
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
            We're a team on a mission to help future-proof the global food supply.
          </p>
          <Button size="lg" className="shadow-xl h-14 text-lg" onClick={() => document.getElementById('openings')?.scrollIntoView({ behavior: 'smooth' })}>
            View Openings
          </Button>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5"></div>
      </section>

      {/* Intro Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-6xl font-bold mb-6 text-primary">Hi!</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                We get it. Choosing your next job is one of the most important decisions you get to make. After all there's a ton of companies to choose from. All with different cultures and vibes, different levels of compensation, different missions, so in the end it comes down to this — what matters to you, is what matters.
              </p>
            </div>
            <div className="bg-secondary/30 p-8 rounded-2xl border border-secondary">
              <h3 className="text-2xl font-bold mb-4 text-foreground">So why choose us?</h3>
              <p className="text-muted-foreground mb-6">
                Well for one thing we're one of the world's fastest-growing ag-tech companies with a genuinely purpose-driven mission: BeeYield combines a passion for leveraging technology to improve pollination and thereby improve crop outcomes, and at the same time ensuring beekeepers and their bees continue to thrive.
              </p>
              <div className="flex items-center gap-3 font-medium text-foreground">
                <Heart className="h-5 w-5 text-primary" />
                <span>Balance is key</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 ml-8">
                We keep things fun and lighthearted, but our commitment to our mission is unwavering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">What to know about us</h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all h-full">
              <CardContent className="p-6">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Compass className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">We are Pioneers</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We aim to redefine pollination by leveraging technology to deliver predictability and precision to the process.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all h-full">
              <CardContent className="p-6">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Cpu className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">We are Technologists</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We believe in the power of technology to improve crop yields & future proof humanity's food supply.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all h-full">
              <CardContent className="p-6">
                <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Sun className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">We are Optimists</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We believe pollination does not have to be a zero-sum game. All stakeholders can benefit from our solution.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all h-full">
              <CardContent className="p-6">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">We are Bridge Builders</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our work positions us to be leaders in the field of pollinator health and welfare. We embrace this responsibility.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all h-full">
              <CardContent className="p-6">
                <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">We are Data-Driven</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  At BeeYield, we like to say, "If you can measure it, you can monitor it." A science-based approach guides all our decision-making.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all h-full">
              <CardContent className="p-6">
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Innovation is in our DNA</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We're building the world's largest database of bee and pollination knowledge — empowering beekeepers to manage hives right from their smartphones.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Innovation DNA Extra Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Innovation - It's in our DNA</h2>
          <p className="text-lg opacity-90 leading-relaxed mb-8">
            With AI and machine learning, we're decoding colony behavior to better understand and support bee health. At the same time, growers are using our state-of-the-art pollination platform to boost crop outcomes. Pretty cool, right? TIME magazine thought so too!
          </p>
          <Button variant="secondary" className="gap-2 font-bold">
            Check out The Buzz Blog <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Jobs Section */}
      <section id="openings" className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Make Your Next Choice</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              If you're seeking a new role, one that truly aligns with your goals, we'd love to be part of your journey! Check out the list of openings below.
            </p>

            <div className="inline-flex items-center bg-secondary/50 rounded-full px-4 py-2 text-sm font-medium">
              <Globe className="h-4 w-4 mr-2 text-primary" />
              <span className="text-muted-foreground mr-2">Showing roles in:</span>
              <span className="text-foreground font-bold">Kenya</span>
            </div>
          </div>

          {/* Job Listings */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Loading openings...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-xl">
                <p className="text-muted-foreground">No open positions at the moment. Check back later!</p>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="group border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between bg-card"
                >
                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.type}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {job.department}</span>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                  {/* Mobile view arrow */}
                  <div className="md:hidden text-muted-foreground">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              ))
            )}

            {/* Fail-safe if jobs are empty but no loading (DB connection fail) - handled by catch block using fallback */}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground bg-secondary/30 inline-block px-6 py-3 rounded-lg">
              BeeYield is an international company. We have offices in Tel Aviv, Fresno, Palo Alto, Australia, and <strong>Kenya</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Careers;