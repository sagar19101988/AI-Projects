// src/components/kanban/KanbanBoard.tsx
import React, { useMemo, useState } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useJobs } from '../../context/JobContext';
import Column from './Column';
import JobCard from '../job/JobCard';
import type { Job } from '../../types/job';
import JobModal from '../job/JobModal';

const COLUMNS_DEF = [
  { id: 'Wishlist', title: 'Wishlist', color: 'border-t-gray-400' },
  { id: 'Applied', title: 'Applied', color: 'border-t-blue-500' },
  { id: 'Follow-up', title: 'Follow-up', color: 'border-t-yellow-500' },
  { id: 'Interview', title: 'Interview', color: 'border-t-purple-500' },
  { id: 'Offer', title: 'Offer', color: 'border-t-green-500' },
  { id: 'Rejected', title: 'Rejected', color: 'border-t-red-500' },
];

export default function KanbanBoard() {
  const { filteredJobs, updateJob } = useJobs();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [addToStatus, setAddToStatus] = useState<Job['status'] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columnsWithJobs = useMemo(() => {
    const cols: Record<string, Job[]> = {};
    COLUMNS_DEF.forEach(col => {
      cols[col.id] = filteredJobs
        .filter(j => j.status === col.id)
        .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
    });
    return cols;
  }, [filteredJobs]);

  const handleDragStart = (event: any) => {
    const { active } = event;
    const { id, data } = active;
    setActiveId(id);
    if (data.current?.type === 'Job') {
      setActiveJob(data.current.job);
    }
  };

  const handleDragEnd = async (event: any) => {
    setActiveId(null);
    setActiveJob(null);

    const { active, over } = event;
    if (!over) return;

    const activeJobElement = active.data.current?.job as Job;
    const isOverJob = over.data.current?.type === 'Job';
    const isOverColumn = over.data.current?.type === 'Column';

    let newStatus = activeJobElement.status;

    if (isOverJob) {
      newStatus = over.data.current.job.status;
    } else if (isOverColumn) {
      newStatus = over.data.current.column.id;
    }

    if (newStatus && newStatus !== activeJobElement.status) {
      const updatedJob = { ...activeJobElement, status: newStatus as Job['status'], updatedAt: new Date() };
      await updateJob(updatedJob);
    }
  };

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex w-full gap-3 md:gap-4 h-full overflow-x-auto pb-4 px-4 hover:overflow-x-auto">
          {COLUMNS_DEF.map(col => (
            <Column
              key={col.id}
              column={col}
              jobs={columnsWithJobs[col.id] || []}
              onEdit={setJobToEdit}
              onAddJob={() => setAddToStatus(col.id as Job['status'])}
            />
          ))}
        </div>
        <DragOverlay>
          {activeId && activeJob ? <JobCard job={activeJob} onEdit={() => {}} /> : null}
        </DragOverlay>
      </DndContext>
      {jobToEdit && <JobModal jobToEdit={jobToEdit} onClose={() => setJobToEdit(null)} />}
      {addToStatus && (
        <JobModal
          initialStatus={addToStatus}
          onClose={() => setAddToStatus(null)}
        />
      )}
    </>
  );
}
