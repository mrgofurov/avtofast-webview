'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Clock, ChevronRight, ShieldAlert, GitFork, TrafficCone, CircleParking, Gauge, Car } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TOPICS_DATA } from '@/data/mockData';
import { ProgressRing } from '@/components/ui/ProgressRing';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldAlert,
  GitFork,
  TrafficCone,
  CircleParking,
  Gauge,
  Car,
};

export function TopicsScreen() {
  const { startQuestionSession } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = TOPICS_DATA.filter((topic) =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 pb-28 md:pb-12 pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Mavzular
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            O'zbekiston YHQ rasmiy 6 ta asosiy yo'nalishi bo'yicha bosqichma-bosqich o'rganing
          </p>
        </div>

        {/* Search Input on Desktop/Mobile */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mavzuni qidirish..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Topics Responsive Grid: Desktop 3 cols, Tablet 2 cols, Mobile 1 col */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTopics.map((topic) => {
          const IconComponent = iconMap[topic.iconName] || ShieldAlert;
          const progress = Math.round((topic.completedQuestions / topic.totalQuestions) * 100);

          return (
            <div
              key={topic.id}
              onClick={() => startQuestionSession(undefined, topic.id)}
              className="bg-white dark:bg-slate-800/90 rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between gap-4 hover:border-blue-400 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer h-full group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: `${topic.color}15`, color: topic.color }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {topic.title}
                      </h3>
                      {topic.isAiRecommended && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[10px] font-extrabold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>AI Tavsiya</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mt-1">
                      {topic.description}
                    </p>
                  </div>
                </div>

                <ProgressRing progress={progress} size={48} strokeWidth={4.5} color={topic.color} />
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{topic.estimatedMinutes} daqiqa dars</span>
                </span>

                <div className="flex items-center gap-1 text-[#2563EB] dark:text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  <span>{topic.completedQuestions} / {topic.totalQuestions} savol</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
