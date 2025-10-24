import { useState } from 'react';
import { useHabitStore } from '../store/habitStore';
import { api, ApiError } from '../services/api';
import toast from 'react-hot-toast';

const questions = [
  {
    question: "How are you feeling today?",
    positive: ["Great!", "Happy", "Energized"],
    negative: ["Tired", "Sad", "Stressed"],
    id: 'mood'
  },
  {
    question: "Did you eat healthy today?",
    positive: ["Yes, nutritious meals", "Balanced diet", "Fresh food"],
    negative: ["Junk food", "Skipped meals", "Not really"],
    id: 'food'
  },
  {
    question: "Are you well hydrated?",
    positive: ["Drank plenty of water", "Yes", "Staying hydrated"],
    negative: ["Not enough", "Forgot to drink", "No"],
    id: 'hydration'
  },
  {
    question: "How did you sleep last night?",
    positive: ["Slept well", "Great rest", "Full 8 hours"],
    negative: ["Poor sleep", "Insomnia", "Not enough"],
    id: 'sleep'
  },
];

interface HabitModalProps {
  currentTree: any;
  onUpdate: () => void;
}

export default function HabitModal({ currentTree, onUpdate }: HabitModalProps) {
  const { answerQuestion, setShowModal } = useHabitStore();
  const [currentQ] = useState(questions[Math.floor(Math.random() * questions.length)]);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);

  const handleAnswer = async (isPositive: boolean) => {
    if (!currentTree) return;

    try {
      answerQuestion(isPositive);

      // Play sound effect
      if (isPositive) {
        (window as any).playPositiveSFX?.();
      } else {
        (window as any).playNegativeSFX?.();
      }

      const response = await api.submitHabitAnswer(currentTree.id, currentQ.id, isPositive);
      
      onUpdate();
      
      if (response.remainingQuestions > 0) {
        toast.success(
          isPositive 
            ? `🌱 Your plant grows! ${response.remainingQuestions} questions left today` 
            : `🍂 Your plant weakens. ${response.remainingQuestions} questions left today`, 
          { duration: 2500 }
        );
      } else {
        toast.success('✅ Daily questions complete! See you tomorrow 🌙', {
          duration: 3000
        });
      }

      setShowModal(false);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.code === 'DAILY_LIMIT_REACHED') {
          toast.error('You\'ve completed today\'s questions! Come back tomorrow 🌙', {
            duration: 3000
          });
        } else if (error.code === 'QUESTION_ALREADY_ANSWERED') {
          toast.error('You already answered this question today!', {
            duration: 2000
          });
        } else {
          toast.error(error.message || 'Failed to save habit');
        }
      } else {
        toast.error('Failed to save habit');
      }
      setShowModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowModal(false)}
      />

      <div className="relative bg-gradient-to-br from-emerald-900/90 to-green-950/90 backdrop-blur-md rounded-2xl w-full max-w-md max-h-[90vh] shadow-2xl border border-emerald-500/30 animate-slide-up flex flex-col">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 z-10 text-white/60 hover:text-white text-2xl leading-none"
        >
          ×
        </button>

        <div className="flex-shrink-0 p-8 pb-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center shadow-lg shadow-yellow-500/50 animate-pulse">
              <span className="text-3xl">✨</span>
            </div>
          </div>

          <h2 className="text-2xl font-serif text-white text-center mb-4">
            {currentQ.question}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
          <div className="space-y-3">
            <p className="text-emerald-300 text-sm font-sans">Positive choices:</p>
            {currentQ.positive.map((answer, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(true)}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-sans transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-green-500/50"
              >
                {answer}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-red-300 text-sm font-sans">Struggling with:</p>
            {currentQ.negative.map((answer, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(false)}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-600/60 to-orange-600/60 hover:from-red-500/70 hover:to-orange-500/70 text-white rounded-xl font-sans transition-all duration-200 hover:scale-105"
              >
                {answer}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
