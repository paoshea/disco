import React, { forwardRef, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { useDropzone } from 'react-dropzone';

export interface FileUploadProps {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
}

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  ({ 
    label, 
    error, 
    fullWidth = false, 
    accept,
    maxSize = 5 * 1024 * 1024, // 5MB default
    multiple = false,
    onFilesSelected 
  }, ref) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    }, [onFilesSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept,
      maxSize,
      multiple
    });

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')} ref={ref}>
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md',
            isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300',
            error && 'border-red-500',
            'cursor-pointer hover:border-primary-500 transition-colors'
          )}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            {isDragActive ? (
              <p className="text-primary-600">Drop the files here...</p>
            ) : (
              <>
                <p className="text-gray-600">
                  Drag & drop files here, or click to select files
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {multiple ? 'Files' : 'File'} should be less than{' '}
                  {Math.round(maxSize / 1024 / 1024)}MB
                </p>
              </>
            )}
          </div>
        </div>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    );
  }
);
