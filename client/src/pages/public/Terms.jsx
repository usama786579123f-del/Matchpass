const SECTIONS = [
  {
    title: '1. Acceptance of terms',
    body: 'By accessing or using MatchPass, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform.',
  },
  {
    title: '2. Marketplace role',
    body: 'MatchPass is a marketplace connecting ticket buyers and sellers. We facilitate payment and delivery verification through our escrow system but are not the seller of record for any ticket listed by a third party.',
  },
  {
    title: '3. Escrow and payments',
    body: 'Buyer payments are held in escrow until delivery is confirmed. Sellers must deliver tickets within 48 hours of sale. Funds are released to sellers 24 hours after the event, provided no valid dispute has been raised.',
  },
  {
    title: '4. Seller obligations',
    body: 'Sellers must complete identity verification before listing. Listed tickets must be genuine, valid for entry, and accurately described. Repeated valid disputes against a seller may result in tier downgrade, restriction, or account suspension.',
  },
  {
    title: '5. Disputes and refunds',
    body: 'Buyers may raise a dispute if a ticket is not received, invalid, or materially different from its listing. Our team reviews disputes within 48 hours and may issue a full refund, partial refund, or uphold the sale.',
  },
  {
    title: '6. Fees',
    body: 'MatchPass charges a service fee on completed purchases, shown transparently before checkout. Fees are non-refundable except where a full refund is issued for a valid dispute.',
  },
  {
    title: '7. Account suspension',
    body: 'We reserve the right to suspend or terminate accounts found to be in violation of these terms, engaging in fraudulent activity, or posing a risk to other users.',
  },
  {
    title: '8. Limitation of liability',
    body: 'MatchPass is not liable for losses arising from events outside our reasonable control, including but not limited to event cancellations, postponements, or venue changes made by organisers.',
  },
];

const Terms = () => {
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="font-display text-display-sm text-ink">Terms of Service</h1>
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

export default Terms;