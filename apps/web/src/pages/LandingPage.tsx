import { ArrowRight, ArrowUp, MessageCircleQuestion } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import GatewayFlow from "@/components/ui/gateway-flow";
import { cn } from "../lib/cn";
import { useCountUp } from "../lib/useCountUp";
import { Button } from "../components/ui/Button";

// -- imagery --------------------------------------------------------------
const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}`;

const PHOTO = {
  grads: "photo-1541339907198-e08756dedf3f", // caps in the air at sunset, skyline
  students: "photo-1517486808906-6ca8b3f04846", // five students, smiling
  help: "photo-1522202176988-66273c2fd55f", // three at a laptop, one helping
  planning: "photo-1543269865-cbf427effbad", // students around a table
  flatlay: "photo-1488646953014-85cb44e25828", // notebook, camera, map, backpack
  friends: "photo-1529156069898-49953e39b3ac", // arms round shoulders, mountains
  departure: "photo-1436491865332-7a61a109cc05" // wing above the clouds at sunset
} as const;

// -- data ---------------------------------------------------------------
const steps = [
  ["Profile", "Your grades, test scores, budget, and where you want to go."],
  ["Match", "Universities and scholarships ranked by how well they actually fit."],
  ["Fund", "The real total cost, and the funding gap, for every option."],
  ["Apply", "Documents and every deadline, tracked in one place."],
  ["Depart", "Visa requirements sorted well before the appointment."]
] as const;

const faqs = [
  [
    "Is StudyCompass free?",
    "Building a profile, getting matched, and using the calculators is free. You just make an account."
  ],
  [
    "Which countries does it cover?",
    "Matching and cost data span the US, UK, Canada, Australia, Germany and more, with visa guidance for the common destinations."
  ],
  [
    "How does the matching work?",
    "It checks your grades, scores, budget and preferences against each program's real requirements, then groups the results into safe, target and reach."
  ],
  [
    "Do universities see my profile?",
    "No. Your profile stays in your account and is only used to build your matches and recommendations."
  ]
] as const;

// -- page -------------------------------------------------------------
export function LandingPage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Bento />
      <HowItWorks />
      <Reassurance />
      <Faq />
      <FinalCta />
      <BackToTop />
    </>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Portalled to <body> so `position: fixed` isn't captured by the animated
  // .route-anim wrapper (which establishes a transform containing block).
  return createPortal(
    <button
      type="button"
      aria-label="Back to top"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth"
        })
      }
      className={cn(
        "fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground-muted shadow-lg transition duration-200 hover:-translate-y-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:bottom-8 sm:right-8",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      )}
    >
      <ArrowUp className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
    </button>,
    document.body
  );
}

// -- hero -------------------------------------------------------------
function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:py-20">
      <div>
        <h1 className="landing-rise landing-rise-1 font-display text-[clamp(2.5rem,6vw,4rem)] font-[560] leading-[1.02] tracking-[-0.03em] text-foreground">
          You bring the ambition. We&rsquo;ll handle the logistics.
        </h1>
        <p className="landing-rise landing-rise-2 mt-5 max-w-xl text-lg leading-relaxed text-foreground-muted">
          StudyCompass turns studying abroad — universities, scholarships, costs, deadlines,
          visas — into one plan that&rsquo;s actually yours to follow. Free to start.
        </p>
        <div className="landing-rise landing-rise-3 mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button variant="accent" size="lg" asChild>
            <Link to="/register" viewTransition>
              Build my plan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <a
            href="#how"
            className="link-wipe text-sm font-medium text-foreground-muted hover:text-foreground"
          >
            See how it works
          </a>
        </div>
        <div className="landing-rise landing-rise-4 mt-8 flex items-center gap-3">
          <div className="flex -space-x-2">
            {[PHOTO.students, PHOTO.planning, PHOTO.help, PHOTO.friends].map((p) => (
              <img
                key={p}
                src={img(p, 64)}
                alt=""
                loading="lazy"
                className="h-8 w-8 rounded-full border-2 border-background object-cover"
              />
            ))}
          </div>
          <p className="text-sm text-foreground-subtle">
            Students planning their move to 6 countries
          </p>
        </div>
      </div>

      <figure className="landing-rise landing-rise-3 relative">
        <div className="aspect-[5/4] overflow-hidden rounded-2xl border border-border sm:aspect-[16/10] lg:aspect-[7/6]">
          <img
            src={img(PHOTO.grads, 1100)}
            alt="Graduates throwing their caps against a city skyline at sunset"
            className="h-full w-full object-cover object-[50%_35%]"
          />
        </div>
        <figcaption className="absolute -bottom-5 -left-3 w-max max-w-[15rem] rounded-xl border border-border bg-surface p-3 shadow-[0_16px_44px_-16px_hsl(28_25%_18%_/_0.3)] sm:-left-5">
          <p className="text-xs font-medium text-foreground-subtle">Scholarship match</p>
          <p className="mt-0.5 font-display text-lg font-[560] text-foreground">USD 12,000 / year</p>
          <p className="text-xs text-foreground-muted">Full-tuition award — you&rsquo;re eligible</p>
        </figcaption>
      </figure>
    </section>
  );
}

// -- trust strip -----------------------------------------------------
function TrustStrip() {
  return (
    <section className="border-y border-border bg-surface-muted/60">
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6 px-4 py-8 sm:px-6">
        <TrustStat to={6} label="study destinations" />
        <TrustStat to={90} suffix="+" label="scholarships tracked" />
        <TrustStat to={12} label="tools, one workspace" />
      </div>
    </section>
  );
}

function TrustStat({ to, suffix = "", label }: { to: number; suffix?: string; label: string }) {
  const { value, ref } = useCountUp(to);
  return (
    <div>
      <p className="font-display text-3xl font-[560] tabular-nums tracking-[-0.02em] text-foreground">
        <span ref={ref}>{value}</span>
        {suffix}
      </p>
      <p className="mt-1 text-sm text-foreground-muted">{label}</p>
    </div>
  );
}

// -- bento ----------------------------------------------------------
function Bento() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="max-w-2xl">
        <h2 className="font-display text-[clamp(1.9rem,4vw,2.5rem)] font-[560] leading-[1.08] tracking-[-0.02em] text-foreground">
          You don&rsquo;t have to figure this out alone.
        </h2>
        <p className="mt-3 text-lg text-foreground-muted">
          Every part of the process lives in one place — with a next step waiting whenever you
          open it.
        </p>
      </div>

      <div className="mt-10 grid auto-rows-[13rem] grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <BentoCell className="col-span-2 row-span-2" d={0} padded={false}>
          <img
            src={img(PHOTO.students, 900)}
            alt="A group of students smiling together"
            className="reveal-img absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="font-display text-xl font-[560] text-white">
              Real students, heading abroad this year
            </p>
            <p className="mt-1 text-sm text-white/80">
              Matched, funded, and packed — using the same plan you&rsquo;re about to start.
            </p>
          </div>
        </BentoCell>

        <BentoCell className="col-span-2" d={0.06}>
          <p className="text-xs font-medium text-foreground-subtle">University matching</p>
          <div className="mt-3 space-y-2">
            {[
              ["MSc Computer Science", "Safe", "bg-success", 86],
              ["MS Data Science", "Target", "bg-info", 72],
              ["MSc Artificial Intelligence", "Reach", "bg-warning", 58]
            ].map(([name, tag, dot, score]) => (
              <div key={name as string} className="flex items-center gap-3 text-sm">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", dot as string)} />
                <span className="min-w-0 flex-1 truncate text-foreground">{name}</span>
                <span className="text-foreground-subtle">{tag}</span>
                <span className="font-display font-[560] tabular-nums text-foreground">{score}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-foreground-muted">Sorted by real fit, not by ranking.</p>
        </BentoCell>

        <BentoCell d={0.12}>
          <p className="text-xs font-medium text-foreground-subtle">Matched to date</p>
          <BentoStat to={2100000} format={(v) => `USD ${(v / 1_000_000).toFixed(1)}M+`} />
          <p className="mt-1.5 text-sm leading-6 text-foreground-muted">
            in scholarships students turned out to be eligible for.
          </p>
        </BentoCell>

        <BentoCell d={0.18} padded={false}>
          <img
            src={img(PHOTO.flatlay, 500)}
            alt="A notebook, camera and map laid out for trip planning"
            className="reveal-img absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <p className="absolute bottom-4 left-4 font-display text-base font-[560] text-white">
            Plan it like a trip
          </p>
        </BentoCell>

        <BentoCell className="col-span-2" d={0.1}>
          <p className="text-xs font-medium text-foreground-subtle">One timeline for everything</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ["Application", "Nov 15"],
              ["Scholarship", "Dec 1"],
              ["Visa appointment", "Feb 20"]
            ].map(([k, v]) => (
              <span
                key={k}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs"
              >
                <span className="font-medium text-foreground">{k}</span>
                <span className="text-foreground-subtle">{v}</span>
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-foreground-muted">
            Application, scholarship and visa dates — nothing slips.
          </p>
        </BentoCell>

        <BentoCell d={0.16}>
          <MessageCircleQuestion className="h-5 w-5 text-accent" strokeWidth={1.8} aria-hidden="true" />
          <p className="mt-3 rounded-lg rounded-bl-sm bg-surface-muted px-3 py-2 text-sm text-foreground">
            Why is this one a reach for me?
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground-muted">
            Because their average GPA sits just above yours — a strong essay closes the gap.
          </p>
        </BentoCell>

        <BentoCell d={0.22}>
          <p className="text-xs font-medium text-foreground-subtle">Full cost, no surprises</p>
          <BentoStat to={41200} format={(v) => `USD ${v.toLocaleString()}`} />
          <p className="mt-1.5 text-sm leading-6 text-foreground-muted">
            Tuition, living, visa, insurance and flights.
          </p>
        </BentoCell>
      </div>
    </section>
  );
}

function BentoCell({
  className,
  d = 0,
  padded = true,
  children
}: {
  className?: string;
  d?: number;
  padded?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "reveal relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface",
        padded && "p-5",
        className
      )}
      style={{ "--d": `${d}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

