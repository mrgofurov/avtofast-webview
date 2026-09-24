'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { DeviceWrapper } from '@/components/common/DeviceWrapper';
import { Header } from '@/components/common/Header';
import { BottomNavigation } from '@/components/common/BottomNavigation';
import { Toast } from '@/components/common/Toast';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { TopicsScreen } from '@/components/screens/TopicsScreen';
import { AIChatScreen } from '@/components/screens/AIChatScreen';
import { MockExamScreen } from '@/components/screens/MockExamScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { QuestionScreen } from '@/components/screens/QuestionScreen';
import { AIAnalysisModal } from '@/components/screens/AIAnalysisModal';

export default function Page() {
  const { activeTab, isQuestionScreenOpen, isAnalyzing } = useApp();

  return (
    <DeviceWrapper>
      <Toast />

      {/* Persistent Header for relevant screens */}
      {activeTab !== 'exam' && activeTab !== 'ai' && (
        <Header showGreeting={activeTab === 'home'} />
      )}

      {/* Screen Views */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'topics' && <TopicsScreen />}
        {activeTab === 'ai' && <AIChatScreen />}
        {activeTab === 'exam' && <MockExamScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </main>

      {/* Active Interactive Question Modal */}
      {isQuestionScreenOpen && <QuestionScreen />}

      {/* Signature AI Analysis Modal */}
      {isAnalyzing && <AIAnalysisModal />}

      {/* Fixed Bottom Navigation (Max 5 Tabs) */}
      {!isQuestionScreenOpen && activeTab !== 'exam' && <BottomNavigation />}
    </DeviceWrapper>
  );
}
