import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React from 'react';

export const CodeBlockNodeView = ({ node, updateAttributes, extension }: any) => {
    return (
        <NodeViewWrapper className="not-prose my-8 rounded-lg overflow-hidden border border-ink/10 bg-[#1e1e1e] shadow-2xl text-sm text-left font-mono">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/5 select-none">
                <select
                    contentEditable={false}
                    defaultValue={node.attrs.language}
                    onChange={event => updateAttributes({ language: event.target.value })}
                    className="bg-transparent text-xs text-white/40 focus:outline-none cursor-pointer hover:text-white/60"
                >
                    <option value="null">plain text</option>
                    <option value="python">python</option>
                    <option value="javascript">javascript</option>
                    <option value="typescript">typescript</option>
                    <option value="sql">sql</option>
                    <option value="css">css</option>
                    <option value="html">html</option>
                </select>

                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 overflow-x-auto">
                <pre className="font-mono text-gray-300 leading-relaxed bg-transparent p-0 m-0">
                    <NodeViewContent as="code" />
                </pre>
            </div>
        </NodeViewWrapper>
    );
};
