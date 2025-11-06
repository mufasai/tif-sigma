import { FC, useState, useRef } from "react";
import { GrClose } from "react-icons/gr";
import { MdAdd, MdUploadFile } from "react-icons/md";
import { GraphInputData } from "../types";
import { normalizeJsonData, validateNormalizedData } from "../utils/data-normalizer";

interface DataInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GraphInputData) => void;
  onNotify?: (message: string, type: "success" | "error" | "warning" | "info") => void;
}

interface DataInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GraphInputData) => void;
}

const DataInputModal: FC<DataInputModalProps> = ({ isOpen, onClose, onSubmit, onNotify }) => {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const rawData = JSON.parse(content);
        
        // Normalize the data
        const normalizedData = normalizeJsonData(rawData);
        
        // Validate the normalized data
        const validation = validateNormalizedData(normalizedData);
        
        if (!validation.valid) {
          setError(`Data validation warnings:\n${validation.errors.slice(0, 3).join('\n')}`);
          // Still allow submission but show warnings
        }
        
        // Set the normalized JSON in the textarea
        setJsonInput(JSON.stringify(normalizedData, null, 2));
        
        if (onNotify) {
          onNotify(
            `File "${file.name}" berhasil dimuat dan diformat: ${normalizedData.nodes.length} nodes, ${normalizedData.edges?.length || 0} edges`,
            validation.valid ? "success" : "warning"
          );
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(`Failed to parse file: ${errorMsg}`);
        if (onNotify) {
          onNotify(`Gagal membaca file: ${errorMsg}`, "error");
        }
      }
    };
    
    reader.onerror = () => {
      setError("Failed to read file");
      if (onNotify) {
        onNotify("Gagal membaca file", "error");
      }
    };
    
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    setError("");
    
    try {
      const parsed = JSON.parse(jsonInput);
      
      // Normalize the data (in case user pasted raw data)
      const normalizedData = normalizeJsonData(parsed);
      
      // Validate the structure
      const validation = validateNormalizedData(normalizedData);
      
      if (!validation.valid && normalizedData.nodes.length === 0) {
        setError("Invalid format: No valid nodes found\n" + validation.errors.slice(0, 3).join('\n'));
        return;
      }

      // Submit the data
      onSubmit(normalizedData);
      setJsonInput("");
      setError("");
      setUploadedFileName("");
      onClose();
      
      if (onNotify) {
        onNotify(
          `Data berhasil ditambahkan: ${normalizedData.nodes.length} nodes, ${normalizedData.edges?.length || 0} edges`,
          "success"
        );
      }
    } catch (e) {
      setError("Invalid JSON format: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const exampleData = {
    nodes: [
      {
        hostname: "SW-Example-01",
        manufacture: "Cisco",
        model: "Nexus9000",
        region: "Jakarta",
        slot: 48,
        port_used: 32,
        port_idle: 16,
        percentage_used: 66.67,
        latitude: -6.2088,
        longitude: 106.8456
      }
    ],
    edges: [
      {
        source: "SW-Example-01",
        target: "SW-JAK-CORE-01"
      }
    ]
  };

  const fillExample = () => {
    setJsonInput(JSON.stringify(exampleData, null, 2));
    setError("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <MdAdd /> Add Graph Data
          </h2>
          <button type="button" className="modal-close" onClick={onClose} title="Close">
            <GrClose />
          </button>
        </div>
        
        <div className="modal-body">
          <p className="modal-description">
            Upload file JSON atau masukkan data secara manual. Sistem akan otomatis mendeteksi dan 
            mengkonversi berbagai format data (nodes/edges, network topology, traffic data, dll) 
            ke format yang sesuai untuk visualisasi.
          </p>
          
          <div className="upload-section">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="json-file-upload"
            />
            <label htmlFor="json-file-upload" className="button-upload">
              <MdUploadFile /> Upload JSON File
            </label>
            {uploadedFileName && (
              <span className="uploaded-file-name">📄 {uploadedFileName}</span>
            )}
          </div>

          <div className="divider">
            <span>atau</span>
          </div>
          
          <button type="button" className="button-secondary" onClick={fillExample}>
            Fill Example Data
          </button>

          <textarea
            className="json-input"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{"nodes": [...], "edges": [...]} atau format data lainnya'
            rows={15}
          />

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-footer">
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="button-primary" onClick={handleSubmit}>
            Add Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataInputModal;
