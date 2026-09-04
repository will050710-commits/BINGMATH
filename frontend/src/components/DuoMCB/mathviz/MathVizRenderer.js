'use client';
import dynamic from 'next/dynamic';

const MathVizFunctionPlot = dynamic(() => import('./MathVizFunctionPlot'), { ssr: false });
const MathVizUnitCircleWave = dynamic(() => import('./MathVizUnitCircleWave'), { ssr: false });
const MathVizGeometry2D = dynamic(() => import('./MathVizGeometry2D'), { ssr: false });
const MathVizGeometry3D = dynamic(() => import('./MathVizGeometry3D'), { ssr: false });
const MathVizInequalityRegion = dynamic(() => import('./MathVizInequalityRegion'), { ssr: false });
const MathVizVennSets = dynamic(() => import('./MathVizVennSets'), { ssr: false });
const MathVizSequenceSeries = dynamic(() => import('./MathVizSequenceSeries'), { ssr: false });
const MathVizComplexPlane = dynamic(() => import('./MathVizComplexPlane'), { ssr: false });
const MathVizDistribution = dynamic(() => import('./MathVizDistribution'), { ssr: false });

export default function MathVizRenderer({ data }) {
  if (!data || data.type !== 'mathviz.v1') return null;

  switch (data.widget) {
    case 'function_plot':
      return <MathVizFunctionPlot data={data} />;
    case 'unit_circle_wave':
      return <MathVizUnitCircleWave data={data} />;
    case 'geometry_2d':
      return <MathVizGeometry2D data={data} />;
    case 'geometry_3d':
      return <MathVizGeometry3D data={data} />;
    case 'inequality_region':
      return <MathVizInequalityRegion data={data} />;
    case 'venn_sets':
      return <MathVizVennSets data={data} />;
    case 'sequence_series':
      return <MathVizSequenceSeries data={data} />;
    case 'complex_plane':
      return <MathVizComplexPlane data={data} />;
    case 'distribution':
      return <MathVizDistribution data={data} />;
    default:
      return null;
  }
}
