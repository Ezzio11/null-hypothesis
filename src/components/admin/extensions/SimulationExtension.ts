import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import SimulationNodeView from '../nodes/SimulationNodeView';

export default Node.create({
    name: 'simulation',

    group: 'block',

    atom: true,

    addAttributes() {
        return {
            component: {
                default: 'BetaShaper',
            },
            props: {
                default: {},
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'simulation-component',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['simulation-component', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(SimulationNodeView);
    },
});
