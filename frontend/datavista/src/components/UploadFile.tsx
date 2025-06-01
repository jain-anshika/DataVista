'use client';

import { useState } from 'react';
import { uploadFileApi } from '@/lib/api';

export default function UploadFile() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }
    try {
      const data = await uploadFileApi(file);
      setMessage('File uploaded successfully. Insights: ' + JSON.stringify(data));
    } catch (error) {
      if (error instanceof Error) {
        setMessage('Upload failed: ' + error.message);
      } else {
        setMessage('Error uploading file.');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Upload CSV</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} className="mb-4" />
      <button onClick={handleUpload} className="bg-purple-500 p-2 rounded">Upload</button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
