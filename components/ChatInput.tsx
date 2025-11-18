
"use client"
import { useRef, useState } from 'react';
import FileUploadPill from './FileUploadPill';
import { Upload } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

type ChatInputProps = {
  centered?: boolean;
  onSend?: (message: string, file?: File | null) => Promise<void> | void;
}

const ChatInput: React.FC<ChatInputProps> = ({ centered = false, onSend }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message && !file) return;
    try {
      if (onSend) await onSend(message, file);
    } finally {
      setMessage('');
      setFile(null);
    }
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

  const baseClasses = 'flex flex-col gap-2 bg-white p-4 w-full';
  const centeredClasses = 'fixed inset-0 flex items-center justify-center';
  const bottomStickyClasses = 'sticky bottom-0';

  return (
    <form
      onSubmit={handleSend}
      className={`${baseClasses} ${centered ? centeredClasses : bottomStickyClasses}`}
    >
      {file && (
        <FileUploadPill fileName={file.name} onRemove={handleRemoveFile} />
      )}
      <div className="flex items-center gap-2">
        <Input
          type="text"
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <Input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          className="px-3 py-2 rounded-full bg-foreground text-white hover:bg-gray-700 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach file"
        >
          <Upload/>
        </Button>
        <Button
          type="submit"
          className="px-4 py-2 bg-[#3B82F6] text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
          disabled={!message && !file}
        >
          Send
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
