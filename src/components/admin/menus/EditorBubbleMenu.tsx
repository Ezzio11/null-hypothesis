import { BubbleMenu, Editor } from '@tiptap/react';
import { Bold, Italic, Code, SquareTerminal, Link as LinkIcon, Unlink } from 'lucide-react';
import { useCallback } from 'react';

interface MenuProps {
    editor: Editor;
}

export const EditorBubbleMenu = ({ editor }: MenuProps) => {

    if (!editor) {
        return null;
    }

    return (
        <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="flex items-center gap-1 p-1 bg-paper border border-ink/10 rounded-lg shadow-xl dark:bg-neutral-900 dark:border-neutral-800"
        >
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-ink/5 ${editor.isActive('bold') ? 'text-blue-500 bg-blue-500/10' : 'text-neutral-500'}`}
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-ink/5 ${editor.isActive('italic') ? 'text-blue-500 bg-blue-500/10' : 'text-neutral-500'}`}
            >
                <Italic className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-1.5 rounded hover:bg-ink/5 ${editor.isActive('strike') ? 'text-blue-500 bg-blue-500/10' : 'text-neutral-500'}`}
            >
                <div className="w-4 h-4 font-bold relative flex items-center justify-center">
                    <span className="line-through text-xs">S</span>
                </div>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`p-1.5 rounded hover:bg-ink/5 ${editor.isActive('code') ? 'text-blue-500 bg-blue-500/10' : 'text-neutral-500'}`}
            >
                <Code className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-ink/10 mx-1" />

            <button
                onClick={() => {
                    const previousUrl = editor.getAttributes('link').href
                    const url = window.prompt('URL', previousUrl)
                    if (url === null) return
                    if (url === '') {
                        editor.chain().focus().extendMarkRange('link').unsetLink().run()
                        return
                    }
                    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
                }}
                className={`p-1.5 rounded hover:bg-ink/5 ${editor.isActive('link') ? 'text-blue-500 bg-blue-500/10' : 'text-neutral-500'}`}
            >
                <LinkIcon className="w-4 h-4" />
            </button>
        </BubbleMenu>
    );
}
