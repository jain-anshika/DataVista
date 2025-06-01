/* eslint-disable @typescript-eslint/no-explicit-any */
// API utility for backend calls
export async function uploadFileApi(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://datavista-6e4b.onrender.com/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }
  return data;
}
