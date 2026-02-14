'use client';

import { useState } from 'react';
import { useLocaleStore } from '@/lib/store/useLocaleStore';
import { useToastStore } from '@/app/(dashboard)/store/useToastStore';
import { useExportTasks } from '@/services/tasks';
import { env } from 'next-runtime-env';
import { ExportFileService } from '@/lib/api/v2';
import api from '@/lib/api';

export default function ExportForm() {
  const locale = useLocaleStore((state) => state.locale);
  const { addToast } = useToastStore();
  const exportMutation = useExportTasks();
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!locale) return null;

  const handleExport = async () => {
    try {
      const response = await exportMutation.mutateAsync({
        start: startDate ? new Date(startDate) : undefined,
        end: endDate ? new Date(endDate) : undefined,
      });

      const dateRange = startDate && endDate ? `${startDate}-${endDate}` : startDate ? `from-${startDate}` : endDate ? `until-${endDate}` : 'all';
      const filename = `tasks-export-${dateRange}.${response.type.toLowerCase()}`;

      const mediaAccessType = env('NEXT_PUBLIC_MEDIA_ACCESS_TYPE');
      let downloadUrl: string;

      if (mediaAccessType === 'signed-url') {
        const signedUrlResponse = await ExportFileService.getSignedExportUrl(response.id);
        downloadUrl = signedUrlResponse.signedUrl;
      } else {
        downloadUrl = `${api.client.defaults.baseURL}/exports/files/${response.id}/stream`;
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowForm(false);
      setStartDate('');
      setEndDate('');
    } catch {
      addToast({ message: locale.tasks.teamTasks.toasts.exportFailed, type: 'error' });
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {locale.tasks.teamTasks.export.button}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col">
        <label className="text-xs text-slate-500 mb-1">{locale.tasks.teamTasks.export.startDate}</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-slate-500 mb-1">{locale.tasks.teamTasks.export.endDate}</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <button onClick={handleExport} disabled={exportMutation.isPending} className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {exportMutation.isPending ? locale.tasks.teamTasks.export.exporting : locale.tasks.teamTasks.export.export}
      </button>
      <button onClick={() => { setShowForm(false); setStartDate(''); setEndDate(''); }} className="px-3 py-1.5 text-slate-600 text-sm font-medium rounded-md hover:bg-slate-100 transition-colors">
        {locale.tasks.teamTasks.export.cancel}
      </button>
    </div>
  );
}
