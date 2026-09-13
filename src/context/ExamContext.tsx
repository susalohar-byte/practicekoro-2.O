import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Exam } from '@/types';

interface ExamContextType {
  exams: Exam[];
  selectedExam: Exam | null;
  setSelectedExam: (exam: Exam) => void;
  selectExamById: (examId: string) => void;
  loading: boolean;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExamState] = useState<Exam | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await api.getExams();
        setExams(data);

        // Load saved exam preference or default to WBP Constable
        const savedExamId = localStorage.getItem('practicekoro_selected_exam');
        const found = data.find((e) => e.id === savedExamId) || data[0] || null;
        setSelectedExamState(found);
      } catch (err) {
        console.error('Error fetching exams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const setSelectedExam = (exam: Exam) => {
    setSelectedExamState(exam);
    localStorage.setItem('practicekoro_selected_exam', exam.id);
  };

  const selectExamById = (examId: string) => {
    const found = exams.find((e) => e.id === examId);
    if (found) {
      setSelectedExam(found);
    }
  };

  return (
    <ExamContext.Provider
      value={{
        exams,
        selectedExam,
        setSelectedExam,
        selectExamById,
        loading,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
