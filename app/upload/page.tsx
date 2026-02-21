"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export default function UploadPage() {
  const [progress, setProgress] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [uploaded, setUploaded] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const CHUNK_SIZE = 10000;

  const cleanNumber = (num: any): string | null => {
    if (!num) return null;

    let str = String(num).replace(/\D/g, "");

    if (str.startsWith("91") && str.length > 10) {
      str = str.slice(-10);
    }

    if (str.length !== 10) return null;

    return str;
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage("");
    setProgress(0);
    setUploaded(0);

    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const numbers: string[] = [];

      jsonData.forEach((row: any) => {
        const cleaned = cleanNumber(row[0]);
        if (cleaned) numbers.push(cleaned);
      });

      setTotalContacts(numbers.length);

      for (let i = 0; i < numbers.length; i += CHUNK_SIZE) {
        const chunk = numbers.slice(i, i + CHUNK_SIZE);

        try {
          await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contacts: chunk }),
          });

          const newUploaded = Math.min(i + CHUNK_SIZE, numbers.length);
          setUploaded(newUploaded);
          setProgress(Math.round((newUploaded / numbers.length) * 100));
        } catch (error) {
          setMessage("Error uploading some chunks.");
          break;
        }
      }

      setLoading(false);
      setMessage("Upload completed successfully.");
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Upload Contacts</h1>

      <input
        type="file"
        accept=".csv, .xlsx, .xls"
        onChange={handleFileUpload}
        className="mb-4"
      />

      {loading && (
        <div className="w-full bg-gray-200 rounded h-4 mb-2">
          <div
            className="bg-blue-600 h-4 rounded"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <p>Total Contacts: {totalContacts}</p>
      <p>Uploaded: {uploaded}</p>
      <p>{message}</p>
    </div>
  );
}
