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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Demo role switcher — floating bottom-left */}
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 p-2 bg-white rounded-full shadow-lg border border-neutral-200">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 border-r border-neutral-100 whitespace-nowrap">
          Switch View
        </span>
        {(Object.values(UserRole) as UserRole[]).map((role) => (
          <button
            key={role}
            onClick={() => setCurrentRole(role)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
              currentRole === role
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-neutral-600 hover:bg-neutral-100"
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
