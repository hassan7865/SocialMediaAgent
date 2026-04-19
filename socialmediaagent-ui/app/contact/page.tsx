"use client";

import { Mail, Headphones, DollarSign, Megaphone, MapPin, Clock, Phone, MessageCircle } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground mb-8">Get in touch with our team.</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground leading-relaxed mb-12">
            We&apos;re here to help you succeed with SocialAgent. Whether you have questions about our platform,
            need technical support, or want to explore partnership opportunities, our team is ready to assist you.
          </p>

          <div className="grid gap-8 md:grid-cols-2 mb-12">
            <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <Mail className="w-4 h-4" />
                </div>
                General Inquiries
              </h3>
              <p className="text-muted-foreground mb-6">
                Have questions about SocialAgent, our features, or how we can help your business?
                Our team is here to provide information and answer your questions.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">Email:</span>
                  <a href="mailto:hello@socialagent.com" className="text-primary hover:underline">hello@socialagent.com</a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">Response time:</span>
                  <span className="text-muted-foreground">Within 24 hours</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  <Headphones className="w-4 h-4" />
                </div>
                Technical Support
              </h3>
              <p className="text-muted-foreground mb-6">
                Experiencing issues with our platform? Our technical support team is available to help
                you resolve any problems and ensure smooth operation.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">Email:</span>
                  <a href="mailto:support@socialagent.com" className="text-primary hover:underline">support@socialagent.com</a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">Response time:</span>
                  <span className="text-muted-foreground">Within 4 hours</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <DollarSign className="w-4 h-4" />
                </div>
                Sales & Enterprise
              </h3>
              <p className="text-muted-foreground mb-6">
                Interested in enterprise solutions, custom pricing, or partnership opportunities?
                Our sales team can help you find the right solution for your organization.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">Email:</span>
                  <a href="mailto:sales@socialagent.com" className="text-primary hover:underline">sales@socialagent.com</a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">Response time:</span>
                  <span className="text-muted-foreground">Within 48 hours</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                  <Megaphone className="w-4 h-4" />
                </div>
                Press & Media
              </h3>
              <p className="text-muted-foreground mb-6">
                For press inquiries, media requests, or partnership opportunities with media outlets,
                please reach out to our communications team.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">Email:</span>
                  <a href="mailto:press@socialagent.com" className="text-primary hover:underline">press@socialagent.com</a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">Response time:</span>
                  <span className="text-muted-foreground">Within 48 hours</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Office Information</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Headquarters
                </h3>
                <div className="text-muted-foreground space-y-1">
                  <div className="font-medium">SocialAgent, Inc.</div>
                  <div>123 Editorial Street</div>
                  <div>San Francisco, CA 94105</div>
                  <div>United States</div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Business Hours
                </h3>
                <div className="text-muted-foreground space-y-1">
                  <div>Monday - Friday: 9:00 AM - 6:00 PM PST</div>
                  <div>Saturday: 10:00 AM - 4:00 PM PST</div>
                  <div>Sunday: Closed</div>
                  <div className="mt-3 text-sm">
                    <span className="font-medium">Emergency Support:</span> 24/7 for critical issues
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Need Immediate Assistance?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              For urgent technical issues or critical business matters, please call our emergency support line.
              We prioritize urgent requests and work to resolve them as quickly as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-card rounded-lg px-6 py-4 shadow-sm">
                <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Emergency Support
                </div>
                <div className="text-lg font-bold text-foreground">+1 (555) 123-4567</div>
                <div className="text-xs text-muted-foreground">Available 24/7</div>
              </div>
              <div className="bg-card rounded-lg px-6 py-4 shadow-sm">
                <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Live Chat
                </div>
                <div className="text-lg font-bold text-foreground">Available Now</div>
                <div className="text-xs text-muted-foreground">Business hours</div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Follow Us</h2>
            <p className="text-muted-foreground mb-6">
              Stay updated with the latest news, product updates, and social media insights.
            </p>
            <div className="flex justify-center gap-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex flex-col items-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <div className="text-sm mt-1">Facebook</div>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex flex-col items-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <div className="text-sm mt-1">X</div>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex flex-col items-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                <div className="text-sm mt-1">LinkedIn</div>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex flex-col items-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                <div className="text-sm mt-1">Instagram</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}