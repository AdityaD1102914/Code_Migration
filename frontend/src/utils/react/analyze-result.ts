// src/utils/react/phaseTabs.config.ts
import { Info, ListChecks, Lightbulb, Cpu, Wrench } from "lucide-react";

/** Utility: truthy, non-empty trimmed string */
export const hasText = (t?: string): boolean => typeof t === "string" && t.trim().length > 0;

/** Badge color classes for known categories (kept static to avoid Tailwind purge) */
export const categoryBadge: Record<string, string> = {
    task: "bg-purple-100 text-purple-800",
    insight: "bg-green-100 text-green-800",
    capability: "bg-blue-100 text-blue-800",
    tool: "bg-gray-100 text-gray-800",
    default: "bg-gray-100 text-gray-800",
};

/** Badge color classes for priorities */
export const priorityBadge: Record<string, string> = {
    high: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-blue-100 text-blue-800",
    default: "bg-gray-100 text-gray-800",
};

/** Small dot indicators for priorities */
export const priorityDot: Record<string, string> = {
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-blue-500",
    default: "bg-gray-500",
};

/** Tab metadata (key + label + icon) */
export const TAB_META = [
    { key: "overview", label: "Overview", Icon: Info },
    { key: "task", label: "Tasks", Icon: ListChecks },
    { key: "insight", label: "Insights", Icon: Lightbulb },
    { key: "capability", label: "Capabilities", Icon: Cpu },
    { key: "tool", label: "Tools", Icon: Wrench },
] as const;

export type TabKey = (typeof TAB_META)[number]["key"];

/** Per-tab UI colors (active/hover/icon/badge) */
export const TAB_COLORS: Record<
    TabKey,
    {
        activeBg: string;
        activeText: string;
        activeBorder: string;
        hoverBg: string;
        iconActive: string;
        iconInactive: string;
        badgeBg: string;
        badgeText: string;
    }
> = {
    overview: {
        activeBg: "from-sky-100 to-indigo-100",
        activeText: "text-indigo-900",
        activeBorder: "border-indigo-200",
        hoverBg: "hover:bg-indigo-50",
        iconActive: "text-indigo-900",
        iconInactive: "text-gray-600",
        badgeBg: "bg-indigo-100",
        badgeText: "text-indigo-800",
    },
    task: {
        activeBg: "from-purple-100 to-violet-100",
        activeText: "text-purple-900",
        activeBorder: "border-purple-200",
        hoverBg: "hover:bg-purple-50",
        iconActive: "text-purple-900",
        iconInactive: "text-gray-600",
        badgeBg: "bg-purple-100",
        badgeText: "text-purple-800",
    },
    insight: {
        activeBg: "from-green-100 to-emerald-100",
        activeText: "text-green-900",
        activeBorder: "border-green-200",
        hoverBg: "hover:bg-green-50",
        iconActive: "text-green-900",
        iconInactive: "text-gray-600",
        badgeBg: "bg-green-100",
        badgeText: "text-green-800",
    },
    capability: {
        activeBg: "from-blue-100 to-sky-100",
        activeText: "text-blue-900",
        activeBorder: "border-blue-200",
        hoverBg: "hover:bg-blue-50",
        iconActive: "text-blue-900",
        iconInactive: "text-gray-600",
        badgeBg: "bg-blue-100",
        badgeText: "text-blue-800",
    },
    tool: {
        activeBg: "from-gray-100 to-slate-100",
        activeText: "text-gray-900",
        activeBorder: "border-gray-200",
        hoverBg: "hover:bg-gray-100",
        iconActive: "text-gray-900",
        iconInactive: "text-gray-600",
        badgeBg: "bg-gray-100",
        badgeText: "text-gray-800",
    },
};
