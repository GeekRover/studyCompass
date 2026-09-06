import {
  Bot,
  Bookmark,
  Calculator,
  CalendarDays,
  ClipboardList,
  FileText,
  Gauge,
  Globe2,
  GraduationCap,
  Plane,
  Search,
  ShieldCheck,
  UserRound,
  type LucideIcon
} from "lucide-react";

export type NavItem = { label: string; to: string; icon: LucideIcon };
export type NavGroup = { heading: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    heading: "Plan",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: Gauge },
      { label: "Profile", to: "/profile", icon: UserRound },
      { label: "Readiness", to: "/readiness", icon: ShieldCheck }
    ]
  },
  {
    heading: "Match",
    items: [
      { label: "University Search", to: "/matches", icon: Search },
      { label: "Country Decision", to: "/countries", icon: Globe2 }
    ]
  },
  {
    heading: "Fund",
    items: [
      { label: "Scholarships", to: "/scholarships", icon: GraduationCap },
      { label: "Saved Items", to: "/saved", icon: Bookmark },
      { label: "Cost Calculator", to: "/cost-calculator", icon: Calculator }
    ]
  },
  {
    heading: "Apply",
    items: [
      { label: "Strategy Builder", to: "/application-strategy", icon: ClipboardList },
      { label: "Documents", to: "/documents", icon: FileText },
      { label: "Deadline Monitor", to: "/deadlines", icon: CalendarDays }
    ]
  },
  {
    heading: "Prepare",
    items: [
      { label: "Visa Prep Hub", to: "/visa-hub", icon: Plane },
      { label: "AI Advisor", to: "/advisor", icon: Bot }
    ]
  }
];

const allItems = navGroups.flatMap((group) => group.items);

/** Page title for a pathname, e.g. "/matches" -> "University Search". */
export function titleForPath(pathname: string): string {
  const match = allItems.find(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`)
  );
  return match ? match.label : "StudyCompass";
}
