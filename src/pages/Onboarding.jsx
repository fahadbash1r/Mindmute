import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const questions = [
  {
    id: 'mood',
    question: 'How do you feel most days?',
    options: ['Overthinker', 'Overwhelmed', "Can't decide", 'Stressed', 'Stuck']
  },
  {
    id: 'challenge',
    question: "What's your biggest challenge?",
    options: ['Too much', 'Anxiety', 'No focus', 'Prioritizing', 'Losing goals']
  },
  {
    id: 'clarity_area',
    question: 'Where do you want clarity?',
    options: ['Planning', 'Emotions', 'Work', 'Habits', 'Relationships']
  },
  {
    id: 'spin_frequency',
    question: 'How often do your thoughts spin out?',
    options: ['Almost always', 'Every day', 'Few times/week', 'Rarely']
  },
  {
    id: 'desired_outcome',
    question: 'Which outcome matters most?',
    options: ['Calm/clear', 'More done', 'Better decisions', 'Healthy habits', 'Understand emotions']
  },
  {
    id: 'daily_time',
    question: 'Daily time you can spend?',
    options: ['Under 5 min', '5–10 min', '10–20 min', 'Over 20 min']
  },
  {
    id: 'tone_preference',
    question: 'What tone helps you?',
    options: ['Straightforward', 'Gentle', 'Big-picture', 'Supportive']
  },
  {
    id: 'reminder_pref',
    question: 'When to remind you?',
    options: ['Morning', 'Midday', 'Evening', 'Never']
  }
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const currentQuestion = questions[step - 1];
  const isLastStep = step === questions.length;

  const handleAnswer = (answer) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setStep(prev => Math.min(questions.length, prev + 1));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const user = supabase.auth.user();
      if (!user) throw new Error('No user found');

      await supabase
        .from('profiles')
        .update({
          mood: answers.mood,
          challenge: answers.challenge,
          clarity_area: answers.clarity_area,
          spin_frequency: answers.spin_frequency,
          desired_outcome: answers.desired_outcome,
          daily_time: answers.daily_time,
          tone_preference: answers.tone_preference,
          reminder_pref: answers.reminder_pref,
          onboarded: true
        })
        .eq('id', user.id);

      navigate('/tasks', { replace: true });
    } catch (error) {
      console.error('Error saving onboarding answers:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-lg p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={() => handleAnswer(option)}
                  className="radio-input"
                />
                <span className="text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="btn btn-primary ml-auto"
            disabled={!answers[currentQuestion.id] || isLoading}
          >
            {isLastStep ? (isLoading ? 'Saving...' : 'Get Started') : 'Next'}
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`h-1 w-4 rounded ${
                  index + 1 === step ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 