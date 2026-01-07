import { Node, mergeAttributes } from '@tiptap/core';

export const LayoutSection = Node.create({
    name: 'layoutSection',
    group: 'block',
    content: 'layoutColumn+',
    defining: true,

    addAttributes() {
        return {
            variant: {
                default: 'split', // split | reverse-split | full
            },
        };
    },

    parseHTML() {
        return [
            { tag: 'div[data-type="layout-section"]' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        let style = 'display: grid; gap: 2rem; grid-template-columns: 1fr;';
        let className = 'layout-section my-8';

        if (HTMLAttributes.variant === 'split') {
            // Text Left (Prose), Content Right
            // We use standard CSS for the editor/renderer compatibility
            style = 'display: grid; gap: 3rem; grid-template-columns: 1fr 1.4fr; align-items: start;';
        } else if (HTMLAttributes.variant === 'reverse-split') {
            // Content Left, Text Right
            style = 'display: grid; gap: 3rem; grid-template-columns: 1.4fr 1fr; align-items: start;';
        } else if (HTMLAttributes.variant === 'full') {
            style = 'display: block;';
        }

        // Responsive handling is tricky with inline styles in Tiptap's read-only mode without custom CSS.
        // For now, we rely on the direct styles which work great on Desktop.
        // In a real prod setup, we might add a class and handling it in CSS for mobile collapsing.

        return ['div', mergeAttributes(HTMLAttributes, {
            'data-type': 'layout-section',
            style,
            class: className
        }), 0];
    },
});

export const LayoutColumn = Node.create({
    name: 'layoutColumn',
    content: 'block+', // Can contain paragraphs, charts, simulations, etc.
    isolating: true,

    parseHTML() {
        return [
            { tag: 'div[data-type="layout-column"]' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, {
            'data-type': 'layout-column',
            style: 'min-width: 0;', // Prevent grid blowouts
            class: 'layout-column'
        }), 0];
    },
});
