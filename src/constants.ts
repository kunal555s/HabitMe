import { 
  Zap, 
  Brain, 
  Moon, 
  Coffee, 
  Target, 
  Shield, 
  Users, 
  Database, 
  Lock, 
  BookOpen, 
  Trophy, 
  Lightbulb,
  Heart,
  Briefcase,
  Smile,
  GraduationCap,
  DollarSign,
  Sun,
  Flame,
  Star,
  Award,
  CheckCircle2,
  Clock,
  MessageSquare,
  PenTool,
  Layout,
  BarChart3,
  Settings,
  User,
  Compass,
  Activity,
  Medal,
  Gem
} from 'lucide-react';

export const HABIT_CATEGORIES = [
  { id: 'health', name: 'Health', icon: Heart, color: '#E8654A' },
  { id: 'mind', name: 'Mind', icon: Brain, color: '#4CAF7D' },
  { id: 'work', name: 'Work', icon: Briefcase, color: '#FFD43B' },
  { id: 'social', name: 'Social', icon: Users, color: '#4DABF7' },
  { id: 'learning', name: 'Learning', icon: GraduationCap, color: '#BE4BDB' },
  { id: 'finance', name: 'Finance', icon: DollarSign, color: '#94D82D' },
  { id: 'custom', name: 'Custom', icon: Layout, color: '#8B6F5E' },
];

export const LEVELS = [
  { id: 'seedling', name: 'Seedling', minXp: 0, icon: '🌱', description: 'Just starting your journey. Every small step counts!' },
  { id: 'sprout', name: 'Sprout', minXp: 100, icon: '🌿', description: 'You are beginning to grow. Consistency is key now.' },
  { id: 'sapling', name: 'Sapling', minXp: 500, icon: '🌳', description: 'Your roots are deep. You are becoming a habit master.' },
  { id: 'grower', name: 'Grower', minXp: 1500, icon: '🌲', description: 'A strong presence. Your habits define your character.' },
  { id: 'achiever', name: 'Achiever', minXp: 3000, icon: '🏆', description: 'High performance is your second nature.' },
  { id: 'master', name: 'Master', minXp: 6000, icon: '👑', description: 'You have mastered the art of the daily loop.' },
  { id: 'legend', name: 'Legend', minXp: 10000, icon: '⚡', description: 'A true inspiration to the entire community.' },
];

export const BADGES = [
  { id: 'early_bird', name: 'Early Bird', description: 'Complete a habit before 8 AM.', icon: '🌅', requirement: 'Log any habit before 08:00 AM' },
  { id: 'hydration_hero', name: 'Hydration Hero', description: 'Consistent water intake.', icon: '💧', requirement: 'Complete "Drink Water" 7 days in a row' },
  { id: 'knowledge_seeker', name: 'Knowledge Seeker', description: 'Used AI tools 10 times.', icon: '📚', requirement: '10 AI Tool interactions' },
  { id: 'on_fire', name: 'On Fire', description: 'Maintain a 7-day streak.', icon: '🔥', requirement: '7-day overall streak' },
  { id: 'unstoppable', name: 'Unstoppable', description: 'Maintain a 30-day streak.', icon: '⚡', requirement: '30-day overall streak' },
  { id: 'century', name: 'Century', description: '100 total completions.', icon: '💯', requirement: '100 total habit completions' },
  { id: 'night_owl', name: 'Night Owl', description: 'Complete a habit after 10 PM.', icon: '🌙', requirement: 'Log any habit after 10:00 PM' },
  { id: 'storyteller', name: 'Storyteller', description: '10 journal entries.', icon: '✍️', requirement: '10 Journal entries' },
  { id: 'zen_master', name: 'Zen Master', description: '10 meditation sessions.', icon: '🧘', requirement: '10 Mind category completions' },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Connect with community.', icon: '🤝', requirement: 'Join 3 community challenges' },
  { id: 'wealth_builder', name: 'Wealth Builder', description: 'Focus on finances.', icon: '💰', requirement: '10 Finance category completions' },
  { id: 'deep_work', name: 'Deep Work', description: 'Master your focus.', icon: '💻', requirement: '10 Work category completions' },
];

export const AI_TOOLS = [
  { 
    id: 'coach', 
    title: 'AI Habit Coach', 
    description: 'Personalized motivation and science-backed advice.', 
    icon: '💬', 
    prompt: 'You are HabitXpress AI Coach. Be warm, motivating, science-backed. Give practical advice in 2-3 short paragraphs with 1 action step for today.'
  },
  { 
    id: 'challenge', 
    title: '30-Day Challenge', 
    description: 'Generate a progressive 30-day plan for any goal.', 
    icon: '🏆', 
    prompt: 'Create a detailed 30-day habit challenge for a specific goal. Format as 4 weeks with daily tasks. Make it progressive and achievable.'
  },
  { 
    id: 'builder', 
    title: 'Habit Builder', 
    description: 'Step-by-step implementation plan for new habits.', 
    icon: '🏗️', 
    prompt: 'Build a complete habit implementation plan. Include: 2-minute rule start, habit stacking ideas, environment design tips, and a first 7 days schedule.'
  },
  { 
    id: 'reflection', 
    title: 'AI Reflection', 
    description: 'Get deep insights from your daily journal entries.', 
    icon: '🧠', 
    prompt: 'Write a warm, insightful reflection on a journal entry. Identify patterns, give encouragement, and suggest one thing to focus on tomorrow.'
  },
  { 
    id: 'breaker', 
    title: 'Habit Breaker', 
    description: 'Science-based strategies to quit bad habits.', 
    icon: '🚫', 
    prompt: 'Help break a bad habit. Provide: trigger identification questions, 3 replacement habits, a coping strategy, and a compassionate 7-day breaking plan.'
  },
  { 
    id: 'science', 
    title: 'Habit Science Q&A', 
    description: 'Ask anything about the psychology of habits.', 
    icon: '💡', 
    prompt: 'You are a habit psychology expert. Answer questions with science-backed information, real research references, and practical takeaways.'
  },
  { 
    id: 'future', 
    title: 'Future Self Letter', 
    description: 'A letter from your future self who built these habits.', 
    icon: '✉️', 
    prompt: "Write an emotional, deeply personal letter from a user's future self, 1 year from now. They successfully built their habits. Make it vivid and inspiring."
  },
  { 
    id: 'report', 
    title: 'Weekly AI Report', 
    description: 'Narrative summary of your progress this week.', 
    icon: '📊', 
    prompt: "Generate a warm weekly habit report based on progress data. Write 3 paragraphs: wins, challenges, and next week focus."
  },
];
