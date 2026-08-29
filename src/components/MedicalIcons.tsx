import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export const HospitalCrossIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <path d="M12 2v20M2 12h20" strokeWidth="2.5" />
    <rect x="3" y="3" width="18" height="18" rx="4" strokeWidth="1.5" />
  </svg>
);

export const HeartCardiologyIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h4.78" strokeWidth="1.75" />
  </svg>
);

export const BoneOrthopedicsIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <path d="M17 10c.7-.7 1.6-1 2.5-1a3.5 3.5 0 1 0-3.5 3.5c0 .9-.3 1.8-1 2.5l-6 6c-.7.7-1.6 1-2.5 1a3.5 3.5 0 1 1 3.5-3.5c0-.9.3-1.8 1-2.5Z" />
    <path d="m14 10-4 4" strokeWidth="1.5" />
  </svg>
);

export const BrainNeurologyIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04Z" />
    <path d="M12 7h.01M12 12h.01M12 17h.01" />
  </svg>
);

export const LungsPulmonologyIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <path d="M12 4v7M12 7c-2 0-4 1.5-4 4v5c0 2.5 2 4 4 4" />
    <path d="M12 7c2 0 4 1.5 4 4v5c0 2.5-2 4-4 4" />
    <path d="M8 11c-2.5 0-5 2-5 5.5S5.5 22 8 22c1.5 0 2.5-.5 3-1.5" />
    <path d="M16 11c2.5 0 5 2 5 5.5S18.5 22 16 22c-1.5 0-2.5-.5-3-1.5" />
  </svg>
);

export const PediatricsChildIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 0 0-16 0" />
    <path d="M9 8h.01M15 8h.01" strokeWidth="2.5" />
    <path d="M10 11c.8.6 2.2.6 3 0" />
  </svg>
);

export const GynecologyIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <circle cx="12" cy="9" r="6" />
    <path d="M12 15v7M9 19h6" />
    <path d="M12 6.5a2.5 2.5 0 0 1 2.5 2.5" strokeWidth="1.5" />
  </svg>
);

export const ToothDentistryIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <path d="M7 4c-2.5 0-4 2-4 4.5 0 4.5 2 9 3.5 12.5.5 1 2 .5 2-1l.5-6h6l.5 6c0 1.5 1.5 2 2 1 1.5-3.5 3.5-8 3.5-12.5C21 6 19.5 4 17 4c-2 0-3.5 1-5 1-1.5 0-3-1-5-1Z" />
    <path d="M10 7c.5 1 2.5 1 3 0" strokeWidth="1.5" />
  </svg>
);

export const EyeOphthalmologyIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const StethoscopeIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
    <circle cx="20" cy="10" r="2" />
  </svg>
);

export function getDepartmentSvgIcon(id: string, className = 'w-6 h-6') {
  switch (id) {
    case 'cardiology':
      return <HeartCardiologyIcon className={className} />;
    case 'orthopedics':
      return <BoneOrthopedicsIcon className={className} />;
    case 'neurology':
      return <BrainNeurologyIcon className={className} />;
    case 'pulmonology':
      return <LungsPulmonologyIcon className={className} />;
    case 'general_medicine':
      return <HospitalCrossIcon className={className} />;
    case 'pediatrics':
      return <PediatricsChildIcon className={className} />;
    case 'gynecology':
      return <GynecologyIcon className={className} />;
    case 'dentistry':
      return <ToothDentistryIcon className={className} />;
    case 'ophthalmology':
      return <EyeOphthalmologyIcon className={className} />;
    default:
      return <StethoscopeIcon className={className} />;
  }
}
