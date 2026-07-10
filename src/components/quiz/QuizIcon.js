import { Sparkles, Moon, Brain, Apple, Leaf, LayoutDashboard, Calendar } from 'lucide-react';

export default function QuizIcon({ name, className = "w-5 h-5", size }) {
  const props = { className, size };
  switch (name) {
    // Category / Emoji / Slug mapping
    case '✨':
    case 'general-wellness':
    case 'Wellness':
      return <Sparkles {...props} />;
    case '🌙':
    case 'sleep-quality':
    case 'Sleep':
      return <Moon {...props} />;
    case '🧠':
    case 'stress-burnout':
    case 'Mental Health':
    case 'Stress Check':
      return <Brain {...props} />;
    case '🥗':
    case 'nutrition-gut':
    case 'Nutrition':
    case 'Nutrition IQ':
      return <Apple {...props} />;
    case '🌿':
    case 'dosha-body-type':
    case 'Ayurveda':
    case 'Dosha Discovery':
      return <Leaf {...props} />;
    case '📊':
    case 'dashboard':
    case 'My Dashboard':
      return <LayoutDashboard {...props} />;
    case '🌅':
    case 'Daily Quiz':
      return <Calendar {...props} />;
    default:
      return <Sparkles {...props} />;
  }
}
