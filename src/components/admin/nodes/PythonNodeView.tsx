import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import PythonPlayground from '@/components/lab/PythonPlayground';

export const PythonNodeView = (props: NodeViewProps) => {
    const { code } = props.node.attrs;

    const handleChange = (newCode: string) => {
        props.updateAttributes({
            code: newCode
        });
    };

    return (
        <NodeViewWrapper className="not-prose my-12">
            {/* The wrapper handles the selection/focus ring */}
            <div className={props.selected ? "ring-2 ring-accent/50 rounded-xl" : ""}>
                <PythonPlayground
                    initialCode={code}
                    onChange={handleChange}
                />
            </div>
        </NodeViewWrapper>
    );
};
