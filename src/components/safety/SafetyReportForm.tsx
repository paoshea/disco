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
        files.map(async file => {
          const response = await safetyService.uploadEvidence(file);
          return response.url;
        })
      );

      await onSubmit({
        type: data.type,
        description: data.description,
        reportedUserId,
        evidence: evidenceUrls.map(url => ({
          type: 'image',
          url,
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

      <Select label="Report Type" {...register('type')} error={errors.type?.message}>
        <option value="">Select a reason for reporting</option>
        <option value="harassment">Harassment</option>
        <option value="inappropriate">Inappropriate Content</option>
        <option value="spam">Spam</option>
        <option value="scam">Scam</option>
        <option value="other">Other</option>
      </Select>

      <TextArea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Please provide details about the incident..."
        rows={4}
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
