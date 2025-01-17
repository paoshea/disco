import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SafetyReport, Evidence } from '@/types/safety';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Select } from '@/components/ui/Select';
import { FileUpload } from '@/components/ui/FileUpload';

interface SafetyReportFormProps {
  onSubmit: (data: Partial<SafetyReport>) => Promise<void>;
  onCancel: () => void;
  initialData?: SafetyReport;
}

const reportTypes = [
  { value: 'harassment', label: 'Harassment' },
  { value: 'suspicious_activity', label: 'Suspicious Activity' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'other', label: 'Other' },
];

export const SafetyReportForm: React.FC<SafetyReportFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SafetyReport>({
    defaultValues: initialData,
  });

  const [files, setFiles] = useState<Evidence[]>(initialData?.evidence || []);

  const handleFileUpload = async (uploadedFiles: File[]) => {
    // TODO: Implement file upload to storage service
    const newEvidence: Evidence[] = uploadedFiles.map((file, index) => ({
      id: `temp-${index}`,
      reportId: initialData?.id || '',
      type: file.type,
      url: URL.createObjectURL(file),
      createdAt: new Date().toISOString(),
    }));
    setFiles(prev => [...prev, ...newEvidence]);
  };

  const handleFormSubmit = async (data: SafetyReport) => {
    await onSubmit({
      ...data,
      evidence: files,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Select
        label="Report Type"
        options={reportTypes}
        error={errors.type?.message}
        {...register('type', { required: 'Report type is required' })}
      />

      <Input
        label="Location"
        error={errors.location?.message}
        {...register('location', { required: 'Location is required' })}
      />

      <TextArea
        label="Description"
        error={errors.description?.message}
        {...register('description', { required: 'Description is required' })}
      />

      <FileUpload
        label="Evidence (Optional)"
        accept={{
          'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
          'video/*': ['.mp4', '.mov', '.avi'],
          'audio/*': ['.mp3', '.wav'],
        }}
        multiple
        onFilesSelected={handleFileUpload}
      />

      {files.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Uploaded Files</label>
          <ul className="space-y-1">
            {files.map(file => (
              <li key={file.id} className="text-sm text-gray-600">
                {file.type} - {file.url}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? 'Update' : 'Submit'} Report</Button>
      </div>
    </form>
  );
};
