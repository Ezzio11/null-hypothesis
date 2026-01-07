import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, LineChart, Line, ComposedChart, Scatter
} from 'recharts';
import { Settings, BarChart as BarIcon, Activity, TrendingUp, ScatterChart as ScatterIcon, Sigma } from 'lucide-react';

export default function ChartNodeView(props: NodeViewProps) {
    const { node, updateAttributes } = props;
    const { chartType, data, config } = node.attrs;

    const [isEditing, setIsEditing] = useState(false);
    const [jsonInput, setJsonInput] = useState(JSON.stringify(data, null, 2));
    const [jsonError, setJsonError] = useState<string | null>(null);

    // Update local state when node attributes change externally (undo/redo)
    useEffect(() => {
        setJsonInput(JSON.stringify(data, null, 2));
    }, [data]);

    const handleJsonChange = (val: string) => {
        setJsonInput(val);
        try {
            const parsed = JSON.parse(val);
            setJsonError(null);
            updateAttributes({ data: parsed });
        } catch (e) {
            setJsonError("Invalid JSON");
        }
    };

    const renderChart = () => {
        const CommonProps = { data, margin: { top: 10, right: 30, left: 0, bottom: 0 } };
        const Grid = <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ink)" strokeOpacity={0.1} />;
        const Axes = (
            <>
                <XAxis dataKey={config.xAxisKey} stroke="var(--color-ink)" strokeOpacity={0.5} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                <YAxis stroke="var(--color-ink)" strokeOpacity={0.5} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-paper)', border: '1px solid var(--color-ink)', opacity: 0.9, fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                    itemStyle={{ color: 'var(--color-ink)' }}
                />
            </>
        );

        if (chartType === 'distribution') {
            return (
                <ComposedChart {...CommonProps}>
                    {Grid}
                    {Axes}
                    {/* Histogram (Bar) */}
                    <Bar dataKey="frequency" barSize={20} fill="var(--color-ink)" opacity={0.2} />
                    {/* Curve (Line/Area) */}
                    <Line type="monotone" dataKey="curve" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                    {/* Mean Line (Reference equivalent or just a Scatter point) */}
                </ComposedChart>
            );
        }

        if (chartType === 'scatter') {
            return (
                <ComposedChart {...CommonProps}>
                    {Grid}
                    {Axes}
                    <Scatter name="Data" dataKey={config.dataKeys[0]} fill="var(--color-accent)" />
                </ComposedChart>
            );
        }

        const ChartComponent = chartType === 'bar' ? BarChart : chartType === 'line' ? LineChart : AreaChart;
        const DataComponent = (chartType === 'bar' ? Bar : chartType === 'line' ? Line : Area) as any;

        return (
            // @ts-ignore
            <ChartComponent {...CommonProps}>
                {Grid}
                {Axes}
                {config.dataKeys.map((key: string, i: number) => (
                    <DataComponent
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={config.colors[i % config.colors.length]}
                        fill={config.colors[i % config.colors.length]}
                        fillOpacity={0.2}
                    />
                ))}
            </ChartComponent>
        );
    };

    // Pre-fill distribution data
    const setDistributionData = () => {
        const distData = Array.from({ length: 20 }, (_, i) => {
            const x = i - 10;
            return {
                x: x,
                frequency: Math.exp(-(x * x) / 20) * 10, // Bell curve shape
                curve: Math.exp(-(x * x) / 20) * 10
            };
        });
        updateAttributes({
            chartType: 'distribution',
            data: distData,
            config: { ...config, xAxisKey: 'x', dataKeys: ['frequency', 'curve'] }
        });
    };

    return (
        <NodeViewWrapper className="my-8 relative group">
            <div className="border border-ink/10 rounded-sm bg-paper p-6 relative min-h-[300px] hover:border-ink/30 transition-colors">

                {/* Overlay Controls */}
                <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => updateAttributes({ chartType: 'area' })} title="Area Chart" className={`p-2 rounded-sm border ${chartType === 'area' ? 'bg-ink text-paper border-ink' : 'bg-paper text-ink border-ink/10'}`}>
                        <TrendingUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => updateAttributes({ chartType: 'bar' })} title="Bar Chart" className={`p-2 rounded-sm border ${chartType === 'bar' ? 'bg-ink text-paper border-ink' : 'bg-paper text-ink border-ink/10'}`}>
                        <BarIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => updateAttributes({ chartType: 'line' })} title="Line Chart" className={`p-2 rounded-sm border ${chartType === 'line' ? 'bg-ink text-paper border-ink' : 'bg-paper text-ink border-ink/10'}`}>
                        <Activity className="w-4 h-4" />
                    </button>
                    {/* Scientific Types */}
                    <button onClick={setDistributionData} title="Distribution (Gaussian)" className={`p-2 rounded-sm border ${chartType === 'distribution' ? 'bg-ink text-paper border-ink' : 'bg-paper text-ink border-ink/10'}`}>
                        <Sigma className="w-4 h-4" />
                    </button>

                    <button onClick={() => setIsEditing(!isEditing)} className="p-2 rounded-sm bg-paper text-ink border border-ink/10 hover:border-accent hover:text-accent">
                        <Settings className="w-4 h-4" />
                    </button>
                </div>

                <div className="h-[300px] w-full font-sans text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Editor Panel */}
            {isEditing && (
                <div className="mt-4 p-4 bg-ink/5 border border-ink/10 rounded-sm font-mono text-xs">
                    <div className="mb-2 flex justify-between">
                        <span className="uppercase tracking-widest text-ink/50">Data JSON</span>
                        {jsonError && <span className="text-red-500">{jsonError}</span>}
                    </div>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => handleJsonChange(e.target.value)}
                        className="w-full h-48 bg-transparent border border-ink/20 p-2 focus:outline-none focus:border-accent resize-y"
                    />
                    <div className="mt-4">
                        <span className="uppercase tracking-widest text-ink/50 block mb-2">Axes Config</span>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-ink/40 mb-1">X Axis Key</label>
                                <input
                                    value={config.xAxisKey}
                                    onChange={(e) => updateAttributes({ config: { ...config, xAxisKey: e.target.value } })}
                                    className="w-full bg-transparent border border-ink/20 p-1"
                                />
                            </div>
                            <div>
                                <label className="block text-ink/40 mb-1">Data Key(s)</label>
                                <input
                                    value={config.dataKeys.join(',')}
                                    onChange={(e) => updateAttributes({ config: { ...config, dataKeys: e.target.value.split(','), colors: config.colors } })}
                                    className="w-full bg-transparent border border-ink/20 p-1"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </NodeViewWrapper>
    );
}
