import { NodeViewWrapper } from '@tiptap/react';
import { Settings, Cpu } from 'lucide-react';
import { SIMULATION_REGISTRY } from '@/components/cms/SimulationRegistry';

export default function SimulationNodeView(props: any) {
    const { component } = props.node.attrs;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        props.updateAttributes({
            component: e.target.value
        });
    };

    const currentSim = SIMULATION_REGISTRY.find(s => s.id === component) || SIMULATION_REGISTRY[0];

    return (
        <NodeViewWrapper className="my-8 relative group select-none">

            {/* EDITOR CONTROLS (Only visible in editor) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-ink text-paper px-4 py-1.5 rounded-full flex items-center gap-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                    <Settings className="w-3 h-3 text-white/60" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">Simulator:</span>
                </div>
                <select
                    value={component}
                    onChange={handleChange}
                    className="bg-transparent text-xs font-mono text-white outline-none cursor-pointer hover:text-accent transition-colors"
                >
                    {SIMULATION_REGISTRY.map(sim => (
                        <option key={sim.id} value={sim.id} className="text-black">
                            {sim.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* PREVIEW CARD */}
            <div className={`p-8 rounded-xl border-2 border-dashed transition-all duration-300 ${props.selected ? 'border-accent bg-accent/5' : 'border-ink/10 bg-paper'}`}>
                <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
                    <div className="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center text-ink/40">
                        <Cpu className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-ink mb-1">{currentSim.label}</h3>
                        <p className="font-mono text-xs text-ink/40 uppercase tracking-widest">Interactive Simulation Module</p>
                    </div>
                    <div className="text-xs text-ink/30 italic max-w-sm">
                        This block will render the full "{currentSim.id}" interactive component on the live site.
                    </div>
                </div>
            </div>

        </NodeViewWrapper>
    );
}
