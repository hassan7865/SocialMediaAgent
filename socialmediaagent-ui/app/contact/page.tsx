"use client";

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
            <div className="bg-white rounded-lg border border-outline-variant/20 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold">?</span>
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

            <div className="bg-white rounded-lg border border-outline-variant/20 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-semibold">⚡</span>
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

            <div className="bg-white rounded-lg border border-outline-variant/20 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold">$</span>
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

            <div className="bg-white rounded-lg border border-outline-variant/20 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-semibold">📢</span>
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

          <div className="bg-white rounded-lg border border-outline-variant/20 p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Office Information</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Headquarters</h3>
                <div className="text-muted-foreground space-y-1">
                  <div className="font-medium">SocialAgent, Inc.</div>
                  <div>123 Editorial Street</div>
                  <div>San Francisco, CA 94105</div>
                  <div>United States</div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Business Hours</h3>
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
              <div className="bg-white rounded-lg px-6 py-4 shadow-sm">
                <div className="text-sm text-muted-foreground mb-1">Emergency Support</div>
                <div className="text-lg font-bold text-foreground">+1 (555) 123-4567</div>
                <div className="text-xs text-muted-foreground">Available 24/7</div>
              </div>
              <div className="bg-white rounded-lg px-6 py-4 shadow-sm">
                <div className="text-sm text-muted-foreground mb-1">Live Chat</div>
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
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="text-2xl">📘</span>
                <div className="text-sm mt-1">Facebook</div>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="text-2xl">🐦</span>
                <div className="text-sm mt-1">Twitter</div>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="text-2xl">💼</span>
                <div className="text-sm mt-1">LinkedIn</div>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="text-2xl">📷</span>
                <div className="text-sm mt-1">Instagram</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}