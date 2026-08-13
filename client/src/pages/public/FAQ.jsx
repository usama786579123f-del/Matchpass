import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    category: 'Buying',
    items: [
      {
        q: 'How does escrow protection work?',
        a: "When you buy a ticket, your payment is held securely by MatchPass rather than going directly to the seller. Once the seller uploads delivery proof and you confirm receipt (or the review window passes without issue), funds are released to the seller. If something goes wrong, you're covered.",
      },
      {
        q: 'What if my ticket never arrives?',
        a: 'Sellers have 48 hours to deliver after purchase. If they miss this deadline, you are automatically refunded in full — no need to contact support.',
      },
      {
        q: 'Can I get a refund if the ticket is invalid?',
        a: "Yes. Raise a dispute from your order page with evidence, and our team will review it within 48 hours and issue a full or partial refund if the dispute is upheld.",
      },
    ],
  },
  {
    category: 'Selling',
    items: [
      {
        q: 'Why do I need to verify my identity?',
        a: "Identity verification protects buyers from fraudulent listings and helps us maintain a trustworthy marketplace. It's a one-time process that takes a few minutes.",
      },
      {
        q: 'When do I get paid?',
        a: 'Once your ticket delivery is confirmed by the buyer — or 24 hours after the match with no dispute raised — funds are automatically transferred to your account.',
      },
      {
        q: 'What happens if I miss the delivery deadline?',
        a: 'The buyer is automatically refunded, the order is cancelled, and repeated missed deadlines may affect your seller tier and ability to list in future.',
      },
    ],
  },
  {
    category: 'Fees & Payments',
    items: [
      {
        q: 'What fees does MatchPass charge?',
        a: 'Buyers pay a transparent service fee shown clearly at checkout before payment. There are no hidden charges.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'We accept all major debit and credit cards via Stripe, our secure payment processor.',
      },
    ],
  },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <span className="font-medium text-ink">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <p className="px-5 pb-5 text-sm text-slate-500">{a}</p>}
    </div>
  );
};

const FAQ = () => {
  return (
    <div className="container-page max-w-3xl py-16">
      <div className="text-center">
        <h1 className="font-display text-display-sm text-ink">
          Frequently asked questions
        </h1>
        <p className="mt-2 text-slate-500">
          Everything you need to know about buying and selling on MatchPass.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-10">
        {FAQ_ITEMS.map((section) => (
          <div key={section.category}>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">
              {section.category}
            </h2>
            <div className="flex flex-col gap-3">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;