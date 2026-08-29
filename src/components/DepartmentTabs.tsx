import React, { useRef } from 'react';
import { Department, DepartmentId } from '../types';
import {
  Heart,
  Bone,
  Brain,
  Wind,
  PlusCircle,
  Baby,
  Smile,
  Eye,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Stethoscope
} from 'lucide-react';

interface DepartmentTabsProps {
  departments: Department[];
  selectedDepartmentId: DepartmentId;
  onSelectDepartment: (deptId: DepartmentId) => void;
  waitingCounts?: Record<DepartmentId, number>;
  onViewAll?: () => void;
}

interface DeptStyleConfig {
  icon: React.ComponentType<{ className?: string }>;
  bgLight: string;
  textColor: string;
  iconColor: string;
  borderColor: string;
}

const DEPARTMENT_THEMES: Record<string, DeptStyleConfig> = {
  cardiology: {
    icon: Heart,
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-700',
    iconColor: 'text-rose-500',
    borderColor: 'border-rose-200',
  },
  orthopedics: {
    icon: Bone,
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-500',
    borderColor: 'border-blue-200',
  },
  neurology: {
    icon: Brain,
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-700',
    iconColor: 'text-purple-500',
    borderColor: 'border-purple-200',
  },
  pulmonology: {
    icon: Wind,
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-700',
    iconColor: 'text-teal-500',
    borderColor: 'border-teal-200',
  },
  general_medicine: {
    icon: PlusCircle,
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    iconColor: 'text-emerald-500',
    borderColor: 'border-emerald-200',
  },
  pediatrics: {
    icon: Baby,
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-700',
    iconColor: 'text-amber-500',
    borderColor: 'border-amber-200',
  },
  gynecology: {
    icon: Heart,
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-700',
    iconColor: 'text-pink-500',
    borderColor: 'border-pink-200',
  },
  ophthalmology: {
    icon: Eye,
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-700',
    iconColor: 'text-sky-500',
    borderColor: 'border-sky-200',
  },
  dentistry: {
    icon: Smile,
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    iconColor: 'text-cyan-500',
    borderColor: 'border-cyan-200',
  },
};

export const DepartmentTabs: React.FC<DepartmentTabsProps> = ({
  departments,
  selectedDepartmentId,
  onSelectDepartment,
  waitingCounts = {} as Record<DepartmentId, number>,
  onViewAll,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header Section with Stethoscope icon and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Stethoscope className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">OPD Departments</h2>
            <p className="text-xs text-slate-500">
              Choose a department to view specialists and book consultation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All Departments</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Carousel Navigation Arrows */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-xs transition-colors"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-xs transition-colors"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel of Round-Icon Department Cards */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3.5 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x scroll-smooth"
      >
        {departments.map((dept) => {
          const isSelected = dept.id === selectedDepartmentId;
          const theme = DEPARTMENT_THEMES[dept.id] || {
            icon: Sparkles,
            bgLight: 'bg-teal-50',
            textColor: 'text-teal-700',
            iconColor: 'text-teal-500',
            borderColor: 'border-teal-200',
          };
          const Icon = theme.icon;

          return (
            <button
              key={dept.id}
              id={`dept-tab-${dept.id}`}
              onClick={() => onSelectDepartment(dept.id)}
              className={`group flex-shrink-0 snap-start flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-200 w-[125px] sm:w-[135px] cursor-pointer relative ${
                isSelected
                  ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 shadow-md transform -translate-y-0.5'
                  : 'bg-white border-slate-200/90 hover:border-teal-300 hover:shadow-md shadow-xs'
              }`}
            >
              {/* Circular Icon Badge */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 transition-transform duration-200 group-hover:scale-110 ${theme.bgLight} ${theme.borderColor} border`}
              >
                <Icon className={`w-6 h-6 ${theme.iconColor}`} />
              </div>

              {/* Department Name */}
              <span
                className={`text-xs font-bold leading-snug line-clamp-1 ${
                  isSelected ? 'text-teal-900' : 'text-slate-800 group-hover:text-teal-900'
                }`}
              >
                {dept.name.split('&')[0].trim()}
              </span>

              {/* Subtitle / Floor */}
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                {dept.floor.split('—')[0].trim() || 'OPD'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
