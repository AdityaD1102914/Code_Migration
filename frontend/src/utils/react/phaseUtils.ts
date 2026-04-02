import {
  AlertCircle,
  Clock,
  RefreshCw,
  FileCode,
  Sparkles,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export const getPhaseColor = (phaseId) => {
  const colors = [
    "blue",
    "purple",
    "indigo",
    "green",
    "yellow",
    "teal",
    "emerald",
    "pink",
    "rose",
  ];
  return colors[(phaseId - 1) % colors.length];
};

export const getPhaseIcon = (title) => {
  const lowerTitle = title.toLowerCase();
  if (
    lowerTitle.includes("assess") ||
    lowerTitle.includes("planning") ||
    lowerTitle.includes("setup")
  ) {
    return AlertCircle;
  } else if (
    lowerTitle.includes("foundation") ||
    lowerTitle.includes("config") ||
    lowerTitle.includes("prepare")
  ) {
    return Clock;
  } else if (
    lowerTitle.includes("migration") ||
    lowerTitle.includes("convert") ||
    lowerTitle.includes("refactor")
  ) {
    return RefreshCw;
  } else if (lowerTitle.includes("state") || lowerTitle.includes("hook")) {
    return FileCode;
  } else if (
    lowerTitle.includes("optim") ||
    lowerTitle.includes("performance")
  ) {
    return Sparkles;
  } else if (
    lowerTitle.includes("test") ||
    lowerTitle.includes("qa") ||
    lowerTitle.includes("quality")
  ) {
    return CheckCircle;
  } else if (
    lowerTitle.includes("cleanup") ||
    lowerTitle.includes("document") ||
    lowerTitle.includes("final")
  ) {
    return CheckCircle;
  }
  return ArrowRight;
};

export const getColorClasses = (color) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    green: "bg-green-100 text-green-700 border-green-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    teal: "bg-teal-100 text-teal-700 border-teal-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pink: "bg-pink-100 text-pink-700 border-pink-200",
    rose: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return colors[color] || colors.blue;
};
