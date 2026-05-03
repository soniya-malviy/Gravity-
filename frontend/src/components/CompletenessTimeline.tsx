import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useAppStore, type Snapshot } from '../store/appStore';
import { TrendingUp, Activity } from 'lucide-react';

const MARGIN = { top: 40, right: 120, bottom: 40, left: 60 };
const HEIGHT = 400;

export const CompletenessTimeline: React.FC = () => {
  const { snapshots, selectedApis } = useAppStore();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || selectedApis.length === 0) return;

    const currentApi = selectedApis[0];
    const apiSnapshots = snapshots[currentApi.id] || [];
    if (apiSnapshots.length < 2) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.parentElement?.clientWidth || 800;
    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

    const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const fields = Array.from(new Set(apiSnapshots.flatMap(s => Object.keys(s.fieldCompleteness))));
    
    const x = d3.scaleTime()
      .domain(d3.extent(apiSnapshots, d => new Date(d.timestamp)) as [Date, Date])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    const color = d3.scaleOrdinal(d3.schemeTableau10).domain(fields);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5))
      .attr('class', 'text-[10px] text-slate-500 font-mono');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'))
      .attr('class', 'text-[10px] text-slate-500 font-mono');

    fields.forEach(field => {
      const line = d3.line<Snapshot>()
        .x(d => x(new Date(d.timestamp)))
        .y(d => y(d.fieldCompleteness[field] || 0));

      g.append('path')
        .datum(apiSnapshots)
        .attr('fill', 'none')
        .attr('stroke', color(field))
        .attr('stroke-width', 2)
        .attr('d', line as any)
        .attr('class', 'transition-all duration-500 hover:stroke-white cursor-pointer')
        .append('title')
        .text(field);
        
      const lastSnapshot = apiSnapshots[apiSnapshots.length - 1];
      g.append('text')
        .attr('x', innerWidth + 5)
        .attr('y', y(lastSnapshot.fieldCompleteness[field] || 0))
        .attr('fill', color(field))
        .attr('class', 'text-[9px] font-black uppercase tracking-widest')
        .attr('alignment-baseline', 'middle')
        .text(field.length > 10 ? field.substring(0, 10) + '...' : field);
    });

  }, [snapshots, selectedApis]);

  if (selectedApis.length === 0) return null;
  const currentApi = selectedApis[0];
  const apiSnapshots = snapshots[currentApi.id] || [];

  return (
    <div className="mt-8 glass p-8 rounded-[2rem] border border-white/5 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-white tracking-tighter">COMPLETENESS DRIFT</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Historical Trend Analysis</p>
        </div>
        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
        </div>
      </div>

      {apiSnapshots.length < 2 ? (
        <div className="h-[300px] flex flex-col items-center justify-center text-slate-600 gap-4">
          <Activity className="w-12 h-12 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Need at least 2 data refreshes to visualize drift</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          <svg ref={svgRef} className="w-full h-[400px]" />
        </div>
      )}
    </div>
  );
};
