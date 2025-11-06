import { FC, useState, useCallback, DragEvent } from "react";
import { GrClose } from "react-icons/gr";
import { FiUpload, FiDownload } from "react-icons/fi";
import { BiMerge } from "react-icons/bi";
import Papa from "papaparse";
import "../styles/csv-join-view.css";

interface CsvJoinViewProps {
  onClose: () => void;
}

interface CsvData {
  headers: string[];
  rows: Record<string, any>[];
}

export const CsvJoinView: FC<CsvJoinViewProps> = ({ onClose }) => {
  const [file1, setFile1] = useState<CsvData | null>(null);
  const [file2, setFile2] = useState<CsvData | null>(null);
  const [file1Name, setFile1Name] = useState<string>("");
  const [file2Name, setFile2Name] = useState<string>("");
  const [joinColumn1, setJoinColumn1] = useState<string>("");
  const [joinColumn2, setJoinColumn2] = useState<string>("");
  const [joinedData, setJoinedData] = useState<Record<string, any>[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [dragOver1, setDragOver1] = useState(false);
  const [dragOver2, setDragOver2] = useState(false);

  const handleFileUpload = useCallback((
    file: File,
    setData: (data: CsvData) => void,
    setName: (name: string) => void
  ) => {
    setError("");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length > 0) {
          const headers = Object.keys(results.data[0] as object);
          setData({
            headers,
            rows: results.data as Record<string, any>[],
          });
          setName(file.name);
        }
      },
      error: (err) => {
        setError(`Error parsing ${file.name}: ${err.message}`);
      },
    });
  }, []);

  const handleJoin = useCallback(() => {
    if (!file1 || !file2 || !joinColumn1 || !joinColumn2) {
      setError("Please upload both files and select join columns");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate processing delay for animation
    setTimeout(() => {
      try {
        // Create a map for faster lookup
        const file2Map = new Map<string, Record<string, any>>();
        file2.rows.forEach((row) => {
          const key = String(row[joinColumn2] || "").trim().toLowerCase();
          if (key) {
            file2Map.set(key, row);
          }
        });

        // Perform left outer join (keep all records from file1)
        const joined = file1.rows.map((row1) => {
          const key = String(row1[joinColumn1] || "").trim().toLowerCase();
          const row2 = file2Map.get(key);

          if (row2) {
            // Merge rows, prefixing file2 columns to avoid conflicts
            const merged: Record<string, any> = { ...row1 };
            Object.keys(row2).forEach((col) => {
              const newCol = col === joinColumn2 ? col : `file2_${col}`;
              merged[newCol] = row2[col];
            });
            return merged;
          }

          // No match found, keep file1 row as is
          return row1;
        });

        // Add unmatched rows from file2
        file2.rows.forEach((row2) => {
          const key = String(row2[joinColumn2] || "").trim().toLowerCase();
          const hasMatch = file1.rows.some((row1) => {
            const key1 = String(row1[joinColumn1] || "").trim().toLowerCase();
            return key1 === key;
          });

          if (!hasMatch) {
            const merged: Record<string, any> = {};
            Object.keys(row2).forEach((col) => {
              const newCol = col === joinColumn2 ? joinColumn1 : `file2_${col}`;
              merged[newCol] = row2[col];
            });
            joined.push(merged);
          }
        });

        setJoinedData(joined);
      } catch (err) {
        setError(`Error joining data: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  }, [file1, file2, joinColumn1, joinColumn2]);

  const handleExport = useCallback(() => {
    if (!joinedData || joinedData.length === 0) return;

    const csv = Papa.unparse(joinedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `joined_data_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [joinedData]);

  const handleDragOver = useCallback((e: DragEvent<HTMLLabelElement>, fileNum: 1 | 2) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileNum === 1) {
      setDragOver1(true);
    } else {
      setDragOver2(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLLabelElement>, fileNum: 1 | 2) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileNum === 1) {
      setDragOver1(false);
    } else {
      setDragOver2(false);
    }
  }, []);

  const handleDrop = useCallback((
    e: DragEvent<HTMLLabelElement>,
    fileNum: 1 | 2,
    setData: (data: CsvData) => void,
    setName: (name: string) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (fileNum === 1) {
      setDragOver1(false);
    } else {
      setDragOver2(false);
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        handleFileUpload(file, setData, setName);
      } else {
        setError("Please upload a valid CSV file");
      }
    }
  }, [handleFileUpload]);

  return (
    <div className="csv-join-overlay">
      <div className="csv-join-container">
        <div className="csv-join-header">
          <h2>
            <BiMerge /> CSV Data Join Tool
          </h2>
          <button className="close-btn" onClick={onClose} title="Close">
            <GrClose />
          </button>
        </div>

        <div className="csv-join-content">
          {error && <div className="error-message">{error}</div>}

          <div className="upload-section">
            {/* File 1 Upload */}
            <div className="upload-card">
              <div className="upload-header">
                <h3>File 1</h3>
                {file1Name && <span className="file-name">{file1Name}</span>}
              </div>
              <label 
                className={`upload-area ${dragOver1 ? "drag-over" : ""}`}
                onDragOver={(e) => handleDragOver(e, 1)}
                onDragLeave={(e) => handleDragLeave(e, 1)}
                onDrop={(e) => handleDrop(e, 1, setFile1, setFile1Name)}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, setFile1, setFile1Name);
                  }}
                />
                <FiUpload />
                <span>Click or drag & drop CSV file here</span>
              </label>
              {file1 && (
                <div className="column-select">
                  <label>Join Column:</label>
                  <select
                    value={joinColumn1}
                    onChange={(e) => setJoinColumn1(e.target.value)}
                  >
                    <option value="">Select column...</option>
                    {file1.headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                  <div className="data-info">
                    {file1.rows.length} rows, {file1.headers.length} columns
                  </div>
                </div>
              )}
            </div>

            {/* File 2 Upload */}
            <div className="upload-card">
              <div className="upload-header">
                <h3>File 2</h3>
                {file2Name && <span className="file-name">{file2Name}</span>}
              </div>
              <label 
                className={`upload-area ${dragOver2 ? "drag-over" : ""}`}
                onDragOver={(e) => handleDragOver(e, 2)}
                onDragLeave={(e) => handleDragLeave(e, 2)}
                onDrop={(e) => handleDrop(e, 2, setFile2, setFile2Name)}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, setFile2, setFile2Name);
                  }}
                />
                <FiUpload />
                <span>Click or drag & drop CSV file here</span>
              </label>
              {file2 && (
                <div className="column-select">
                  <label>Join Column:</label>
                  <select
                    value={joinColumn2}
                    onChange={(e) => setJoinColumn2(e.target.value)}
                  >
                    <option value="">Select column...</option>
                    {file2.headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                  <div className="data-info">
                    {file2.rows.length} rows, {file2.headers.length} columns
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="action-section">
            <button
              className="join-btn"
              onClick={handleJoin}
              disabled={!file1 || !file2 || !joinColumn1 || !joinColumn2 || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  Joining Data...
                </>
              ) : (
                <>
                  <BiMerge /> Join Data
                </>
              )}
            </button>
          </div>

          {isLoading && (
            <div className="loading-animation">
              <div className="loading-bars">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
              <p>Processing your data...</p>
            </div>
          )}

          {joinedData && !isLoading && (
            <div className="result-section">
              <div className="result-header">
                <h3>Join Result</h3>
                <button className="export-btn" onClick={handleExport}>
                  <FiDownload /> Export CSV
                </button>
              </div>
              <div className="result-info">
                Total rows: {joinedData.length} | Columns: {Object.keys(joinedData[0] || {}).length}
              </div>
              <div className="result-preview">
                <table>
                  <thead>
                    <tr>
                      {joinedData.length > 0 &&
                        Object.keys(joinedData[0]).map((header) => (
                          <th key={header}>{header}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {joinedData.slice(0, 10).map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((value, cellIdx) => (
                          <td key={cellIdx}>{String(value || "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {joinedData.length > 10 && (
                  <div className="preview-note">
                    Showing first 10 rows of {joinedData.length}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CsvJoinView;
