import { useState, useEffect } from "react";

import { AnalysisData } from "@/LegacyLift/types/analysis";
import { ArrowRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "@/LegacyLift/contexts/useContext";
import AnalysisDetails from "@/LegacyLift/components/AnalysisDetails";
import { useApi } from "@/LegacyLift/services/useApi";
import { useToast } from "@/LegacyLift/hooks/use-toast";
import { useStep } from "../contexts/useStepContext";


const AnalysisReport = () => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [activeMetric, setActiveMetric] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const { apiCall, error } = useApi();
  const { toast } = useToast();

  // Step Context
  const { setStep } = useStep();

  const { setProjectJson, setMigrationReportJson } = useAppContext();

  const location = useLocation();
  const navigate = useNavigate();
  const { analysisReportJson } = useAppContext();
  const { analysisAPIData } = location.state || analysisReportJson || {};

  // API Integration For Migration Process
  const MigrationAPI = async () => {
    try {
      //Update step to 3
      navigate("/migration");
      // Call for Migration Report
      const migrationReport = await apiCall({
        method: "post",
        url: "/analyze-project",
        data: { generateMigrationReport: true },
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Call for Migration Project
      const response = await apiCall({
        method: "post",
        url: "/migration-project",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Handle server errors
      if (response?.status === 500 || response?.status === 502) {
        toast({
          variant: "destructive",
          title: "Migration Failed Please Try Again",
          description: "There was an error during the migration process. Please try again later.",
        });
        return navigate("/analysis");
      }

      setMigrationReportJson(migrationReport?.data?.report[0]);
      setProjectJson(response?.data);

    } catch (err) {
      toast({
        variant: "destructive",
        title: "Unexpected Error",
        description: "Something went wrong during migration.",
      });
    }
  };

  useEffect(() => {
    if (analysisAPIData) {
      try {
        if (typeof analysisAPIData === "string") {
          const parsed = JSON.parse(analysisAPIData);
          setData(parsed);
        } else {
          // If it's already an object, no need to parse
          setData(analysisAPIData[0]);
        }
      } catch (error) {
        console.error("Failed to parse analysis API data:", error);
      }
    }
  }, [analysisAPIData]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (analysisReportJson) {
      setData(analysisReportJson?.[0] || null)
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 overflow-x-hidden mx-auto px-4 sm:px-6 lg:px-8">
      {/* Floating Orbs Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none"></div>

      {/* Analysis Section Start */}
      <AnalysisDetails data={data} activeMetric={activeMetric} />

      {/* Migration Process */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 mb-16 rounded-3xl p-12 sm:p-16 text-center flex justify-between shadow-2xl">
        <div className="flex   items-center">
          <h2 className="text-4xl sm:text-4xl font-bold text-white ">
            START YOUR MIGRATION JOURNEY
          </h2>
        </div>
        <div>
          <button
            onClick={MigrationAPI}
            className="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-semibold text-lg flex items-center justify-center cursor-pointer space-x-2"
          >
            <span>Start Migration</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Analysis Section End */}

      {/* Custom Scrollbar */}
      <style>{`
        ::-webkit-scrollbar {
          width: 12px;
        }
        
        ::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, #e0f2fe, #ddd6fe);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #8b5cf6);
          border-radius: 6px;
          border: 2px solid #e0f2fe;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #7c3aed);
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: #06b6d4 #e0f2fe;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default AnalysisReport;
