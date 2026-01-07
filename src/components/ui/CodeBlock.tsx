import { Copy } from "lucide-react";

export default function CodeBlock({ code, language = "python", filename }: { code: string; language?: string; filename?: string }) {
  return (
    // Added dir="ltr" and "text-left" to force standard code layout
    <div 
      dir="ltr" 
      className="my-8 rounded-lg overflow-hidden border border-ink/10 bg-[#1e1e1e] shadow-2xl text-sm text-left"
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/5">
        <span className="font-mono text-xs text-white/40">{filename || language}</span>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
        </div>
      </div>
      
      {/* Code Area */}
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-gray-300 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}