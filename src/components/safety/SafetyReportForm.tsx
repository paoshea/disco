import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { SafetyReportFormProps, SafetyEvidence } from '@/types/safety';
import { TextArea } from '@/components/forms/TextArea';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface UploadResponse {
  id: string;
  url: string;
}

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

  const uploadFile = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/safety/upload/evidence', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to upload file');
    }
    return response.json();
  };

  const handleFormSubmit = async (data: ReportFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Upload evidence files if any
      const evidenceUrls = await Promise.all(files.map(uploadFile));

      const evidence: SafetyEvidence[] = evidenceUrls.map((uploadData, i) => ({
        id: uploadData.id,
        alertId: '',
        type: 'image',
        url: uploadData.url,
        description: files[i].name,
        createdAt: new Date().toISOString(),
      }));

      await onSubmit({
        type: data.type,
        description: data.description,
        reportedUserId,
        evidence,
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

  const wrappedSubmit = (data: ReportFormData) => {
    void handleFormSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(wrappedSubmit)} className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <Select
        label="Report Type"
        {...register('type')}
        error={errors.type?.message}
        name="type"
        options={[
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
      />

      <div>
        <label className="block text-sm font-medium text-gray-700">Evidence (Optional)</label>
        <input
          type="file"
          onChange={handleFileChange}
          multiple
          accept="image/*,video/*"
          className="mt-1 block w-full"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>
    </form>
  );
};
