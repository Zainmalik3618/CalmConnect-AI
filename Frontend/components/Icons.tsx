import React from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  BarChart3,
  Bell,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Clock3,
  Eye,
  EyeOff,
  Flame,
  Lightbulb,
  LoaderCircle,
  LockOpen,
  LogOut,
  MessageCircle,
  Mic,
  Moon,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  Save,
  SendHorizontal,
  Settings,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Sparkles,
  Square,
  Star,
  Sun,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TriangleAlert,
  User,
  UserPlus,
  Users,
  X,
  XCircle,
  Zap,
  Smile,
  Award,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

type IconProps = LucideProps & {
  title?: string;
};

const baseStroke = 1.9;
const navClass = 'h-6 w-6 min-w-5 flex-shrink-0';

const withDefaults = (
  Icon: React.ComponentType<LucideProps>,
  defaultClassName: string,
  defaultProps: Partial<LucideProps> = {},
) => {
  const WrappedIcon = ({ className, title, ...props }: IconProps) => (
    <Icon
      aria-hidden={title ? undefined : true}
      focusable="false"
      strokeWidth={baseStroke}
      className={className || defaultClassName}
      {...defaultProps}
      {...props}
    >
      {title && <title>{title}</title>}
    </Icon>
  );

  return WrappedIcon;
};

export const ChatIcon = withDefaults(MessageCircle, navClass);
export const ChartBarIcon = withDefaults(BarChart3, navClass);
export const BookOpenIcon = withDefaults(BookOpen, navClass);
export const SendIcon = withDefaults(SendHorizontal, 'h-5 w-5');
export const UserIcon = withDefaults(User, 'h-5 w-5');
export const SparklesIcon = withDefaults(Sparkles, 'h-5 w-5');
export const PlusIcon = withDefaults(Plus, 'h-5 w-5');
export const SaveIcon = withDefaults(Save, 'h-5 w-5');
export const TrashIcon = withDefaults(Trash2, 'h-5 w-5');
export const AlertCircleIcon = withDefaults(AlertCircle, navClass);
export const ChecklistIcon = withDefaults(ClipboardCheck, navClass);
export const CognitiveDistortionsIcon = withDefaults(BrainCircuit, 'h-6 w-6');
export const LogoutIcon = withDefaults(LogOut, navClass);
export const SpinnerIcon = withDefaults(LoaderCircle, 'h-5 w-5 animate-spin');
export const EyeIcon = withDefaults(Eye, 'h-5 w-5');
export const EyeSlashIcon = withDefaults(EyeOff, 'h-5 w-5');
export const ShieldCheckIcon = withDefaults(ShieldCheck, 'h-6 w-6');
export const WarningIcon = withDefaults(TriangleAlert, 'h-6 w-6 text-red-600');
export const CogIcon = withDefaults(Settings, navClass);
export const SunIcon = withDefaults(Sun, navClass);
export const MoonIcon = withDefaults(Moon, navClass);
export const LightbulbIcon = withDefaults(Lightbulb, 'h-5 w-5');
export const FlameIcon = withDefaults(Flame, 'h-5 w-5');
export const ZapIcon = withDefaults(Zap, 'h-5 w-5');
export const SmileIcon = withDefaults(Smile, 'h-5 w-5');
export const AwardIcon = withDefaults(Award, 'h-5 w-5');
export const ArrowLeftIcon = withDefaults(ArrowLeft, 'h-6 w-6');
export const MindfulnessIcon = withDefaults(BrainCircuit, 'h-8 w-8');
export const CheckCircleIcon = withDefaults(CheckCircle2, 'h-5 w-5');
export const XCircleIcon = withDefaults(XCircle, 'h-5 w-5');
export const XIcon = withDefaults(X, 'h-5 w-5');
export const PlayIcon = withDefaults(PlayCircle, 'h-8 w-8');
export const PauseIcon = withDefaults(PauseCircle, 'h-8 w-8');
export const ForwardIcon = withDefaults(SkipForward, 'h-6 w-6');
export const BackwardIcon = withDefaults(SkipBack, 'h-6 w-6');
export const CheckIcon = withDefaults(Check, 'h-5 w-5');
export const DoubleCheckIcon = withDefaults(CheckCheck, 'h-5 w-5');
export const MicrophoneIcon = withDefaults(Mic, 'h-5 w-5');
export const StopIcon = withDefaults(Square, 'h-5 w-5');
export const UsersIcon = withDefaults(Users, navClass);
export const ChevronLeftIcon = withDefaults(ChevronLeft, 'h-5 w-5', { strokeWidth: 2.4 });
export const ThumbsUpIcon = withDefaults(ThumbsUp, 'h-4 w-4');
export const ThumbsDownIcon = withDefaults(ThumbsDown, 'h-4 w-4');
export const PencilIcon = withDefaults(Pencil, 'h-4 w-4');
export const BanIcon = withDefaults(Ban, 'h-5 w-5');
export const UnlockIcon = withDefaults(LockOpen, 'h-5 w-5');
export const UserPlusIcon = withDefaults(UserPlus, 'h-5 w-5');
export const CalendarIcon = withDefaults(CalendarDays, navClass);
export const StarIcon = withDefaults(Star, navClass);
export const BellIcon = withDefaults(Bell, navClass);
export const ClockIcon = withDefaults(Clock3, navClass);

const uniqueId = () => `grad_${Math.random().toString(36).substring(2, 9)}`;

export const LogoIcon = ({ className }: { className?: string }) => {
  const sageGradientId = uniqueId();
  const blueGradientId = uniqueId();

  return (
    <svg
      className={className || 'h-8 w-8'}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={sageGradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A3B18A" />
          <stop offset="100%" stopColor="#849868" />
        </linearGradient>
        <linearGradient id={blueGradientId} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#A8DADC" />
          <stop offset="100%" stopColor="#81C6C8" />
        </linearGradient>
      </defs>

      <path
        d="M50 95 C 10 70, 20 30, 50 5 C 80 30, 90 70, 50 95 Z"
        fill={`url(#${sageGradientId})`}
        transform="rotate(-15 50 50) translate(-10, 0)"
      />
      <path
        d="M50 95 C 10 70, 20 30, 50 5 C 80 30, 90 70, 50 95 Z"
        fill={`url(#${blueGradientId})`}
        transform="rotate(15 50 50) translate(10, -5)"
        opacity="0.85"
      />
    </svg>
  );
};
