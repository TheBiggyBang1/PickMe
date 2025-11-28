/**
 * FileUpload Component
 * 
 * Provides drag-and-drop file upload interface for resumes.
 * Supports PDF, DOCX, and TXT files up to 10MB.
 * 
 * Usage:
 * <FileUpload onUpload={handleFileUpload} loading={loading} />
 * 
 * Note: This is a TypeScript placeholder. Convert to FileUpload.tsx for React implementation.
 */

export interface FileUploadProps {
  onUpload: (file: File) => void;
  loading: boolean;
  acceptedTypes?: string[];
  maxSizeMB?: number;
}


import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';

export const FileUpload: React.FC<FileUploadProps> = (props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const acceptedTypes = props.acceptedTypes || ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  const maxSizeMB = props.maxSizeMB || 10;

  function validateFile(file: File): string | null {
    if (!acceptedTypes.includes(file.type)) {
      return 'Invalid file type. Only PDF, DOCX, and TXT allowed.';
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Max size is ${maxSizeMB}MB.`;
    }
    return null;
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setProgress(0);
    // Simulate upload progress
    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setProgress(100);
        props.onUpload(file);
      }
    }, 50);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(true);
  }
  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
  }
  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }
  function onChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
  }
  function onClick() {
    inputRef.current?.click();
  }

  return React.createElement(
    'div',
    {
      style: {
        background: 'rgba(255,255,255,0.13)',
        borderRadius: '24px',
        backdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.22)',
        padding: '2.5rem 2rem',
        maxWidth: '540px',
        margin: '0 auto',
        marginBottom: '2.5rem',
        color: '#fff',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(.4,2,.3,1)',
        borderWidth: dragActive ? 3 : 2,
        borderStyle: dragActive ? 'solid' : 'dashed',
        borderColor: dragActive ? '#667eea' : 'rgba(102,126,234,0.18)',
  boxShadow: dragActive ? '0 8px 30px rgba(102,126,234,0.22)' : undefined,
      },
      onDragOver,
      onDragLeave,
      onDrop,
      onClick,
    },
    [
      React.createElement('input', {
        key: 'file-input',
        ref: inputRef,
        type: 'file',
        style: { display: 'none' },
        accept: acceptedTypes.join(','),
        onChange,
        disabled: props.loading,
      }),
      React.createElement(
        'div',
        { key: 'icon', style: { fontSize: '4rem', marginBottom: 16 } },
        props.loading ? '⏳' : dragActive ? '📥' : '📄'
      ),
      React.createElement(
        'div',
        {
          key: 'label',
          style: {
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: 8,
            color: '#2d3748',
          },
        },
        props.loading ? 'Uploading...' : 'Upload Your Resume'
      ),
      React.createElement(
        'div',
        {
          key: 'sublabel',
          style: {
            fontSize: '0.95rem',
            color: '#718096',
            marginBottom: 16,
          },
        },
        'Drag & drop your file here, or click to browse'
      ),
      React.createElement(
        'div',
        {
          key: 'formats',
          style: {
            fontSize: '0.875rem',
            color: '#a0aec0',
          },
        },
        'Supported formats: PDF, DOCX, TXT (max 10MB)'
      ),
      error &&
        React.createElement(
          'div',
          {
            key: 'error',
            style: {
              marginTop: 16,
              padding: '12px 16px',
              background: 'rgba(245, 101, 101, 0.1)',
              color: '#e53e3e',
              borderRadius: 8,
              fontSize: '0.95rem',
            },
          },
          error
        ),
      progress > 0 &&
        progress < 100 &&
        React.createElement(
          'div',
          { key: 'progress-container', style: { marginTop: 16 } },
          [
            React.createElement(
              'div',
              {
                key: 'progress-bar-bg',
                style: {
                  width: '100%',
                  height: 8,
                  background: 'rgba(102, 126, 234, 0.2)',
                  borderRadius: 4,
                  overflow: 'hidden',
                },
              },
              React.createElement('div', {
                style: {
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  transition: 'width 0.3s ease',
                },
              })
            ),
            React.createElement(
              'div',
              {
                key: 'progress-text',
                style: {
                  marginTop: 8,
                  fontSize: '0.875rem',
                  color: '#667eea',
                  fontWeight: 600,
                },
              },
              `${progress}%`
            ),
          ]
        ),
    ]
  );
};

export default FileUpload;
