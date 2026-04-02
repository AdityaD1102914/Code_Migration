import React from 'react'
import { BarChart3, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";


const AngularMigration = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link
            to="/angular-analysis"
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer transform transition hover:scale-105 hover:shadow-xl"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <BarChart3 className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              Analysis
            </h3>
            <p className="text-gray-600 text-center">
              Analyze your data with powerful tools and visualizations to gain
              meaningful insights.
            </p>
          </Link>

          <Link
            to="/angular-conversion"
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer transform transition hover:scale-105 hover:shadow-xl"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <RefreshCw className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              Conversion
            </h3>
            <p className="text-gray-600 text-center">
              Convert your files and data between different formats quickly and
              easily.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}


export default AngularMigration;
