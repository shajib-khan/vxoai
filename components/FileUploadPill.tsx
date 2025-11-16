import React from 'react';

interface FileUploadPillProps {
	fileName: string;
	onRemove: () => void;
}

const FileUploadPill: React.FC<FileUploadPillProps> = ({ fileName, onRemove }) => (
	<div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm mr-2 mb-2">
		<span className="truncate max-w-xs">{fileName}</span>
		<button
			type="button"
			className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
			onClick={onRemove}
			aria-label="Remove file"
		>
			&times;
		</button>
	</div>
);

export default FileUploadPill;
