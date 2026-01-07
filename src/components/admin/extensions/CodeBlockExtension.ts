import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CodeBlockNodeView } from '../nodes/CodeBlockNodeView';
import { common, createLowlight } from 'lowlight';

// We need to install lowlight for syntax highlighting
const lowlight = createLowlight(common);

export const CodeBlockExtension = CodeBlockLowlight.extend({
    addNodeView() {
        return ReactNodeViewRenderer(CodeBlockNodeView);
    },
}).configure({ lowlight });