function BentoStat({ to, format }: { to: number; format: (v: number) => string }) {
  const { value, ref } = useCountUp<HTMLParagraphElement>(to, 1400);
  return (
    <p
      ref={ref}
      className="mt-2 font-display text-[1.75rem] font-[560] leading-none tracking-[-0.02em] text-accent"
    >
      {format(value)}
    </p>
  );
}

// -- how it works --------------------------------------------------
function HowItWorks() {
  return (
    <section id="how" className="border-t border-border bg-surface-muted/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:py-24">
        <figure className="reveal-img overflow-hidden rounded-2xl border border-border">
          <img
            src={img(PHOTO.planning, 900)}
            alt="Students planning together around a table"
            className="aspect-[4/3] w-full object-cover"
          />
        </figure>

        <div>
          <h2 className="font-display text-[clamp(1.9rem,4vw,2.5rem)] font-[560] leading-[1.08] tracking-[-0.02em] text-foreground">
            Five steps, and you&rsquo;re never guessing what&rsquo;s next.
          </h2>
          <ol className="mt-8 space-y-6">
            {steps.map(([name, body], i) => (
              <li key={name} className="reveal flex gap-4" style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}>
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-muted font-display text-sm font-[560] text-accent">
                  {i + 1}
                </span>
                <div>
                  <p className="font-display text-lg font-[540] text-foreground">{name}</p>
                  <p className="mt-0.5 text-sm leading-6 text-foreground-muted">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// -- reassurance -------------------------------------------------
function Reassurance() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
      <figure className="reveal-img order-last overflow-hidden rounded-2xl border border-border lg:order-first">
        <img
          src={img(PHOTO.friends, 1000)}
          alt="Friends with arms around each other looking out over the mountains"
          className="aspect-[5/4] w-full object-cover"
        />
      </figure>

      <div>
        <p className="reveal font-display text-[clamp(1.6rem,3.4vw,2.15rem)] font-[500] leading-[1.28] tracking-[-0.01em] text-foreground">
          Studying abroad is a lot to carry. StudyCompass holds the whole plan — and always
          tells you the next thing to do.
        </p>
        <p className="reveal mt-5 text-lg leading-relaxed text-foreground-muted" style={{ "--d": "0.08s" } as React.CSSProperties}>
          Match results you can trust. Scholarships you&rsquo;re actually eligible for. An
          advisor that already knows your profile. Open it whenever you&rsquo;re stuck.
        </p>
      </div>
    </section>
  );
}

// -- faq ------------------------------------------------------
function Faq() {
  return (
    <section id="faq" className="border-t border-border">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 className="font-display text-[clamp(1.9rem,4vw,2.5rem)] font-[560] tracking-[-0.02em] text-foreground">
          Questions
        </h2>
        <div className="mt-8">
          {faqs.map(([q, a], i) => (
            <details
              key={q}
              className={cn("group border-t border-border", i === faqs.length - 1 && "border-b")}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-foreground transition-colors hover:text-foreground-muted [&::-webkit-details-marker]:hidden">
                {q}
                <span className="shrink-0 text-lg leading-none text-accent transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="max-w-[54ch] pb-4 text-sm leading-6 text-foreground-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// -- final cta -----------------------------------------------
function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-black text-white">
      <img
        src={img(PHOTO.departure, 1600)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-65"
      />
      <GatewayFlow
        mode="dark"
        opacity={0.22}
        className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen"
        style={{ pointerEvents: "none" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />

      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <h2 className="font-display text-[clamp(2rem,5vw,3rem)] font-[560] leading-[1.05] tracking-[-0.02em]">
          Your plan is five minutes away.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-white/70">
          Set up your profile, and your matches are ready by the time you&rsquo;re done.
        </p>
        <Button variant="accent" size="lg" className="mt-7" asChild>
          <Link to="/register" viewTransition>
            Build my plan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <p className="mt-4 text-sm text-white/50">Free to start. No card.</p>
      </div>
    </section>
  );
}
