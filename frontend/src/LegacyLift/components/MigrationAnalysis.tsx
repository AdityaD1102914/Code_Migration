import {Wrench, Zap } from 'lucide-react';
import React from 'react'
import { ProjectFile } from '@/LegacyLift/types/fileExplorerType';
import { modernCapabilities } from '@/LegacyLift/constants/mockdata';



const MigrationAnalysis: React.FC<{ ProjectJson: { files: ProjectFile[] } | ProjectFile[] | null }> = () => {

  return (
    <>
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Wrench className="w-4 h-4" />
          Technical Migration Case Study
        </div>
        <h1 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">
          Legacy JSP to Modern React
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          A comprehensive guide mapping legacy JavaServer Pages features to
          their modern React equivalents
        </p>
      </header>

      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-7 h-7 text-blue-600" />
          <h2 className="text-3xl font-bold text-slate-900">
            Modern React Capabilities
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modernCapabilities?.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-blue-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {capability.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {capability.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  )
}

export default MigrationAnalysis