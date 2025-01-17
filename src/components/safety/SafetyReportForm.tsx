import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/forms/TextArea';
import { Select } from '@/components/forms/Select';
import { safetyService } from '@/services/api/safety.service';

interface SafetyReportFormProps {
  userId: string;
  onSubmit: (report: any) => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  type: string;
  description: string;
  evidence: File[];
}

export const SafetyReportForm: React.FC<SafetyReportFormProps> = ({
  userId,
  onSubmit,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>();

  const handleFileUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      setIsLoading(true);
      setError(null);
      const uploadedFiles = await Promise.all(
        Array.from(files).map((file) =>
          safetyService.uploadEvidence(userId, file)
        )
      );
      setValue('evidence', uploadedFiles);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while uploading files. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await onSubmit({
        ...data,
        userId,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error submitting report:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while submitting the report. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmit(handleFormSubmit)(e);
  };

  return (
    <form onSubmit={handleFormSubmitWrapper} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Select<FormData>
        label="Type of Report"
        name="type"
        register={register}
        rules={{ required: 'Please select a report type' }}
        error={errors.type?.message}
        options={[
          { value: 'harassment', label: 'Harassment' },
          { value: 'inappropriate', label: 'Inappropriate Behavior' },
          { value: 'spam', label: 'Spam' },
          { value: 'other', label: 'Other' },
        ]}
      />

      <TextArea<FormData>
        label="Description"
        name="description"
        register={register}
        rules={{
          required: 'Please provide a description',
          minLength: {
            value: 20,
            message: 'Please provide more details (minimum 20 characters)',
          },
        }}
        error={errors.description?.message}
        placeholder="Please describe what happened..."
      />

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Evidence (Optional)
        </label>
        <input
          type="file"
          multiple
          onChange={(e) => void handleFileUpload(e.target.files)}
          disabled={isLoading}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          variant="secondary"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          variant="primary"
        >
          {isLoading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>
    </form>
  );
};
