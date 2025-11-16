
'use client'
import { useRef, useState } from 'react';
import FileUploadPill from './FileUploadPill';
import { Upload } from 'lucide-react';

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement send logic (API call, etc.)
    setMessage('');
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <form onSubmit={handleSend} className="flex flex-col gap-2">
      {file && (
        <FileUploadPill fileName={file.name} onRemove={handleRemoveFile} />
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="px-3 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach file"
        >
          <Upload/>
        </button>
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-[#3B82F6] text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
          disabled={!message && !file}
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
