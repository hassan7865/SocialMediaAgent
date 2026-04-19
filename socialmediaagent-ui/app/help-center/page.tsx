"use client";

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">Help Center</h1>
          <p className="text-lg text-muted-foreground mb-8">Find answers to your questions and get the support you need.</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground leading-relaxed mb-12">
            Welcome to the SocialAgent Help Center. We&apos;re here to help you make the most of our social media management platform.
            Browse through our resources below or contact our support team if you can&apos;t find what you&apos;re looking for.
          </p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
            <div className="bg-white rounded-lg border border-outline-variant/20 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-foreground mb-3">Getting Started</h3>
              <p className="text-muted-foreground mb-4">
                New to SocialAgent? Learn how to set up your account and get started with our platform.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Creating your account</li>
                <li>• Connecting social media platforms</li>
                <li>• Setting up your company profile</li>
                <li>• Understanding the dashboard</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-outline-variant/20 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-foreground mb-3">Content Creation</h3>
              <p className="text-muted-foreground mb-4">
                Master the art of creating and scheduling engaging social media content.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Writing compelling posts</li>
                <li>• Using our AI content tools</li>
                <li>• Adding images and videos</li>
                <li>• Best practices for each platform</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-outline-variant/20 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-foreground mb-3">Scheduling & Publishing</h3>
              <p className="text-muted-foreground mb-4">
                Learn how to schedule posts for optimal engagement and manage your content calendar.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Post scheduling best practices</li>
                <li>• Bulk scheduling and drafts</li>
                <li>• Publishing across platforms</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-outline-variant/20 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-foreground mb-3">Analytics & Reporting</h3>
              <p className="text-muted-foreground mb-4">
                Understand your social media performance and measure your content&apos;s impact.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Reading performance metrics</li>
                <li>• Understanding engagement rates</li>
                <li>• Exporting reports</li>
                <li>• Tracking ROI</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-outline-variant/20 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-foreground mb-3">Account Management</h3>
              <p className="text-muted-foreground mb-4">
                Manage your account settings, team members, and billing information.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• User roles and permissions</li>
                <li>• Billing and subscriptions</li>
                <li>• Account security settings</li>
                <li>• Data export options</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-outline-variant/20 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-foreground mb-3">Troubleshooting</h3>
              <p className="text-muted-foreground mb-4">
                Find solutions to common issues and technical problems.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Platform connection issues</li>
                <li>• Publishing errors</li>
                <li>• Browser compatibility</li>
                <li>• File upload problems</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-16 mb-8">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="border-b border-outline-variant/20 pb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">How do I connect my social media accounts?</h3>
              <p className="text-muted-foreground">
                Navigate to the Platforms section in your dashboard. Click &quot;Connect&quot; next to each platform you want to use,
                then follow the authorization prompts. We support secure OAuth connections for all major platforms.
              </p>
            </div>

            <div className="border-b border-outline-variant/20 pb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Can I schedule posts for multiple platforms at once?</h3>
              <p className="text-muted-foreground">
                Yes! When creating a post, you can select multiple connected platforms. The post will be automatically published
                to all selected platforms at the scheduled time. Note that some platforms may have character limits or formatting differences.
              </p>
            </div>

            <div className="border-b border-outline-variant/20 pb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">What file types are supported for media uploads?</h3>
              <p className="text-muted-foreground">
                We support JPEG, PNG, WebP, and GIF images (up to 10MB each) and MP4, WebM, MOV, OGV videos (up to 80MB each).
                For best results, follow each platform&apos;s recommended specifications for image dimensions and aspect ratios.
              </p>
            </div>

            <div className="border-b border-outline-variant/20 pb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">How does post scheduling work?</h3>
              <p className="text-muted-foreground">
                Posts are automatically published at their scheduled time. If a scheduled time passes without being published,
                the post will be marked as expired. You can always reschedule expired posts to try again.
              </p>
            </div>

            <div className="border-b border-outline-variant/20 pb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Can I export my analytics data?</h3>
              <p className="text-muted-foreground">
                Yes, you can export performance data for individual posts or date ranges. Visit the Analytics section and use the
                export options to download CSV files of your metrics and engagement data.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">What if I need to cancel my subscription?</h3>
              <p className="text-muted-foreground">
                You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period,
                after which your account will be downgraded to a free plan (if available) or deactivated.
              </p>
            </div>
          </div>

          <div className="mt-16 bg-muted/30 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Still Need Help?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our support team is available to help with any questions or issues you might have.
              Don&apos;t hesitate to reach out—we&apos;re here to ensure your success with SocialAgent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@socialagent.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border border-outline-variant/20 bg-white text-foreground rounded-lg font-medium hover:bg-muted/50 transition-colors"
              >
                Visit Contact Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}