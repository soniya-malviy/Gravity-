import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useAppStore } from '../store/appStore';
import { HeatmapToolbar } from './HeatmapToolbar';
import { ContextMenu } from './ContextMenu';
import { Search, Info, Copy, Flag } from 'lucide-react';

const CELL_SIZE = 16;
const CELL_GAP = 2;
const MARGIN = { top: 140, right: 60, bottom: 60, left: 180 };

export const Heatmap: React.FC<{ hideToolbar?: boolean }> = ({ hideToolbar }) => {
  const { sourceData, selectedApis, displayMode, selectedCell, selectCell, comparisonMode, activeFilters } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = React.useState<{ x: number, y: number, data: any } | null>(null);

  useEffect(() => {
    if (!canvasRef.current || selectedApis.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const dataList = selectedApis.map(api => sourceData[api.id]).filter(Boolean);
    if (dataList.length === 0) return;

    const data = dataList[0];
    if (!data.densityMatrix) return;

    let { rows, fieldNames } = data.densityMatrix;

    // --- FILTER ENGINE ---
    if (activeFilters) {
      // 1. Filter Columns
      if (activeFilters.fields?.length > 0) {
        const selectedIndices = fieldNames.map((name, idx) => activeFilters.fields.includes(name) ? idx : -1).filter(i => i !== -1);
        fieldNames = fieldNames.filter((_, idx) => selectedIndices.includes(idx));
        rows = rows.map(row => row.filter((_, idx) => selectedIndices.includes(idx)));
      }

      // 2. Filter Rows by Completeness
      if (activeFilters.minCompleteness > 0) {
        rows = rows.filter(row => {
          const avgComp = row.reduce((acc, c) => acc + c.completeness, 0) / row.length;
          return avgComp >= activeFilters.minCompleteness;
        });
      }
    }

    const numRows = rows.length;
    const numCols = fieldNames.length;

    const dpr = window.devicePixelRatio || 1;
    canvasRef.current.width = (numCols * CELL_SIZE + MARGIN.left + MARGIN.right) * dpr;
    canvasRef.current.height = (numRows * CELL_SIZE + MARGIN.top + MARGIN.bottom) * dpr;
    canvasRef.current.style.width = `${numCols * CELL_SIZE + MARGIN.left + MARGIN.right}px`;
    canvasRef.current.style.height = `${numRows * CELL_SIZE + MARGIN.top + MARGIN.bottom}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw Column Headers
    ctx.font = '900 10px "Outfit", sans-serif';
    ctx.textBaseline = 'middle';
    fieldNames.forEach((name, i) => {
      ctx.save();
      ctx.translate(i * CELL_SIZE + MARGIN.left + CELL_SIZE / 2, MARGIN.top - 15);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(name.length > 20 ? name.substring(0, 17) + '...' : name.toUpperCase(), 0, 0);
      ctx.restore();
    });

    // Draw Row Headers
    ctx.textAlign = 'right';
    rows.forEach((_, i) => {
      if (i % 5 === 0) {
        ctx.fillStyle = '#475569';
        ctx.font = '800 9px "JetBrains Mono", monospace';
        ctx.fillText(`IDX ${i.toString().padStart(3, '0')}`, MARGIN.left - 20, i * CELL_SIZE + MARGIN.top + CELL_SIZE / 2);
      }
    });

    // Draw Cells
    rows.forEach((row, i) => {
      row.forEach((cell, j) => {
        let color = '#1e293b';
        let glow = false;
        
        if (displayMode === 'density') {
          color = cell.isComplete ? `rgba(99, 102, 241, ${0.1 + (cell.completeness / 100) * 0.9})` : '#0f172a';
          glow = cell.isComplete && cell.completeness > 90;
        } else if (displayMode === 'cluster') {
          const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];
          color = cell.isComplete ? colors[cell.cluster % colors.length] : '#0f172a';
        } else if (displayMode === 'type') {
          const typeColors: Record<string, string> = { string: '#38bdf8', number: '#fbbf24', boolean: '#f472b6', object: '#a78bfa' };
          color = cell.isComplete ? (typeColors[cell.type] || '#6366f1') : '#0f172a';
        } else if (displayMode === 'anomaly') {
          color = cell.isAnomaly ? '#f43f5e' : (cell.isComplete ? '#1e293b' : '#020617');
          glow = cell.isAnomaly;
        }

        const x = j * CELL_SIZE + MARGIN.left;
        const y = i * CELL_SIZE + MARGIN.top;
        const size = CELL_SIZE - CELL_GAP;

        if (glow) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = color;
        // Rounded rectangle
        const radius = 3;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + size - radius, y);
        ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
        ctx.lineTo(x + size, y + size - radius);
        ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
        ctx.lineTo(x + radius, y + size);
        ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        // Selected indicator
        if (selectedCell && selectedCell.apiId === data.apiId && selectedCell.row === i && selectedCell.col === fieldNames[j]) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#fff';
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        
        ctx.shadowBlur = 0;
      });
    });

  }, [sourceData, selectedApis, displayMode, selectedCell, comparisonMode, activeFilters]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || selectedApis.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - MARGIN.left;
    const y = e.clientY - rect.top - MARGIN.top;

    const colIdx = Math.floor(x / CELL_SIZE);
    const rowIdx = Math.floor(y / CELL_SIZE);

    const api = selectedApis[0];
    const data = sourceData[api.id];
    const matrixData = data?.densityMatrix;
    if (matrixData && rowIdx >= 0 && rowIdx < matrixData.rows.length && colIdx >= 0 && colIdx < matrixData.fieldNames.length) {
      selectCell(api.id, rowIdx, matrixData.fieldNames[colIdx]);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canvasRef.current || selectedApis.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - MARGIN.left;
    const y = e.clientY - rect.top - MARGIN.top;

    const colIdx = Math.floor(x / CELL_SIZE);
    const rowIdx = Math.floor(y / CELL_SIZE);

    const api = selectedApis[0];
    const data = sourceData[api.id];
    const matrixData = data?.densityMatrix;
    
    if (matrixData && rowIdx >= 0 && rowIdx < matrixData.rows.length && colIdx >= 0 && colIdx < matrixData.fieldNames.length) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        data: {
          apiId: api.id,
          row: rowIdx,
          col: matrixData.fieldNames[colIdx],
          value: data.rawData[rowIdx][matrixData.fieldNames[colIdx]]
        }
      });
    }
  };

  if (selectedApis.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-8 p-20">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
          <div className="relative p-12 bg-slate-900/50 rounded-[4rem] border border-white/5 backdrop-blur-3xl animate-pulse">
            <Search className="w-20 h-20 text-indigo-400/50" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-white tracking-tighter uppercase">No Dataset Active</h3>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Initialize a source to begin telemetry</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#020617] relative" ref={containerRef}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b,transparent)] pointer-events-none" />
      
      {!hideToolbar && <HeatmapToolbar />}
      
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <div className="p-12 inline-block min-w-full min-h-full">
           <canvas 
            ref={canvasRef} 
            onClick={handleCanvasClick} 
            onContextMenu={handleContextMenu} 
            className="cursor-crosshair rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[#030712] border border-white/5" 
          />
        </div>
        
        {contextMenu && (
          <ContextMenu 
            x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)}
            items={[
              { label: 'Deep Inspect Field', icon: <Info className="w-4 h-4" />, onClick: () => console.log('Inspect', contextMenu.data) },
              { label: 'Copy Unique ID', icon: <Copy className="w-4 h-4" />, onClick: () => console.log('Copy') },
              { label: 'Flag Anomaly', icon: <Flag className="w-4 h-4 text-orange-400" />, onClick: () => console.log('Flag') },
            ]}
          />
        )}
      </div>
    </div>
  );
};
