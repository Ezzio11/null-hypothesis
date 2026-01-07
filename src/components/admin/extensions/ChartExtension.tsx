import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ChartNodeView from '../nodes/ChartNodeView';

export default Node.create({
    name: 'chart',

    group: 'block',

    atom: true,

    addAttributes() {
        return {
            chartType: {
                default: 'area', // area, line, bar
            },
            data: {
                default: [
                    { name: 'Jan', value: 400 },
                    { name: 'Feb', value: 300 },
                    { name: 'Mar', value: 550 },
                    { name: 'Apr', value: 450 },
                    { name: 'May', value: 600 },
                ],
            },
            config: {
                default: {
                    xAxisKey: 'name',
                    dataKeys: ['value'],
                    colors: ['#8884d8'],
                }
            }
        }
    },

    parseHTML() {
        return [
            {
                tag: 'chart-component',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['chart-component', mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return ReactNodeViewRenderer(ChartNodeView)
    },
});
