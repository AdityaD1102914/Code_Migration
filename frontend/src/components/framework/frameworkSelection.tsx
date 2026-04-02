import React from "react";
import { Zap, Code2, RefreshCw } from "lucide-react";

const FrameworkSelection = ({ selectedFramework, onSelectFramework }: any) => {

  const baseCard =
    "bg-white rounded-xl shadow-lg p-8 cursor-pointer transform transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const selectedCard = "ring-2 ring-indigo-500";

  const frameworks = [
    {
      id: "react",
      icon: <Zap className="w-12 h-12 text-purple-600" />,
      title: "React Version Migration",
      description:
        "Upgrade your React project to the latest version with automatic code updates.",
      iconBg: "bg-purple-100",
    },
    {
      id: "angular",
      icon: <Code2 className="w-12 h-12 text-red-600" />,
      title: "Angular Version Migration",
      description:
        "Migrate your Angular application to the latest version with automated transformations.",
      iconBg: "bg-red-100",
    },
    // New card: JSP → React Conversion
    {
      id: "jsp",
      icon: <RefreshCw className="w-12 h-12 text-indigo-600" />,
      title: "JSP → React Project Conversion",
      description:
        "Convert legacy JSP views into modern React components, routes, and assets.",
      iconBg: "bg-indigo-100",
    },

  ];

  const Card = ({ framework }: any) => {
    const isSelected = selectedFramework === framework.id;

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => {onSelectFramework(framework.id)
          sessionStorage.setItem("selectedTech", framework?.id);
        }}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") &&
          onSelectFramework(framework.id)
        }
        className={`${baseCard} ${isSelected ? selectedCard : ""}`}
        aria-pressed={isSelected}
      >
        <div className="flex justify-center mb-4">
          <div className={`${framework.iconBg} p-4 rounded-full`}>
            {framework.icon}
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          {framework.title}
        </h3>
        <p className="text-gray-600 text-center">{framework.description}</p>
      </div>
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {frameworks.map((framework) => (
        <Card key={framework.id} framework={framework} />
      ))}
    </div>
  );
};

export default FrameworkSelection;
