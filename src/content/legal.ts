// Starting-point legal copy. Have a qualified lawyer review and adapt before launch.
import { SITE } from "./site";

export type LegalSection = { h: string; p: string[]; list?: string[]; table?: string[][]; after?: string[] };
export type LegalDoc = { slug: string; title: string; updated: string; intro?: string[]; sections: LegalSection[] };

export const LEGAL: LegalDoc[] = [
  {
    slug: "terms", title: "Terms of service", updated: "October 2026",
    intro: ["Luxury Singles Vacations | International Competitions | Exclusive Resorts", `Effective Date: [To Be Determined] · Website: ${SITE.url} · Operator: ${SITE.company}`],
    sections: [
      { h: "1. Acceptance of Terms", p: ["By accessing the Paradise Club website, creating an account, registering for membership, or participating in any Paradise Club event, you agree to these Terms of Service and applicable additional event agreements."] },
      { h: "2. Eligibility and Membership", p: ["Paradise Club is an international travel and social membership community intended for adults."],
        list: ["Be at least 18 years old, or older where required by applicable law.", "Provide accurate registration information.", "Comply with membership and community standards.", "Respect the privacy, safety, and personal boundaries of other participants."],
        after: ["Paradise Club may approve, reject, suspend, or terminate membership for legitimate safety, fraud-prevention, or policy-enforcement reasons, subject to applicable law."] },
      { h: "3. Membership Benefits", p: ["Depending on the membership program and event availability, benefits may include:"],
        list: ["Access to member profiles and mutual introductions.", "Invitations to exclusive international vacations.", "Opportunities to participate in social events and competitions.", "Access to luxury resort and villa reservations.", "Exclusive member communications and event announcements."],
        after: ["Membership does not guarantee admission to a particular event, romantic compatibility, personal introductions, or availability of accommodations."] },
      { h: "4. Vacation Reservations and Payments", p: ["Paradise Club may organize seven-day, six-night luxury vacation experiences at selected international destinations. Reservation terms, deposits, payment schedules, included services, and cancellation conditions will be disclosed before purchase. A reservation is not confirmed until Paradise Club or its authorized booking provider issues written confirmation."] },
      { h: "5. Complimentary Attendance for Invited Women", p: ["Paradise Club may offer complimentary participation to eligible female attendees at selected events. **Complimentary participation does not automatically include airfare, accommodations, meals, transportation, excursions, or other expenses.** Eligibility, included benefits, availability, and restrictions will be disclosed in the official promotional terms."] },
      { h: "6. Competitions and Cash Prizes", p: ["Paradise Club plans to feature four competitions with the following **proposed, not guaranteed**, grand prizes:"],
        table: [["Competition", "Proposed Grand Prize"], ["Miss Paradise Contest", "$10,000"], ["Paradise Bikini Contest", "$10,000"], ["Paradise Lingerie Fashion Contest", "$10,000"], ["International Talent Competition", "$10,000"], ["Total proposed prizes", "$40,000"]],
        after: ["Each competition will require separate official rules covering eligibility, entry requirements, judging, disqualification, prize availability, taxes, and legal restrictions. Participation is voluntary. Photography, filming, and promotional use of a participant's likeness will be governed by applicable consent requirements and separate releases where necessary."] },
      { h: "7. Member Conduct and Safety", p: ["Members must not engage in harassment, discrimination, threats, stalking, sexual coercion, fraudulent activity, or unauthorized sharing of another member's personal information. Paradise Club may remove participants who violate established conduct and safety policies."] },
      { h: "8. Travel Risks and Responsibilities", p: ["International travel may involve risks associated with transportation, weather, health, recreational activities, and third-party providers. Participants are responsible for obtaining appropriate travel documents and complying with destination entry requirements. Liability limitations or activity waivers must be presented separately where legally required and will not exclude rights that cannot lawfully be waived."] },
      { h: "9. Cancellations and Refunds", p: ["Cancellation deadlines, refund eligibility, event postponements, and supplier-related charges will be disclosed in the applicable booking agreement. Paradise Club will comply with applicable consumer protection and travel regulations."] },
      { h: "10. Photography and Video", p: ["Paradise Club may photograph or film events for documentation and promotional purposes. Identifiable participants will be informed about photography and filming practices, and appropriate permissions or releases will be obtained where required."] },
      { h: "11. Intellectual Property", p: ["Paradise Club branding, original website content, logos, and proprietary materials may not be reproduced or commercially exploited without authorization. Members retain applicable ownership rights in their uploaded content."] },
      { h: "12. Disclaimers and Limitation of Liability", p: ["Paradise Club does not guarantee romantic relationships, compatibility, specific attendance numbers, or particular social outcomes. Any limitations of liability will apply only to the extent permitted by applicable law."] },
      { h: "13. Changes to Services", p: ["Paradise Club may modify membership features and event offerings, subject to existing contractual commitments and applicable consumer rights. Material changes to these Terms will be communicated appropriately."] },
      { h: "14. Governing Law", p: ["These Terms will be governed by the laws of **[State/Country of Operating Company]**, subject to mandatory consumer protections and other applicable laws."] },
      { h: "15. Contact Information", p: ["**Paradise Club**", `Legal Operator: ${SITE.company}`, "Address: [Business Address]", `Email: ${SITE.email}`] },
    ],
  },
  {
    slug: "privacy", title: "Privacy policy", updated: "October 2026",
    intro: ["Luxury Singles Vacations | International Competitions | Exclusive Resorts", `Effective Date: [To Be Determined] · Website: ${SITE.url} · Operator: ${SITE.company}`],
    sections: [
      { h: "1. Our Commitment to Privacy", p: ["Paradise Club respects the privacy of its members and website visitors. We are committed to protecting personal information and providing members with appropriate control over their profiles, communications, and participation in the Paradise Club community."] },
      { h: "2. Information We Collect", p: ["Depending on services used, Paradise Club may collect:"],
        list: ["Personal information: name, email, telephone number, date of birth or age verification, country of residence, and account credentials.", "Membership information: profile photos/videos, interests, preferences, biography, and optional member-provided information.", "Reservation information: event bookings, travel preferences, accommodation selections, and payment transaction information.", "Technical information: IP address, device/browser information, website usage, and cookie preferences."],
        after: ["Sensitive information will be collected only when necessary and with an appropriate legal basis."] },
      { h: "3. How We Use Personal Information", p: ["Paradise Club may process information to:"],
        list: ["Create and manage accounts and provide member introductions and communications.", "Process event registrations and reservations.", "Verify eligibility for competitions and promotions.", "Send booking confirmations and service updates.", "Maintain community safety and prevent fraud.", "Comply with applicable legal obligations."],
        after: ["Marketing communications will be managed according to applicable consent and opt-out requirements."] },
      { h: "4. Member Profiles and Privacy Controls", p: ["Paradise Club intends to provide privacy-conscious member profiles. Members may be able to control which details are visible to others. Private messaging and introductions will be designed around mutual consent. Members should not publish sensitive personal information in publicly visible profile fields."] },
      { h: "5. Sharing of Personal Information", p: ["Paradise Club may share necessary information with authorized service providers, including:"],
        list: ["Hotels, resorts, and reservation or travel service providers.", "Payment processors.", "Website hosting and technology providers.", "Event production and management partners.", "Identity-verification providers, where applicable."],
        after: ["Personal information will not be sold to third parties unless specifically disclosed and permitted by applicable law."] },
      { h: "6. Photography, Video, and Promotional Content", p: ["Events may include professional photography and video production. Promotional use of identifiable member images or recordings will be subject to applicable notice, consent, and release requirements. Members may contact Paradise Club regarding privacy concerns involving published media."] },
      { h: "7. Data Security", p: ["Paradise Club will implement reasonable administrative, technical, and organizational measures designed to protect personal information. These may include encryption, restricted access, account authentication, and secure payment processing. No internet-based system can guarantee absolute security."] },
      { h: "8. International Data Transfers", p: ["Because Paradise Club plans international events, personal information may be processed outside a member's country of residence. Where required, Paradise Club will implement appropriate safeguards for international transfers."] },
      { h: "9. Cookies and Tracking Technologies", p: ["The website may use cookies or similar technologies for functionality, security, analytics, and, where enabled, marketing. Visitors will receive appropriate disclosures and consent choices as required by law."] },
      { h: "10. Data Retention", p: ["Personal information will be retained only as long as reasonably necessary for disclosed purposes, contractual obligations, legal compliance, and legitimate business requirements. Specific retention periods will be established based on the information collected."] },
      { h: "11. Member Privacy Rights", p: ["Depending on applicable law, individuals may have rights to:"],
        list: ["Access, correct, or request deletion of personal information.", "Withdraw applicable consent or object to certain processing.", "Request copies of eligible personal information.", "Opt out of certain advertising or data-sharing practices."],
        after: ["Paradise Club will provide a designated process for privacy requests."] },
      { h: "12. Account Deletion", p: ["Members may request account deletion through the designated privacy channel. Certain information may be retained where required by law or necessary for legitimate, legally permitted purposes."] },
      { h: "13. Children's Privacy", p: ["Paradise Club services are intended for adults. Individuals under 18 are not permitted to register as members. Paradise Club does not knowingly collect personal information from children through its membership platform."] },
      { h: "14. Changes to This Policy", p: ["Paradise Club may update this Privacy Policy as its services and legal obligations evolve. Material changes will be communicated as required by applicable law."] },
      { h: "15. Privacy Contact", p: ["**Paradise Club - Privacy Department**", `Email: ${SITE.email}`, "Address: [Business Address]"] },
    ],
  },
  {
    slug: "cancellation", title: "Cancellation & refund policy", updated: "October 2026",
    sections: [
      { h: "How refunds are calculated", p: ["Each event shows its cancellation tiers at checkout. Unless the event states otherwise the default is: 90+ days before arrival — 90% of amounts paid refunded; 60–89 days — 50%; 30–59 days — 25%; under 30 days — no refund."] },
      { h: "How to cancel", p: ["Request a cancellation from My account → Bookings, or contact reservations. Your request is confirmed in writing and refunds are returned to the original payment method, usually within 5–10 business days."] },
      { h: "Scheduled payments", p: ["When a booking is cancelled, any remaining scheduled instalments are cancelled immediately."] },
      { h: "If we cancel or change an event", p: ["If Paradise Club cancels an event or cannot provide the reserved property, you may choose a full refund of amounts paid for that event, a transfer to another month, or an equivalent alternative resort."] },
      { h: "Activities", p: ["Optional activities booked through your account may be refunded up to 72 hours before the activity, unless the operator states otherwise."] },
    ],
  },
  {
    slug: "contest-rules", title: "Contest rules", updated: "October 2026",
    sections: [
      { h: "The competitions", p: ["The Miss Paradise Contest, Paradise Bikini Contest, Paradise Lingerie Fashion Contest and International Talent Competition are skill- and presentation-based competitions judged by a panel at each event. No purchase or entry fee is required to enter."] },
      { h: "Eligibility", p: ["Entrants must be at least 18 years old, attending the event as a Paradise Club guest, and must sign the participant and media release before performing."] },
      { h: "Prizes", p: ["Prize amounts shown on this website are proposed. Prizes, funding, eligibility, judging, age requirements, and official rules must be finalized before any competition is confirmed. The confirmed prize for each competition, its conditions and the method and timing of payment are set out in the official rules issued for that event before it starts. Winners are responsible for any taxes."] },
      { h: "Judging", p: ["Criteria are published in the official rules for each competition. Judges' decisions are final. Any entrant who breaches the community standards may be disqualified."] },
      { h: "Broadcast", p: ["Competitions may be filmed and streamed live on YouTube and social media."] },
    ],
  },
  {
    slug: "community", title: "Community standards", updated: "October 2026",
    sections: [
      { h: "Respect", p: ["Paradise Club is built on consent and respect. No harassment, threats, hate, or pressure of any kind — online or at events."] },
      { h: "Consent-based contact", p: ["Members can message each other only after an introduction is accepted. Accepting an introduction is never an obligation."] },
      { h: "Honest profiles", p: ["Use your own recent photos and real information. One account per person. No commercial solicitation."] },
      { h: "Safety tools", p: ["You can block or report any member. Reports are reviewed by our team, and accounts that break these standards are suspended or removed."] },
      { h: "Adults only", p: ["All members and guests must be 18 or older. Accounts that misstate age are removed."] },
    ],
  },
];
