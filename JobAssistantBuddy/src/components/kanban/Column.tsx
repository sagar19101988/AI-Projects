// src/components/kanban/Column.tsx

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Job } from '../../types/job';
import JobCard from '../job/JobCard';
import { Plus } from 'lucide-react';

export default function Column({ column, jobs, onEdit, onAddJob }: {
  column: { id: string, title: string, color: string };
  jobs: Job[];
  onEdit: (job: Job) => void;
  onAddJob: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'Column', column }
  });

  return (
    <div className="flex flex-col shrink-0 w-[240px] xl:w-[260px] max-h-full h-full pb-4">
      <div className={`flex items-center justify-between px-3 py-3 mb-3 rounded-xl border-t-4 ${column.color} bg-white dark:bg-gray-800 shadow-sm z-10 sticky top-0`}>
        <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700 dark:text-gray-200">{column.title}</h3>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 shadow-inner">
            {jobs.length}
          </span>
        </div>
      </div>
      
      <div 
        ref={setNodeRef} 
        className={`flex-1 p-2.5 rounded-xl border-2 transition-colors overflow-y-auto ${
          isOver ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-600 border-dashed' : 'bg-transparent border-transparent'
        }`}
      >
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              onEdit={onEdit} 
            />
          ))}
        </SortableContext>
        
        <button
          onClick={onAddJob}
          className="w-full flex items-center justify-center gap-2 py-3 mt-1 mb-2 rounded-xl text-sm font-semibold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all group"
        >
          <Plus size={16} className="group-hover:scale-110 transition-transform" />
          Add
        </button>
        
        {jobs.length === 0 && (
          <div className="flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700/50 rounded-lg p-8 text-center opacity-60 bg-gray-50 dark:bg-gray-800/40">
            Drop jobs here
          </div>
        )}
      </div>
    </div>
  );
}
