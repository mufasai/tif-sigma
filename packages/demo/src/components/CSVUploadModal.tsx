import React, { useState, useRef } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (csvContent: string) => void;
}

export const CSVUploadModal: React.FC<CSVUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('File harus berformat .csv');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('File harus berformat .csv');
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Silakan upload file CSV terlebih dahulu!');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const csvContent = await file.text();
      onUpload(csvContent);
      setIsLoading(false);
      onClose();

      // Reset state
      setFile(null);
    } catch (err) {
      setError('Gagal membaca file CSV. Pastikan format file benar.');
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📥 Upload Data CSV</h2>
          <button className="close-button" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <div
            className={`drag-drop-area ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {!file ? (
              <>
                <FiUpload className="upload-icon" />
                <p className="drag-text">
                  <strong>Drag & drop file CSV di sini</strong>
                </p>
                <p className="or-text">atau</p>
                <button type="button" className="browse-button">
                  Pilih File
                </button>
                <p className="help-text">
                  File harus memiliki kolom: <strong>node, latitude, longitude</strong>
                </p>
              </>
            ) : (
              <>
                <FiUpload className="upload-icon success" />
                <p className="file-selected">
                  <strong>✓ {file.name}</strong>
                </p>
                <p className="file-size">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <button
                  type="button"
                  className="change-file-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                >
                  Ganti File
                </button>
              </>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="info-box">
            <p>
              <strong>ℹ️ Info:</strong>
            </p>
            <ul>
              <li>Setiap node merepresentasikan STO (Sentral Telepon Otomat)</li>
              <li>Titik akan ditampilkan berdasarkan koordinat latitude/longitude</li>
              <li>Koneksi antar node akan digenerate otomatis berdasarkan kedekatan geografis</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="button secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </button>
          <button
            className="button primary"
            onClick={handleSubmit}
            disabled={isLoading || !file}
          >
            {isLoading ? (
              <>⏳ Memproses...</>
            ) : (
              <>
                <FiUpload /> Upload & Visualisasi
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 4px;
          color: #666;
          transition: color 0.2s;
        }

        .close-button:hover {
          color: #333;
        }

        .modal-body {
          padding: 24px;
        }

        .drag-drop-area {
          border: 3px dashed #ccc;
          border-radius: 12px;
          padding: 60px 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafafa;
          margin-bottom: 20px;
        }

        .drag-drop-area:hover {
          border-color: #007bff;
          background: #f0f8ff;
        }

        .drag-drop-area.dragging {
          border-color: #007bff;
          background: #e3f2fd;
          transform: scale(1.02);
        }

        .drag-drop-area.has-file {
          border-color: #28a745;
          background: #f0fff4;
        }

        .upload-icon {
          font-size: 4rem;
          color: #007bff;
          margin-bottom: 16px;
        }

        .upload-icon.success {
          color: #28a745;
        }

        .drag-text {
          font-size: 1.1rem;
          color: #333;
          margin: 12px 0 8px 0;
        }

        .or-text {
          color: #999;
          margin: 12px 0;
          font-size: 0.9rem;
        }

        .browse-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
          margin: 8px 0;
        }

        .browse-button:hover {
          background: #0056b3;
        }

        .file-selected {
          font-size: 1.2rem;
          color: #28a745;
          margin: 12px 0 8px 0;
        }

        .file-size {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 16px;
        }

        .change-file-button {
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .change-file-button:hover {
          background: #545b62;
        }

        .help-text {
          display: block;
          font-size: 0.85rem;
          color: #666;
          margin-top: 12px;
        }

        .error-message {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 12px;
          border-radius: 6px;
          margin-top: 16px;
        }

        .info-box {
          background: #f0f8ff;
          border: 1px solid #b8daff;
          border-radius: 6px;
          padding: 12px;
          margin-top: 16px;
          font-size: 0.9rem;
          color: #004085;
        }

        .info-box ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }

        .info-box li {
          margin-bottom: 4px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #e0e0e0;
        }

        .button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .button.primary {
          background: #007bff;
          color: white;
        }

        .button.primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .button.secondary {
          background: #6c757d;
          color: white;
        }

        .button.secondary:hover:not(:disabled) {
          background: #545b62;
        }

        .button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
