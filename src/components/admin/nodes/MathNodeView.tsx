import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export const MathNodeView = (props: NodeViewProps) => {
    const { latex } = props.node.attrs;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.updateAttributes({
            latex: e.target.value
        });
    };

    return (
        <NodeViewWrapper className="not-prose my-12 flex flex-col items-center">
            {/* Visual Representation */}
            <div className={`p-4 rounded-xl transition-all ${props.selected ? 'ring-2 ring-accent/50 bg-accent/5' : ''}`}>
                <div className="text-2xl text-ink font-serif">
                    <Latex>{`$${latex}$`}</Latex>
                </div>
            </div>

            {/* Editor (Only visible when selected) */}
            <div className={`mt-2 transition-opacity duration-200 ${props.selected ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                <input
                    type="text"
                    value={latex}
                    onChange={handleChange}
                    className="bg-paper border border-ink/20 rounded-md px-3 py-1 text-sm font-mono text-ink/80 focus:outline-none focus:border-accent w-64 text-center"
                    placeholder="Enter LaTeX..."
                />
            </div>
        </NodeViewWrapper>
    );
};
