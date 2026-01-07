import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MathNodeView } from '../nodes/MathNodeView';

export default Node.create({
    name: 'math',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            latex: {
                default: 'E = mc^2',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'math-tex',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['math-tex', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(MathNodeView);
    },
});
