import React, { useState } from 'react';
import { Platform } from 'react-native';
import { useDropzone } from 'react-dropzone';
import { createRoot } from 'react-dom/client';
import { colors, typography, borderRadius, shadows } from '../theme';
import './FileSelector.css';

interface FileSelectorProps {
  onFileSelect: (file: File | null) => void;
  onClose: () => void;
}

interface DropzoneComponentProps {
  onFileSelect: (file: File | null) => void;
  onClose: () => void;
}

const DropzoneComponent: React.FC<DropzoneComponentProps> = ({ onFileSelect, onClose }) => {
  const [error, setError] = useState<string>('');

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 1) {
      onFileSelect(acceptedFiles[0]);
      setError("");
      onClose();
    } else {
      setError("Please select exactly one JSON file.")
      onFileSelect(null);
      onClose();
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: colors.secondaryBg,
          padding: '25px',
          borderRadius: borderRadius.lg,
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%',
          ...shadows.md,
        }}
      >
        <h3 style={{
          color: colors.primaryText,
          fontSize: typography.h3.fontSize,
          fontWeight: 'bold',
          marginBottom: '20px',
        }}>
          Upload JSON File
        </h3>
        
        <input {...getInputProps()} />
        
        <div style={{
          border: `2px dashed ${colors.divider}`,
          borderRadius: borderRadius.md,
          padding: '20px',
          marginBottom: '20px',
          backgroundColor: colors.primaryBg,
          cursor: 'pointer',
        }}>
          <p style={{
            color: colors.primaryText,
            fontSize: typography.body.fontSize,
            margin: 0,
          }}>
            {isDragActive ? 
              'Drop the file here...' : 
              'Drag & drop a JSON file here, or click here to select one'
            }
          </p>
        </div>

        {error && <p style={{
          color: colors.error,
          fontSize: typography.body.fontSize,
          marginBottom: '15px',
        }}>{error}</p>}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            backgroundColor: colors.error,
            color: colors.primaryText,
            padding: '12px 25px',
            border: 'none',
            borderRadius: borderRadius.md,
            cursor: 'pointer',
            fontSize: typography.button.fontSize,
            fontWeight: 'bold',
            ...shadows.sm,
            transition: 'transform 0.2s ease'
          }}
          className="cancel-button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export const handleFileSelect = async (): Promise<File | null> => {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      container.style.zIndex = '10000';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100vw';
      container.style.height = '100vh';

      const root = createRoot(container);
      
      const handleClose = () => {
        root.unmount();
        container.remove();
      };

      const handleFileSelection = (file: File | null) => {
        resolve(file);
        handleClose();
      };

      root.render(
        <DropzoneComponent
          onFileSelect={handleFileSelection}
          onClose={() => {
            resolve(null);
            handleClose();
          }}
        />
      );
    });
  } else {
    try {
      // Dynamic import for native platforms
      const DocumentPicker = await import('react-native-document-picker');
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      return results[0] as unknown as File; // Type assertion for compatibility
    } catch (err) {
      if (err.name === 'DocumentPickerCanceled') {
        return null;
      }
      console.error('Error picking document:', err);
      return null;
    }
  }
}; 