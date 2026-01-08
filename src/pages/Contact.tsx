import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail, Phone, MapPin, ChevronDown,
  Sprout, Bug, MessageSquare
} from "lucide-react";

const Contact = () => {
  const [activeTab, setActiveTab] = useState("grower");

  const tabs = [
    { id: "grower", label: "Grower Inquiries", icon: Sprout },
    { id: "beekeeper", label: "Beekeeper Inquiries", icon: Bug },
    { id: "general", label: "General Inquiries", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h1 className="mb-6 text-5xl font-bold">Contact Us Today</h1>
          <p className="mb-12 text-xl text-muted-foreground">
            Fill in the form, and we will get back to you at our earliest convenience.
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  isActive
                    ? "border-primary bg-primary/5 text-primary shadow-soft"
                    : "border-transparent bg-white shadow-soft text-muted-foreground hover:bg-secondary/20"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Container */}
        <Card className="max-w-4xl mx-auto border-none shadow-soft">
          <CardContent className="p-8 md:p-12">
            <form className="space-y-8">
              {/* Common Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name *</label>
                  <input
                    type="text"
                    placeholder="Jane"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name *</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">City *</label>
                  <input
                    type="text"
                    placeholder="New York"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State *</label>
                    <input
                      type="text"
                      placeholder="NY"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country *</label>
                    <input
                      type="text"
                      placeholder="USA"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <input
                    type="email"
                    placeholder="info@beeyield.com"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="h-px bg-border/50" />

              {/* Specific Fields based on Tab */}
              <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                {activeTab === "grower" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Farm Name *</label>
                      <input
                        type="text"
                        placeholder="Green Acres Farm"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Crop *</label>
                      <select
                        aria-label="Crop selection"
                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option>Almonds</option>
                        <option>Apples</option>
                        <option>Avocados</option>
                        <option>Blueberries</option>
                        <option>Cherries</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Acres *</label>
                      <input
                        type="number"
                        placeholder="500"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Topic *</label>
                      <select
                        aria-label="Topic selection"
                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option>Pollination Services</option>
                        <option>Pricing</option>
                        <option>Partnership</option>
                        <option>Support</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === "beekeeper" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Apiary Name *</label>
                      <input
                        type="text"
                        placeholder="Busy Bee Apiaries"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Number of Hives *</label>
                      <input
                        type="number"
                        placeholder="1000"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Years of Experience *</label>
                      <select
                        aria-label="Years of experience selection"
                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option>1-5 years</option>
                        <option>5-10 years</option>
                        <option>10+ years</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Topic *</label>
                      <select
                        aria-label="Topic selection for beekeeper"
                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option>Technology Integration</option>
                        <option>Hive Monitoring</option>
                        <option>Partnership</option>
                        <option>Support</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === "general" && (
                  <>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Company / Organization</label>
                      <input
                        type="text"
                        placeholder="Optional"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Topic *</label>
                      <select
                        aria-label="Topic selection for general inquiry"
                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option>Press Inquiry</option>
                        <option>Careers</option>
                        <option>Sustainability</option>
                        <option>General Question</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Message Area for general */}
              {activeTab === 'general' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    placeholder="How can we help you?"
                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              )}

              <div className="space-y-6 pt-4">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="terms" className="text-sm font-medium leading-none text-muted-foreground">
                    I agree with the <a href="#" className="text-primary hover:underline">Terms and Conditions</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </label>
                </div>

                <Button size="lg" className="min-w-[200px]">
                  Submit Inquiry
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

        {/* Direct Contact Info */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto text-center">
          <div className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Email Us</h3>
            <p className="text-muted-foreground">info@beeyield.com</p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Call Us</h3>
            <p className="text-muted-foreground">+1 (800) 123-4567</p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Visit Us</h3>
            <p className="text-muted-foreground">Kibwezi</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;