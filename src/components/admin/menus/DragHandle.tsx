import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { GripVertical, Plus } from 'lucide-react';
// import { DragHandlePlugin } from 'echo-drag-handle-plugin'; // Removed fake import

interface DragHandleProps {
    editor: Editor;
}

export const DragHandle = ({ editor }: DragHandleProps) => {
    const [position, setPosition] = useState<number | null>(null);
    const [currentNode, setCurrentNode] = useState<any>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!editor) return;

        const updatePosition = () => {
            const { from } = editor.state.selection;
            const domInfo = editor.view.domAtPos(from);

            // This is a simplified logic. In a real prod app we'd use a ProseMirror plugin 
            // to track the exact node coordinates.
            // For now, we find the closest block parent.
            let el = domInfo.node as HTMLElement;
            if (el.nodeType === 3) el = el.parentElement as HTMLElement; // Text node -> Parent

            const block = el.closest('.tiptap > *'); // Top level block

            if (block) {
                const rect = (block as HTMLElement).getBoundingClientRect();
                const editorRect = editor.view.dom.getBoundingClientRect();
                // Relative position
                setPosition(rect.top - editorRect.top);
            }
        };

        editor.on('selectionUpdate', updatePosition);
        editor.on('update', updatePosition);

        return () => {
            editor.off('selectionUpdate', updatePosition);
            editor.off('update', updatePosition);
        };
    }, [editor]);

    if (position === null) return null;

    return (
        <div
            className="absolute left-2 w-6 h-6 flex items-center justify-center cursor-grab text-ink/20 hover:text-ink transition-colors z-10"
            style={{ top: position + 32 }} // +32 for padding offset
        >
            <GripVertical className="w-4 h-4" />
        </div>
    );
};
