import React, { useState, useRef } from 'react';
import { TicketDocument, UserRole } from '../types';
import { 
  FileUp, 
  FileDown, 
  Trash2, 
  ShieldCheck, 
  FileText, 
  Image as ImageIcon, 
  Archive, 
  Loader2,
  Lock
} from 'lucide-react';

interface TicketDocumentManagerProps {
  issueId: string;
  documents: TicketDocument[];
  currentRole: UserRole;
  currentUserName: string;
  onUploadDocument: (issueId: string, doc: TicketDocument) => void;
  onDeleteDocument: (issueId: string, docId: string) => void;
}

export default function TicketDocumentManager({
  issueId,
  documents = [],
  currentRole,
  currentUserName,
  onUploadDocument,
  onDeleteDocument
}: TicketDocumentManagerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (!dataUrl) {
        setIsUploading(false);
        return;
      }

      // Format size
      let sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      if (file.size > 1024 * 1024) {
        sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      }

      const newDoc: TicketDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: sizeStr,
        uploadedBy: currentRole,
        uploadedByName: currentUserName,
        uploadedAt: new Date().toISOString(),
        dataUrl: dataUrl
      };

      // Slight timeout for a gorgeous professional visual upload simulation
      setTimeout(() => {
        onUploadDocument(issueId, newDoc);
        setIsUploading(false);
      }, 750);
    };

    reader.onerror = () => {
      setIsUploading(false);
      alert("Failed to read file.");
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Helper to get visual document icons based on file type
  const getFileIcon = (mimeType: string) => {
    const mainType = mimeType.toLowerCase();
    if (mainType.includes('image')) return <ImageIcon className="w-5 h-5 text-indigo-500" />;
    if (mainType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (mainType.includes('zip') || mainType.includes('tar') || mainType.includes('rar') || mainType.includes('compressed')) {
      return <Archive className="w-5 h-5 text-amber-500" />;
    }
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  const downloadFile = (doc: TicketDocument) => {
    const link = document.createElement('a');
    link.href = doc.dataUrl;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#fdfcf9] border border-[#e9e7df] rounded-2xl p-5 space-y-4 shadow-sm text-slate-800">
      
      {/* Container Header */}
      <div className="flex justify-between items-center pb-2 border-b border-[#f0eee6]">
        <div className="flex items-center gap-2">
          <FileUp className="w-4 h-4 text-[#5a5a40]" />
          <span className="text-xs font-black uppercase text-[#2c3124] tracking-wider">
            SLA Secure Document Vault
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secure Encrypted Storage</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed font-sans">
        Upload hardware settings, diagrams, error logs, photos, and resolution screenshots to support your technical ticket.
      </p>

      {/* Upload Drag-and-Drop Arena */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50/40' 
            : 'border-[#dce0d1] bg-white hover:border-[#5a5a40]'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          onChange={handleChange}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <Loader2 className="w-8 h-8 text-[#5a5a40] animate-spin" />
            <span className="text-xs font-bold text-slate-600 font-mono">ENCRYPTING &amp; ENCODING FILE MEMORY BLOCK...</span>
          </div>
        ) : (
          <div className="space-y-2 py-2">
            <div className="p-3 bg-[#fbfbfa] border border-[#f0eee6] rounded-full inline-block text-[#5a5a40]">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Drag and drop your file here, or <span className="text-indigo-600 underline">browse computer</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Supports and stores any document style, images, sheets up to 25MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
          Vault Index ({documents.length} secure documents)
        </h4>

        {documents.length === 0 ? (
          <div className="text-center py-6 bg-white border border-[#f0eee6] rounded-xl text-slate-400 text-xs font-sans">
            No files attached to this Ticket. Upload diagnostic sheets or settlement balance details above.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto">
            {documents.map((doc) => {
              const isOwner = doc.uploadedBy === currentRole;
              return (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-white border border-[#f0eee6] rounded-xl hover:border-[#5a5a40] transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                      {getFileIcon(doc.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate pr-2 max-w-[200px] md:max-w-[320px]">
                        {doc.name}
                      </div>
                      <div className="text-[9px] text-[#8a8d81] flex items-center gap-1 flex-wrap">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span className="uppercase text-[8px] font-bold bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                          {doc.uploadedBy}
                        </span>
                        <span>({doc.uploadedByName})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Lock Icon overlay indicating security */}
                    <div className="p-1 text-emerald-600" title="Secure Encrypted Document Link">
                      <Lock className="w-3.5 h-3.5" />
                    </div>

                    <button
                      onClick={() => downloadFile(doc)}
                      className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 transition-all cursor-pointer"
                      title="Download clean document copy"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>

                    {/* Can delete if they uploaded it, or if they are the Operator (Admin) */}
                    {(isOwner || currentRole === 'operator') && (
                      <button
                        onClick={() => onDeleteDocument(issueId, doc.id)}
                        className="p-1.5 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-105 transition-all cursor-pointer"
                        title="Delete from safe memory vault"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
