export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-midnight py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-surface/90 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12">
          <h1 className="text-4xl font-heading font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>Last updated: January 2025</p>
            
            <section>
              <h2 className="text-xl font-bold text-white mb-4">1. Introduction</h2>
              <p>
                RAJNEET (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, and safeguard your personal information 
                in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act 2023) and other 
                applicable laws in India.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">2. Information We Collect</h2>
              <p>We collect the following types of personal data:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li><strong>Identity Data:</strong> Name, email address, profile picture (from Google OAuth)</li>
                <li><strong>Contact Data:</strong> Email address</li>
                <li><strong>Profile Data:</strong> Username, avatar URL, state, district</li>
                <li><strong>Usage Data:</strong> Page views, news interactions, opinions, poll votes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">3. Purpose of Data Collection</h2>
              <p>We collect and process your personal data for the following purposes:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Providing and maintaining our platform services</li>
                <li>Authenticating users and managing accounts</li>
                <li>Delivering location-based political news and content</li>
                <li>Enabling user participation in debates, polls, and discussions</li>
                <li>Improving our services and user experience</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">4. Legal Basis for Processing</h2>
              <p>
                Under the DPDP Act 2023, we process your personal data based on:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li><strong>Consent:</strong> You provide explicit consent when you sign up with Google</li>
                <li><strong>Legitimate Interest:</strong> For providing our core platform services</li>
                <li><strong>Compliance:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">5. Data Sharing and Disclosure</h2>
              <p>
                We do not sell your personal data to third parties. We may share your data only in the following circumstances:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our platform</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government authority</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">6. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal data 
                against unauthorized access, alteration, disclosure, or destruction. These include encryption, 
                secure servers, and regular security audits.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">7. Your Rights Under DPDP Act 2023</h2>
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw your consent at any time</li>
                <li><strong>Right to Grievance Redressal:</strong> File a complaint with us or the Data Protection Board</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">8. Data Retention</h2>
              <p>
                We retain your personal data only for as long as necessary to fulfill the purposes outlined in 
                this policy, unless a longer retention period is required or permitted by law. You may request 
                deletion of your account and associated data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">9. Children&apos;s Privacy</h2>
              <p>
                Our platform is not intended for children under the age of 18. We do not knowingly collect 
                personal data from children under 18. If we become aware that we have collected such data, 
                we will take steps to delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">10. Grievance Officer</h2>
              <p>
                If you have any concerns or complaints regarding our privacy practices, please contact our 
                Grievance Officer at:
              </p>
              <div className="mt-4 p-4 bg-surface rounded-lg">
                <p><strong>Email:</strong> privacy@rajneet.co.in</p>
                <p><strong>Address:</strong> RAJNEET, India</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new policy on our platform and updating the &quot;Last updated&quot; date.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
