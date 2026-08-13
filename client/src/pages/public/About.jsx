import { ShieldCheck, Users, Zap, Award } from 'lucide-react';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Trust first',
    desc: 'Every transaction is protected by escrow. Every seller is identity verified. No exceptions.',
  },
  {
    icon: Zap,
    title: 'Speed matters',
    desc: 'Fast payouts, fast dispute resolution, fast support — because match day waits for no one.',
  },
  {
    icon: Users,
    title: 'Fans first',
    desc: 'We built MatchPass because fans deserve a safer way to buy and sell tickets they can trust.',
  },
  {
    icon: Award,
    title: 'Fair pricing',
    desc: 'Transparent fees, comparable pricing data, and no hidden surprises at checkout.',
  },
];

const About = () => {
  return (
    <div>
      <section className="bg-ink py-20">
        <div className="container-page text-center">
          <h1 className="font-display text-display-lg text-white">
            Built for fans, by fans.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            MatchPass is the UK's trusted marketplace for buying and selling
            football match tickets — safely, fairly, and fast.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-display-sm text-ink">Our story</h2>
          <p className="mt-4 text-slate-600">
            Every season, thousands of fans miss out on matches simply because
            official channels sell out in minutes — or find themselves stuck
            with tickets they can no longer use. Existing resale options were
            either untrustworthy or expensive. We built MatchPass to fix that:
            a marketplace where buyers know their money is safe, and sellers
            know they'll be paid fast.
          </p>
        </div>
      </section>

      <section className="bg-bg-subtle py-16">
        <div className="container-page">
          <h2 className="mb-10 text-center font-display text-display-sm text-ink">
            What we stand for
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;