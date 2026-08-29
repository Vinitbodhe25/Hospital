import React, { useState } from 'react';
import { Booking, Doctor, Department } from '../types';
import { CsvExportService } from '../services/csvExport';
import { Download, FileSpreadsheet, Check } from 'lucide-react';

interface CSVExportButtonProps {
  bookings: Booking[];
  doctors: Doctor[];
  departments: Department[];
  className?: string;
}

export const CSVExportButton: React.FC<CSVExportButtonProps> = ({
  bookings,
  doctors,
  departments,
  className = '',
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDept, setSelectedDept] = useState('ALL');

  const handleExport = () => {
    setIsExporting(true);
    try {
      CsvExportService.exportBookingsToCsv({
        bookings,
        doctors,
        departments,
        dateRangeLabel: "Today's OPD Session",
        departmentFilter: selectedDept,
      });
    } catch (e) {
      console.error('CSV export failed:', e);
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        id="btn-export-csv"
        onClick={handleExport}
        disabled={isExporting}
        className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider border border-slate-900 shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Generated CSV!</span>
          </>
        ) : (
          <>
            <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
            <span>Export OPD CSV</span>
          </>
        )}
      </button>
    </div>
  );
};
