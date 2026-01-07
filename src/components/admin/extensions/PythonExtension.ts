import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PythonNodeView } from '../nodes/PythonNodeView';

export default Node.create({
    name: 'pythonPlayground',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            code: {
                default: 'import numpy as np\nprint("Ready for Science")',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'python-playground',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['python-playground', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(PythonNodeView);
    },
});
