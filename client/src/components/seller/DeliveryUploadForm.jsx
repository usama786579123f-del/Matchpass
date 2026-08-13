import { useState } from 'react';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const DeliveryUploadForm = ({ orderId, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'delivery-proofs');

      const uploadRes = await api.post('/uploads', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const proofFileUrl = uploadRes.data.data.url;

      await api.post(`/orders/${orderId}/upload-proof`, { proofFileUrl });
      toast.success('Delivery proof uploaded!');
      onUploaded?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not upload proof.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 py-8 text-center hover:border-primary-300 hover:bg-primary-50/30">
        <Upload size={22} className="text-slate-400" />
        <span className="text-sm text-slate-500">
          {file ? file.name : 'Click to upload ticket file (PDF or image)'}
        </span>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
      </label>

      <button type="submit" disabled={!file || uploading} className="btn-primary justify-center">
        {uploading ? 'Uploading...' : 'Upload delivery proof'}
      </button>
    </form>
  );
};

export default DeliveryUploadForm;