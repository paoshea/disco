import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { SafetyReportFormProps } from '@/types/safety';
import { safetyService } from '@/services/api/safety.service';
import { TextField } from '@/components/forms/TextField';
import { TextArea } from '@/components/forms/TextArea';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const reportSchema = z.object({
  type: z.enum(['harassment', 'inappropriate', 'spam', 'scam', 'other']),
  description: z.string().min(10, 'Please provide more details about the incident'),
  evidence: z.array(z.string()).optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

export const SafetyReportForm: React.FC<SafetyReportFormProps> = ({
  reportedUserId,
  onSubmit,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleFormSubmit = async (data: ReportFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Upload evidence files if any
      const evidenceUrls = await Promise.all(
        files.map(async (file: File, index: number) => {
          const formData = new FormData();
          formData.append('file', file);
          const response = await fetch('/api/safety/upload/evidence', {
            method: 'POST',
            body: formData,
          });
          const data = await response.json();
          return data;
        })
      );

      await onSubmit({
        type: data.type,
        description: data.description,
        reportedUserId,
        evidence: evidenceUrls.map((data, index) => ({
          id: data.id,
          alertId: data.alertId || '',
          type: 'image',
          url: data.url,
          description: files[index].name,
          createdAt: new Date().toISOString(),
        })),
      });
    } catch (err) {
      console.error('Error submitting safety report:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred while submitting the report'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <Select
        label="Report Type"
        {...register('type')}
        error={errors.type?.message}
        name="type"
        options={[
          { value: '', label: 'Select a reason for reporting' },
          { value: 'harassment', label: 'Harassment' },
          { value: 'inappropriate', label: 'Inappropriate Content' },
          { value: 'spam', label: 'Spam' },
          { value: 'scam', label: 'Scam' },
          { value: 'other', label: 'Other' },
        ]}
      />

      <TextArea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Please provide details about the incident..."
        rows={4}
        name="description"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700">Evidence (Optional)</label>
        <div className="mt-1">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">Upload any relevant images or screenshots</p>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>
    </form>
  );
};
