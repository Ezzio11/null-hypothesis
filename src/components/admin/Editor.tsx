"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import ChartExtension from './extensions/ChartExtension';
import SimulationExtension from './extensions/SimulationExtension';
import PythonExtension from './extensions/PythonExtension';
import MathExtension from './extensions/MathExtension';
import { CodeBlockExtension } from './extensions/CodeBlockExtension';
import { LayoutSection, LayoutColumn } from './extensions/LayoutExtension';
import { SlashCommand, suggestionOptions } from './extensions/SlashCommand';
import { EditorBubbleMenu } from './menus/EditorBubbleMenu';
import { DragHandle } from './menus/DragHandle';
import { useEffect } from 'react';
// import EditorToolbar from './EditorToolbar'; // Removed for Visual Builder

interface EditorProps {
    initialContent?: string;
    onChange: (json: any) => void;
    className?: string;
}

const TiptapEditor = ({ initialContent, onChange, className }: EditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
            }),
            Markdown,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Youtube.configure({
                controls: false,
                nocookie: true,
            }),
            ChartExtension,
            SimulationExtension,
            PythonExtension,
            MathExtension,
            CodeBlockExtension,
            LayoutSection,
            LayoutColumn,
            SlashCommand.configure({
                suggestion: suggestionOptions,
            }),
        ],
        content: initialContent || '',
        editorProps: {
            attributes: {
                // Modified for Visual Builder: Matches frontend "prose" exactly, no extra padding
                class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[500px] font-serif leading-relaxed text-ink/90 selection:bg-accent/20',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON());
        },
        immediatelyRender: false,
    });

    // Handle updates if initialContent changes externally (e.g. data fetch)
    useEffect(() => {
        if (editor && initialContent && editor.isEmpty) {
            editor.commands.setContent(initialContent);
        }
    }, [initialContent, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className={`relative border border-neutral-800 rounded-lg bg-neutral-900/50 ${className} flex flex-col`}>
            <EditorBubbleMenu editor={editor} />
            <div className="flex-1 overflow-y-auto">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default TiptapEditor;

