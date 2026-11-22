import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <Link to="/" className="legal-back">
          ← Back to ProQuire
        </Link>

        <h1>Terms of Service</h1>
        <p>Last updated: 22 November 2026</p>

        <p>
          Welcome to ProQuire. These Terms of Service govern your access to and
          use of the ProQuire website and platform. By creating an account or
          using our services, you agree to these terms.
        </p>

        <h2>1. About ProQuire</h2>
        <p>
          ProQuire is an online marketplace that connects clients seeking
          services with independent technicians and professional service
          agencies.
        </p>
        <p>Contact: proquire.est2026@gmail.com</p>

        <h2>2. Eligibility</h2>
        <p>
          You must be at least 18 years old and legally capable of entering into
          agreements to use ProQuire.
        </p>

        <h2>3. Account Registration</h2>
        <p>When registering, you agree to:</p>
        <ul>
          <li>Provide accurate and complete information.</li>
          <li>Keep your login credentials confidential.</li>
          <li>Maintain accurate account and profile information.</li>
          <li>Notify us of suspected unauthorised account access.</li>
          <li>Use the platform lawfully and responsibly.</li>
        </ul>

        <h2>4. Client Responsibilities</h2>
        <p>Clients agree to:</p>
        <ul>
          <li>Provide accurate service request information.</li>
          <li>Communicate respectfully with professionals.</li>
          <li>Agree on service scope, prices and timelines directly.</li>
          <li>Make payments according to agreed arrangements.</li>
          <li>Provide honest and fair reviews.</li>
        </ul>

        <h2>5. Technician and Agency Responsibilities</h2>
        <p>Technicians and agencies agree to:</p>
        <ul>
          <li>Provide accurate professional and business information.</li>
          <li>
            Maintain the necessary qualifications and licences for their work.
          </li>
          <li>Provide services professionally and responsibly.</li>
          <li>Use genuine photographs and portfolio materials.</li>
          <li>Respect client privacy and confidential information.</li>
          <li>Communicate honestly about pricing and service availability.</li>
          <li>Comply with applicable Kenyan laws and regulations.</li>
        </ul>

        <h2>6. Professional Verification</h2>
        <p>
          ProQuire may review identity information, documents and professional
          credentials submitted by technicians and agencies.
        </p>
        <p>
          Verification indicates that specified checks have been completed. It
          does not guarantee professional competence, service quality, honesty
          or future conduct.
        </p>

        <h2>7. Marketplace Relationship</h2>
        <p>
          ProQuire provides a platform for discovering professionals and
          facilitating connections. Unless expressly stated otherwise,
          technicians and agencies operate independently and are not employees,
          agents or representatives of ProQuire.
        </p>
        <p>
          Service agreements are generally between the client and the selected
          professional or agency. The parties should independently agree on
          scope, prices, materials, timelines and payment arrangements.
        </p>

        <h2>8. Service Requests and Communication</h2>
        <p>
          Submitting a service request does not guarantee acceptance or
          completion. Professionals may accept or decline requests depending on
          their availability and business arrangements.
        </p>

        <h2>9. Payments and Subscriptions</h2>
        <p>
          Certain ProQuire features may require payment or a subscription.
          Applicable fees, billing periods and subscription conditions will be
          communicated before purchase.
        </p>
        <p>
          Payment transactions may be processed through third-party payment
          providers. Their applicable terms may also apply.
        </p>
        <p>
          Subscription cancellations, renewals and refunds will be handled
          according to the applicable plan terms and Kenyan law.
        </p>

        <h2>10. Reviews and User Content</h2>
        <p>
          Users are responsible for the photographs, reviews, descriptions and
          other content they submit.
        </p>
        <p>
          You must not upload unlawful, misleading, abusive, defamatory or
          infringing content.
        </p>
        <p>
          By submitting content, you grant ProQuire a non-exclusive permission
          to host, display and use that content as necessary to operate and
          promote the platform, subject to your rights and applicable law.
        </p>

        <h2>11. Prohibited Activities</h2>
        <p>You must not:</p>
        <ul>
          <li>Provide false identities or professional credentials.</li>
          <li>Engage in fraud, impersonation or misleading conduct.</li>
          <li>Harass, threaten or discriminate against other users.</li>
          <li>Attempt unauthorised access to platform systems.</li>
          <li>Upload malicious software or harmful content.</li>
          <li>Use ProQuire for unlawful activities.</li>
          <li>Manipulate ratings, reviews or verification processes.</li>
        </ul>

        <h2>12. Intellectual Property</h2>
        <p>
          ProQuire's branding, logo, platform design, software and original
          materials are protected by applicable intellectual property laws.
        </p>
        <p>
          Users retain their rights in content they own and submit, subject to
          the permissions granted under these terms.
        </p>

        <h2>13. Account Suspension and Termination</h2>
        <p>
          ProQuire may restrict, suspend or terminate accounts where there is
          reasonable evidence of fraud, abuse, security risks, serious
          violations of these terms or other lawful grounds.
        </p>
        <p>
          Users may request account closure by contacting
          proquire.est2026@gmail.com. Certain records may need to be retained
          where required by law.
        </p>

        <h2>14. Limitation of Responsibility</h2>
        <p>
          ProQuire takes reasonable steps to maintain a reliable platform but
          does not guarantee uninterrupted availability or the performance of
          independent service providers.
        </p>
        <p>
          To the extent permitted by applicable law, ProQuire is not responsible
          for disputes, losses or damage arising directly from services
          independently arranged between clients and professionals.
        </p>
        <p>
          Nothing in these terms excludes liability or consumer rights that
          cannot lawfully be excluded under Kenyan law.
        </p>

        <h2>15. Privacy</h2>
        <p>
          Your use of ProQuire is also governed by our
          <Link to="/privacy-policy"> Privacy Policy</Link>.
        </p>

        <h2>16. Changes to These Terms</h2>
        <p>
          We may update these terms as the platform develops. Updated terms will
          be published on this page. Continued use after an update takes effect
          constitutes acceptance where permitted by law.
        </p>

        <h2>17. Governing Law and Disputes</h2>
        <p>
          These terms are governed by the laws of Kenya. Disputes will be
          handled through appropriate dispute resolution procedures and the
          competent courts of Kenya, subject to applicable consumer protection
          laws.
        </p>

        <h2>18. Contact</h2>
        <p>
          <strong>ProQuire</strong>
          <br />
          Email: proquire.est2026@gmail.com
          <br />
          Kenya
        </p>
      </div>
    </main>
  );
}
