
import { useEffect, useState } from "react";
import { MapPin, Globe, Heart, Zap, Database, Cpu, Sun, Users, Compass, Briefcase, ArrowRight, X, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getJobListings, applyForJob, JobListing } from "@/services/careersService";

const Careers = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
    linkedin: "",
    portfolio: "",
    experience: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    // Fetch Jobs
    const fetchJobs = async () => {
      try {
        const data = await getJobListings();
        setJobs(data);
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Failed to load job listings. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [toast]);

  const handleApplyClick = (job: JobListing) => {
    setSelectedJob(job);
    setIsApplicationOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setIsSubmitting(true);
    try {
      await applyForJob({
        job_id: selectedJob.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        cover_letter: formData.coverLetter,
        linkedin_url: formData.linkedin,
        portfolio_url: formData.portfolio,
        experience_years: parseInt(formData.experience) || 0,
        resume: resumeFile || undefined
      });

      toast({
        title: "Application Submitted!",
        description: `Thanks for applying to the ${selectedJob.title} position. We'll be in touch soon.`,
      });

      setIsApplicationOpen(false);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        coverLetter: "",
        linkedin: "",
        portfolio: "",
        experience: "",
      });
      setResumeFile(null);
    } catch (error) {
      console.error(error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-secondary via-background to-primary/10 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            Join the Hive
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-foreground">
            Join Us to Make <br /> an Impact
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
            We're a team on a mission to help future-proof the global food supply.
          </p>
          <Button size="lg" className="shadow-xl h-14 text-lg" onClick={() => document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' })}>
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
                We get it. Choosing your next job is one of the most important decisions you get to make. After all there's a ton of companies to choose from. All with different cultures and vibes, different levels of compensation, different missions, so in the end it comes down to this: what matters to you, is what matters.
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
            <Card className="border-none shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Compass className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">We are Pioneers</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We aim to redefine pollination by leveraging technology to deliver predictability and precision to the process.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Cpu className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">We are Technologists</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We believe in the power of technology to improve crop yields & future proof humanity's food supply.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="bg-honey-light/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Sun className="h-6 w-6 text-honey-light" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">We are Optimists</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We believe pollination does not have to be a zero-sum game. All stakeholders can benefit from our solution.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="bg-nature-green/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-nature-green" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">We are Bridge Builders</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our work positions us to be leaders in the field of pollinator health and welfare. We embrace this responsibility.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">We are Data-Driven</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  At BeeYield, we like to say, "If you can measure it, you can monitor it." A science-based approach guides all our decision-making.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="bg-honey-dark/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-honey-dark" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Innovation is in our DNA</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We're building the world's largest database of bee and pollination knowledge, empowering beekeepers to manage hives right from their smartphones.
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
      <section id="jobs-section" className="py-24 bg-background">
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
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-xl">
                <p className="text-muted-foreground">No open positions at the moment. Check back later!</p>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => handleApplyClick(job)}
                  className="group border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between bg-card"
                >
                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.job_type}</span>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Apply Now <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground bg-secondary/30 inline-block px-6 py-3 rounded-lg">
              BeeYield is an international company. We have offices in Tel Aviv, Fresno, Palo Alto, Australia, and <strong>Kenya</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Application Dialog */}
      <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              {selectedJob?.department} - {selectedJob?.location}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitApplication} className="space-y-6 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Resume / CV (PDF or Word) *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  required
                />

              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn Profile (Optional)</Label>
              <Input
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter / Message</Label>
              <Textarea
                id="coverLetter"
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                className="min-h-[120px]"
                placeholder="Tell us why you're a great fit..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsApplicationOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Careers;