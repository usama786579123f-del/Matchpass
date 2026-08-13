const SECTIONS = [
  {
    title: '1. Information we collect',
    body: 'We collect information you provide directly (name, email, payment details, identity documents for KYC) and information collected automatically (device data, usage patterns, cookies).',
  },
  {
    title: '2. How we use your information',
    body: 'We use your data to process transactions, verify seller identity, prevent fraud, provide customer support, and improve our services. We do not sell your personal data to third parties.',
  },
  {
    title: '3. Identity verification data',
    body: 'Seller identity documents are processed via Stripe Identity and are encrypted in transit and at rest. MatchPass does not store raw identity documents on its own servers.',
  },
  {
    title: '4. Payment data',
    body: 'All payment processing is handled by Stripe, a PCI-DSS compliant payment processor. MatchPass does not store full card details on its servers.',
  },
  {
    title: '5. Data sharing',
    body: 'We share data with service providers strictly necessary to operate the platform (payment processing, identity verification, email delivery, cloud hosting) under appropriate data protection agreements.',
  },
  {
    title: '6. Your rights (UK/EU GDPR)',
    body: 'You have the right to access, correct, delete, or export your personal data, and to object to certain processing. Contact support@matchpass.com to exercise these rights.',
  },
  {
    title: '7. Data retention',
    body: 'We retain transaction records as required by UK tax and financial regulations. Other personal data is retained only as long as necessary for the purposes it was collected.',
  },
  {
    title: '8. Cookies',
    body: 'We use essential cookies to operate the platform and analytics cookies to understand usage patterns. You can manage cookie preferences in your browser settings.',
  },
];

const Privacy = () => {
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="font-display text-display-sm text-ink">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: January 2026</p>

      <div className="mt-10 flex flex-col gap-8">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">
              {section.title}
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Privacy;