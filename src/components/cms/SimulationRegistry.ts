// Defines the available simulations for the CMS
export const SIMULATION_REGISTRY = [
    { id: 'BetaShaper', label: 'Beta Distribution Shaper', category: 'Probability' },
    { id: 'PowerAnalysis', label: 'Statistical Power Demo', category: 'Inference' },
    { id: 'MSERace', label: 'MSE Race (Bias-Variance)', category: 'Estimation' },
    { id: 'ReservoirSimulation', label: 'Reservoir Sampling', category: 'Algorithms' },
    { id: 'AlphaOptimizer', label: 'Alpha Optimization', category: 'Lab Alpha' },
    { id: 'GammaPlayground', label: 'Gamma Distribution Playground', category: 'Estimation' },
    { id: 'ConsistencySimulator', label: 'Consistency Simulator', category: 'Estimation' },
    { id: 'IntervalAnalysis', label: 'Confidence Interval Analysis', category: 'Estimation' },
    { id: 'DistributionGraph', label: 'Distribution Graph', category: 'Inference' },
    { id: 'PValueDistribution', label: 'P-Value Distribution', category: 'Inference' },
    { id: 'HackSimulation', label: 'P-Hacking Simulator', category: 'Inference' },
];

export type SimulationId = typeof SIMULATION_REGISTRY[number]['id'];
