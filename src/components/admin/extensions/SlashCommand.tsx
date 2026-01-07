import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { CommandList } from '../menus/CommandList';
import {
    Type, Heading1, Heading2, Heading3,
    List, ListOrdered, Quote, Image,
    BarChart, Cpu, Layout, Youtube,
    Code, SquareTerminal, Sigma
} from 'lucide-react';

const getSuggestionItems = ({ query }: { query: string }) => {
    return [
        {
            title: 'Text',
            description: 'Just start writing with plain text.',
            icon: Type,
            command: ({ editor, range }: any) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .toggleNode('paragraph', 'paragraph')
                    .run();
            },
        },
        {
            title: 'Heading 1',
            description: 'Big section heading.',
            icon: Heading1,
            command: ({ editor, range }: any) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setNode('heading', { level: 1 })
                    .run();
            },
        },
        {
            title: 'Heading 2',
            description: 'Medium section heading.',
            icon: Heading2,
            command: ({ editor, range }: any) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setNode('heading', { level: 2 })
                    .run();
            },
        },
        {
            title: 'Heading 3',
            description: 'Small section heading.',
            icon: Heading3,
            command: ({ editor, range }: any) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setNode('heading', { level: 3 })
                    .run();
            },
        },
        {
            title: 'Bullet List',
            description: 'Create a simple bullet list.',
            icon: List,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run();
            },
        },
        {
            title: 'Ordered List',
            description: 'Create a numbered list.',
            icon: ListOrdered,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run();
            },
        },
        {
            title: 'Quote',
            description: 'Capture a quote.',
            icon: Quote,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run();
            },
        },
        {
            title: 'Image',
            description: 'Upload or embed an image.',
            icon: Image,
            command: ({ editor, range }: any) => {
                const url = window.prompt('Image URL');
                if (url) {
                    editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
                }
            },
        },
        {
            title: 'Youtube',
            description: 'Embed a Youtube video.',
            icon: Youtube,
            command: ({ editor, range }: any) => {
                const url = window.prompt('YouTube URL');
                if (url) {
                    editor.chain().focus().deleteRange(range).setYoutubeVideo({ src: url }).run();
                }
            },
        },
        {
            title: 'Chart',
            description: 'Insert a data visualization.',
            icon: BarChart,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).insertContent({ type: 'chart' }).run();
            },
        },
        {
            title: 'Simulation',
            description: 'Insert an interactive lab.',
            icon: Cpu,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).insertContent({ type: 'simulation' }).run();
            },
        },
        {
            title: 'Split Layout (50/50)',
            description: 'Equal width columns.',
            icon: Layout,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).insertContent({
                    type: 'layoutSection',
                    attrs: { variant: 'split' },
                    content: [
                        { type: 'layoutColumn', content: [{ type: 'paragraph' }] },
                        { type: 'layoutColumn', content: [{ type: 'paragraph' }] },
                    ]
                }).run();
            },
        },
        {
            title: 'Aside Layout (70/30)',
            description: 'Main content with sidebar.',
            icon: Layout,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).insertContent({
                    type: 'layoutSection',
                    attrs: { variant: 'aside' }, // We need to ensure 'aside' variant is handled or use css grid classes for it
                    content: [
                        { type: 'layoutColumn', content: [{ type: 'paragraph' }] },
                        { type: 'layoutColumn', content: [{ type: 'paragraph' }] },
                    ]
                }).run();
            },
        },
        {
            title: 'Showcase Layout',
            description: 'Text left, Media right.',
            icon: Layout,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).insertContent({
                    type: 'layoutSection',
                    attrs: { variant: 'split' },
                    content: [
                        { type: 'layoutColumn', content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Feature Title' }] }, { type: 'paragraph', content: [{ type: 'text', text: 'Description of the feature goes here.' }] }] },
                        { type: 'layoutColumn', content: [{ type: 'paragraph' }] }, // Placeholder for media
                    ]
                }).run();
            },
        },
        {
            title: 'Code Block',
            description: 'Insert a Mac-style terminal code block.',
            icon: Code,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
            },
        },
        {
            title: 'Python Playground',
            description: 'Insert an interactive Python runner.',
            icon: SquareTerminal,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).insertContent({ type: 'pythonPlayground' }).run();
            },
        },
        {
            title: 'Math Formula',
            description: 'Insert a LaTeX equation.',
            icon: Sigma,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).insertContent({ type: 'math' }).run();
            },
        }
    ].filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
};

export const SlashCommand = Extension.create({
    name: 'slashCommand',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }: any) => {
                    props.command({ editor, range });
                },
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});

export const suggestionOptions = {
    items: getSuggestionItems,
    render: () => {
        let component: any;
        let popup: any;

        return {
            onStart: (props: any) => {
                component = new ReactRenderer(CommandList, {
                    props,
                    editor: props.editor,
                });

                if (!props.clientRect) {
                    return;
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                });
            },

            onUpdate(props: any) {
                component.updateProps(props);

                if (!props.clientRect) {
                    return;
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                });
            },

            onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                    popup[0].hide();
                    return true;
                }

                return component.ref?.onKeyDown(props);
            },

            onExit() {
                popup[0].destroy();
                component.destroy();
            },
        };
    },
};
