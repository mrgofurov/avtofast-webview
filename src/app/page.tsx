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
import { PracticeScreen } from '@/components/screens/PracticeScreen';

export default function Page() {
  const { activeTab, practiceRequest } = useApp();

  return (
    <DeviceWrapper>
      <Toast />

      <Header />

      <main className="flex-1 w-full">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'topics' && <TopicsScreen />}
        {activeTab === 'ai' && <AIChatScreen />}
        {activeTab === 'exam' && <MockExamScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </main>

      {/* Practice runs full-screen over whichever tab started it, so closing
          it returns the learner exactly where they were. */}
      {practiceRequest && <PracticeScreen />}

      {!practiceRequest && <BottomNavigation />}
    </DeviceWrapper>
  );
}
