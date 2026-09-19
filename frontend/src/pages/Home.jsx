import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Search, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: Users,
      title: 'For founders',
      body: 'Build one profile — traction, team, fundraising ask — and control exactly who sees it.',
    },
    {
      icon: Search,
      title: 'For investors',
      body: 'Filter by sector, stage, geography and traction. Shortlist, annotate, and track deals in one place.',
    },
    {
      icon: TrendingUp,
      title: 'Built to grow',
      body: 'Matching scores, warm intros, and verification are on the roadmap — the data model is ready for them.',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="hero-gradient absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute -top-10 right-10 h-40 w-40 rounded-full bg-signal/5 blur-3xl animate-float" />
      <div className="pointer-events-none absolute top-40 left-[-40px] h-32 w-32 rounded-full bg-clay/5 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

      <div className="mx-auto max-w-6xl px-6 py-24">
        <motion.div initial="hidden" animate="show" className="max-w-2xl">
          <motion.p variants={fadeUp} custom={0} className="mb-4 text-sm tracking-wide text-signal flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            Founder & Startup Discovery
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-5xl leading-tight text-ink mb-6">
            Where the right founders and the right investors find each other.
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-lg text-ink/70 mb-10 leading-relaxed">
            Meridian gives founders one clean profile to maintain, and gives investment
            teams a searchable, filterable view of the startups worth their time —
            with private notes and pipeline tracking built in.
          </motion.p>

          {!user && (
            <motion.div variants={fadeUp} custom={3} className="flex gap-4">
              <Link to="/register" className="btn-primary group">
                Get started
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/login" className="btn-secondary">Log in</Link>
            </motion.div>
          )}
        </motion.div>

        <div className="mt-24 grid grid-cols-1 gap-8 border-t border-line pt-12 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center border border-line text-signal transition-all duration-200 group-hover:border-signal group-hover:bg-signal group-hover:text-paper">
                <Icon size={17} strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-lg mb-2">{title}</h3>
              <p className="text-sm text-ink/60">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
