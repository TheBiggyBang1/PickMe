/**
 * FileUpload Component - Enhanced with Animations
 * 
 * Drag-and-drop resume upload with animated progress and feedback
 */

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export interface FileUploadProps {
  onUpload: (file: File) => void;
  loading: boolean;
  acceptedTypes?: string[];
  maxSizeMB?: number;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const dropzoneVariants = {
  default: { borderColor: 'rgba(102, 126, 234, 0.3)' },
  hover: {
    borderColor: 'rgb(102, 126, 234)',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    scale: 1.02,
  },
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  loading,
  acceptedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  maxSizeMB = 10,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return 'Invalid file type. Only PDF, DOCX, and TXT allowed.';
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Max size is ${maxSizeMB}MB.`;
    }
    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSuccess(null);
      return;
    }

    setError(null);
    setFileName(file.name);
    setProgress(0);

    // Simulate upload progress
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 30;
      if (prog > 100) prog = 100;
      setProgress(prog);
      
      if (prog >= 100) {
        clearInterval(interval);
        setSuccess(`Successfully uploaded ${file.name}`);
        setTimeout(() => {
          setSuccess(null);
          onUpload(file);
        }, 500);
      }
    }, 200);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="card">
        <h2 className="card-title">Upload Your Resume</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Upload your resume to get matched with relevant job opportunities
        </p>

        {/* Upload Zone */}
        <motion.div
          variants={dropzoneVariants}
          initial="default"
          animate={dragActive ? 'hover' : 'default'}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: '2px dashed rgba(102, 126, 234, 0.3)',
            borderRadius: '1rem',
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backgroundColor: dragActive ? 'rgba(102, 126, 234, 0.05)' : 'var(--bg-secondary)',
          }}
        >
          <motion.div
            animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: '1rem' }}
          >
            <FiUploadCloud size={48} color="var(--primary-color)" />
          </motion.div>

          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Drop your resume here
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            or click to browse files
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Supported formats: PDF, DOCX, TXT (Max {maxSizeMB}MB)
          </p>
        </motion.div>

        {/* Progress Bar */}
        {progress > 0 && progress < 100 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ marginTop: '1.5rem' }}
          >
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Uploading...
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--primary-color)', fontWeight: '600' }}>
                {Math.round(progress)}%
              </span>
            </div>
            <motion.div
              style={{
                height: '4px',
                background: 'var(--bg-secondary)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '2px',
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(72, 187, 120, 0.1)',
              border: '1px solid rgba(72, 187, 120, 0.3)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--success-color)',
            }}
          >
            <FiCheckCircle size={20} />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(245, 101, 101, 0.1)',
              border: '1px solid rgba(245, 101, 101, 0.3)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--danger-color)',
            }}
          >
            <FiAlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* File Info */}
        {fileName && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'var(--bg-secondary)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span style={{ color: 'var(--primary-color)' }}>📄</span>
            <span style={{ color: 'var(--text-primary)' }}>{fileName}</span>
          </motion.div>
        )}

        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="file"
          onChange={handleChange}
          accept={acceptedTypes.join(',')}
          style={{ display: 'none' }}
        />
      </div>
    </motion.div>
  );
};
