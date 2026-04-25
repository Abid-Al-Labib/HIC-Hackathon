import React, { useState } from 'react';
import { UserRole } from '../types';
import PatientPortal from '../components/portals/PatientPortal';
import CaregiverPortal from '../components/portals/CaregiverPortal';
import DoctorPortal from '../components/portals/DoctorPortal';
import FacilityPortal from '../components/portals/FacilityPortal';
import { cn } from '../lib/utils';

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.PATIENT]: 'Patient',
  [UserRole.PRIMARY_CAREGIVER]: 'Caregiver',
  [UserRole.FAMILY_CONTRIBUTOR]: 'Family',
  [UserRole.DOCTOR]: 'Doctor',
  [UserRole.FACILITY_STAFF]: 'Facility',
};

export default function MemoryBridgePage() {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.PRIMARY_CAREGIVER);

  const renderPortal = () => {
    switch (currentRole) {
      case UserRole.PATIENT:
        return <PatientPortal />;
      case UserRole.PRIMARY_CAREGIVER:
      case UserRole.FAMILY_CONTRIBUTOR:
        return <CaregiverPortal role={currentRole} />;
      case UserRole.DOCTOR:
        return <DoctorPortal />;
      case UserRole.FACILITY_STAFF:
        return <FacilityPortal />;
      default:
        return <CaregiverPortal role={UserRole.PRIMARY_CAREGIVER} />;
    }
  };

  return (
    <div className="min-h-screen bg-posthog-parchment dark:bg-[#111827] text-posthog-deep-ink dark:text-slate-100 font-sans">
      {/* Demo role switcher — floating bottom-left */}
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 p-2 bg-posthog-sage dark:bg-slate-900 rounded-full shadow-lg border border-posthog-border dark:border-slate-700">
        <span className="text-[10px] font-bold uppercase tracking-wider text-posthog-ink/60 dark:text-slate-500 px-3 border-r border-posthog-border/50 dark:border-slate-800 whitespace-nowrap">
          Switch View
        </span>
        {(Object.values(UserRole) as UserRole[]).map((role) => (
          <button
            key={role}
            onClick={() => setCurrentRole(role)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
              currentRole === role
                ? "bg-posthog-cta text-white shadow-sm"
                : "text-posthog-ink/80 dark:text-slate-300 hover:bg-posthog-light-sage dark:bg-slate-800"
            )}
          >
            {ROLE_LABELS[role]}
          </button>
        ))}
      </div>

      <main className="w-full">
        {renderPortal()}
      </main>
    </div>
  );
}
