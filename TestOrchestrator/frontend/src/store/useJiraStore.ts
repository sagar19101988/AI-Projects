import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JiraStory, TestPlan } from '../types';
import axios from 'axios';

interface JiraState {
  projectKey: string;
  setProjectKey: (key: string) => void;
  
  stories: JiraStory[];
  isLoading: boolean;
  error: string | null;
  fetchStories: () => Promise<void>;
  
  selectedStories: string[]; // JiraStory keys
  toggleStorySelection: (key: string) => void;
  selectAllStories: () => void;
  deselectAllStories: () => void;

  // Test Plan
  currentTestPlan: TestPlan | null;
  isGeneratingPlan: boolean;
  generateTestPlan: () => Promise<void>;
}

const API_BASE = '/api';

export const useJiraStore = create<JiraState>()(
  persist(
    (set, get) => ({
      projectKey: '',
      setProjectKey: (key) => set({ projectKey: key }),
      
      stories: [],
      isLoading: false,
      error: null,
      
      fetchStories: async () => {
        const { projectKey } = get();
        if (!projectKey) return set({ error: 'Project Key is required' });
        
        set({ isLoading: true, error: null });
        try {
          const res = await axios.get(`${API_BASE}/jira/stories`, {
            params: { projectKey }
          });
          set({ stories: res.data.stories, isLoading: false });
        } catch (err: any) {
          set({ 
            error: err.response?.data?.error || err.message || 'Failed to fetch stories',
            isLoading: false 
          });
        }
      },

      selectedStories: [],
      toggleStorySelection: (key) => set((state) => ({
        selectedStories: state.selectedStories.includes(key)
          ? state.selectedStories.filter(k => k !== key)
          : [...state.selectedStories, key]
      })),
      selectAllStories: () => set((state) => ({ selectedStories: state.stories.map(s => s.key) })),
      deselectAllStories: () => set({ selectedStories: [] }),

      currentTestPlan: null,
      isGeneratingPlan: false,
      generateTestPlan: async () => {
        const { selectedStories, stories } = get();
        if (selectedStories.length === 0) return set({ error: 'No stories selected' });

        const storiesToSend = stories.filter(s => selectedStories.includes(s.key));
        set({ isGeneratingPlan: true, error: null });
        try {
          const res = await axios.post(`${API_BASE}/ai/generate-plan`, { stories: storiesToSend });
          set({ currentTestPlan: res.data.plan, isGeneratingPlan: false });
        } catch (err: any) {
          set({ 
            error: err.response?.data?.error || err.message || 'Failed to generate plan',
            isGeneratingPlan: false 
          });
        }
      }
    }),
    {
      name: 'test-orchestrator-jira-storage',
      partialize: (state) => ({ projectKey: state.projectKey, currentTestPlan: state.currentTestPlan })
    }
  )
);
