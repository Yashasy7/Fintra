import React, { useEffect, useRef, useState, useCallback } from "react";
import './GraphView.css';

// Performance thresholds
const MAX_NODES_FOR_FULL_RENDER = 500;
const MAX_NODES_FOR_LABELS = 100;
const SAMPLE_PERCENTAGE = 0.05; // 5% of normal nodes when sampling

function GraphView({ graph, suspicious = [], onNodeClick }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [activeRing, setActiveRing] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: null });
  
  // Transform state for pan/zoom
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  
  // Processed graph data
  const processedDataRef = useRef({ nodes: [], edges: [], positions: {} });
  const suspiciousSetRef = useRef(new Set());

  // Sample and process graph data for performance
  const processGraphData = useCallback((graph, suspicious) => {
    if (!graph || !graph.nodes) return { nodes: [], edges: [], positions: {} };

    const suspiciousIds = new Set(suspicious.map(s => s.account_id));
    suspiciousSetRef.current = suspiciousIds;
    
    let nodesToRender = [];
    let nodeIdSet = new Set();

    // Always include all suspicious accounts
    graph.nodes.forEach(node => {
      if (suspiciousIds.has(node.id)) {
        nodesToRender.push({ ...node, isSuspicious: true });
        nodeIdSet.add(node.id);
      }
    });

    // If total nodes exceed threshold, sample normal nodes
    const normalNodes = graph.nodes.filter(n => !suspiciousIds.has(n.id));
    
    if (graph.nodes.length > MAX_NODES_FOR_FULL_RENDER) {
      // Sample a percentage of normal nodes
      const sampleSize = Math.min(
        Math.ceil(normalNodes.length * SAMPLE_PERCENTAGE),
        MAX_NODES_FOR_FULL_RENDER - nodesToRender.length
      );
      
      // Prioritize nodes that have edges to suspicious accounts
      const edgeConnectedNodes = new Set();
      graph.edges.forEach(edge => {
        if (suspiciousIds.has(edge.source) || suspiciousIds.has(edge.target)) {
          edgeConnectedNodes.add(edge.source);
          edgeConnectedNodes.add(edge.target);
        }
      });

      // Add connected normal nodes first
      normalNodes.forEach(node => {
        if (edgeConnectedNodes.has(node.id) && !nodeIdSet.has(node.id) && nodesToRender.length < MAX_NODES_FOR_FULL_RENDER) {
          nodesToRender.push({ ...node, isSuspicious: false });
          nodeIdSet.add(node.id);
        }
      });

      // Fill remaining with random sample
      const remainingNormal = normalNodes.filter(n => !nodeIdSet.has(n.id));
      const shuffled = remainingNormal.sort(() => Math.random() - 0.5);
      const remaining = Math.max(0, sampleSize - (nodesToRender.length - suspicious.length));
      
      shuffled.slice(0, remaining).forEach(node => {
        nodesToRender.push({ ...node, isSuspicious: false });
        nodeIdSet.add(node.id);
      });
    } else {
      // Include all nodes if under threshold
      normalNodes.forEach(node => {
        nodesToRender.push({ ...node, isSuspicious: false });
        nodeIdSet.add(node.id);
      });
    }

    // Filter edges to only include rendered nodes
    const edgesToRender = graph.edges.filter(
      edge => nodeIdSet.has(edge.source) && nodeIdSet.has(edge.target)
    );

    // Compute positions using a fast grid-based layout
    const positions = computeFastLayout(nodesToRender, edgesToRender, suspiciousIds, 800, 600);

    return { nodes: nodesToRender, edges: edgesToRender, positions };
  }, []);

  // Fast layout algorithm - cluster suspicious nodes, spread others
  function computeFastLayout(nodes, edges, suspiciousIds, width, height) {
    const positions = {};
    const padding = 60;
    const availWidth = width - 2 * padding;
    const availHeight = height - 2 * padding;

    // Separate suspicious and normal nodes
    const suspiciousNodes = nodes.filter(n => suspiciousIds.has(n.id));
    const normalNodes = nodes.filter(n => !suspiciousIds.has(n.id));

    // Place suspicious nodes in center cluster
    const suspiciousCount = suspiciousNodes.length;
    const suspiciousRadius = Math.min(availWidth, availHeight) * 0.3;
    
    suspiciousNodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / Math.max(suspiciousCount, 1);
      const r = suspiciousRadius * (0.3 + Math.random() * 0.7);
      positions[node.id] = {
        x: width / 2 + r * Math.cos(angle),
        y: height / 2 + r * Math.sin(angle)
      };
    });

    // Place normal nodes in outer ring
    const normalCount = normalNodes.length;
    const outerRadius = Math.min(availWidth, availHeight) * 0.45;
    
    normalNodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / Math.max(normalCount, 1);
      const r = outerRadius + Math.random() * 30;
      positions[node.id] = {
        x: width / 2 + r * Math.cos(angle),
        y: height / 2 + r * Math.sin(angle)
      };
    });

    return positions;
  }

  // Process data when graph changes
  useEffect(() => {
    if (!graph || !graph.nodes) return;
    
    const processed = processGraphData(graph, suspicious);
    processedDataRef.current = processed;
    
    // Reset transform for new data
    setTransform({ x: 0, y: 0, scale: 1 });
  }, [graph, suspicious, processGraphData]);

  // ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Draw on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;
    const { nodes, edges, positions } = processedDataRef.current;
    const { x: panX, y: panY, scale } = transform;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    if (nodes.length === 0) return;

    // Apply transform
    ctx.save();
    ctx.translate(width / 2 + panX, height / 2 + panY);
    ctx.scale(scale, scale);
    ctx.translate(-width / 2, -height / 2);

    // Get active ring members for highlighting
    const activeRingMembers = activeRing
      ? new Set(suspicious.filter(s => s.ring_id === activeRing).map(s => s.account_id))
      : null;

    // Draw edges
    ctx.lineWidth = 1 / scale;
    edges.forEach(edge => {
      const sourcePos = positions[edge.source];
      const targetPos = positions[edge.target];
      if (!sourcePos || !targetPos) return;

      const isHighlighted = activeRingMembers && 
        activeRingMembers.has(edge.source) && 
        activeRingMembers.has(edge.target);

      ctx.strokeStyle = isHighlighted ? '#00f5c4' : '#334155';
      ctx.globalAlpha = activeRingMembers ? (isHighlighted ? 1 : 0.1) : 0.5;
      ctx.lineWidth = isHighlighted ? 2 / scale : 1 / scale;

      ctx.beginPath();
      ctx.moveTo(sourcePos.x, sourcePos.y);
      ctx.lineTo(targetPos.x, targetPos.y);
      ctx.stroke();
    });

    ctx.globalAlpha = 1;

    // Draw nodes
    const nodeRadius = 12;
    nodes.forEach(node => {
      const pos = positions[node.id];
      if (!pos) return;

      const isSuspicious = node.isSuspicious;
      const isInActiveRing = activeRingMembers && activeRingMembers.has(node.id);
      const isHovered = hoveredNode === node.id;

      // Opacity based on ring highlight
      ctx.globalAlpha = activeRingMembers ? (isInActiveRing ? 1 : 0.15) : 1;

      // Draw node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isHovered ? nodeRadius + 3 : nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = isSuspicious ? '#ff4d4d' : '#00f5c4';
      ctx.fill();
      
      // Border
      ctx.strokeStyle = isInActiveRing ? '#ffffff' : (isHovered ? '#ffffff' : '#0f172a');
      ctx.lineWidth = (isInActiveRing || isHovered) ? 3 / scale : 2 / scale;
      ctx.stroke();
    });

    ctx.globalAlpha = 1;

    // Draw labels only if few enough nodes
    if (nodes.length <= MAX_NODES_FOR_LABELS) {
      ctx.font = `${11 / scale}px sans-serif`;
      ctx.fillStyle = '#cbd5e1';
      nodes.forEach(node => {
        const pos = positions[node.id];
        if (!pos) return;
        ctx.fillText(node.id, pos.x + nodeRadius + 4, pos.y + 4);
      });
    }

    ctx.restore();

    // Draw stats overlay
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(10, 10, 200, 60);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Showing: ${nodes.length} nodes, ${edges.length} edges`, 20, 30);
    ctx.fillText(`Zoom: ${(scale * 100).toFixed(0)}%`, 20, 48);
    if (graph && graph.nodes.length > nodes.length) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`(Sampled from ${graph.nodes.length} total)`, 20, 64);
    }

  }, [dimensions, transform, activeRing, hoveredNode, suspicious, graph]);

  // Screen to world coordinates
  const screenToWorld = useCallback((screenX, screenY) => {
    const { x: panX, y: panY, scale } = transform;
    const { width, height } = dimensions;
    const worldX = (screenX - width / 2 - panX) / scale + width / 2;
    const worldY = (screenY - height / 2 - panY) / scale + height / 2;
    return { x: worldX, y: worldY };
  }, [transform, dimensions]);

  // Find node at position
  const findNodeAt = useCallback((worldX, worldY) => {
    const { nodes, positions } = processedDataRef.current;
    const nodeRadius = 12;
    
    for (const node of nodes) {
      const pos = positions[node.id];
      if (!pos) continue;
      const dist = Math.sqrt((worldX - pos.x) ** 2 + (worldY - pos.y) ** 2);
      if (dist < nodeRadius + 5) return node;
    }
    return null;
  }, []);

  // Mouse handlers
  const handleMouseDown = (e) => {
    setIsPanning(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isPanning) {
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      setLastMouse({ x: e.clientX, y: e.clientY });
      return;
    }

    // Hover detection
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const world = screenToWorld(screenX, screenY);
    const node = findNodeAt(world.x, world.y);

    if (node) {
      setHoveredNode(node.id);
      const found = suspicious.find(s => s.account_id === node.id);
      setTooltip({
        show: true,
        x: e.clientX,
        y: e.clientY,
        content: found ? {
          id: node.id,
          risk: found.suspicion_score,
          patterns: found.detected_patterns
        } : { id: node.id, isNormal: true }
      });
    } else {
      setHoveredNode(null);
      setTooltip({ show: false, x: 0, y: 0, content: null });
    }
  };

  const handleMouseUp = () => setIsPanning(false);
  const handleMouseLeave = () => {
    setIsPanning(false);
    setTooltip({ show: false, x: 0, y: 0, content: null });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.min(Math.max(prev.scale * zoomFactor, 0.2), 5)
    }));
  };

  const handleClick = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const world = screenToWorld(screenX, screenY);
    const node = findNodeAt(world.x, world.y);

    if (node) {
      const found = suspicious.find(s => s.account_id === node.id);
      if (found) {
        setActiveRing(found.ring_id);
        if (onNodeClick) onNodeClick(found);
      } else {
        setActiveRing(null);
        if (onNodeClick) onNodeClick({
          account_id: node.id,
          suspicion_score: null,
          detected_patterns: [],
          ring_id: null,
          is_legit: true
        });
      }
    }
  };

  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  if (!graph || !graph.nodes) {
    return (
      <div style={{ textAlign: "center", padding: "60px", opacity: 0.4 }}>
        Fraud network graph will appear here after analysis.
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '600px' }}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onClick={handleClick}
        style={{
          cursor: isPanning ? 'grabbing' : 'grab',
          display: 'block'
        }}
      />
      
      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={resetView}
          style={{
            padding: '6px 12px',
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#94a3b8',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Reset View
        </button>
        {activeRing && (
          <button
            onClick={() => setActiveRing(null)}
            style={{
              padding: '6px 12px',
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#94a3b8',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear Highlight
          </button>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        fontSize: '11px',
        color: '#64748b',
        background: 'rgba(15, 23, 42, 0.8)',
        padding: '6px 10px',
        borderRadius: '4px'
      }}>
        Drag to pan • Scroll to zoom • Click node to inspect
      </div>

      {/* Tooltip */}
      {tooltip.show && tooltip.content && (
        <div
          className="graph-tooltip"
          style={{
            position: 'fixed',
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#e2e8f0',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          <div><strong>Account:</strong> {tooltip.content.id}</div>
          {tooltip.content.risk != null && (
            <div><strong>Risk:</strong> {tooltip.content.risk}</div>
          )}
          {tooltip.content.patterns && tooltip.content.patterns.length > 0 && (
            <div><strong>Patterns:</strong> {tooltip.content.patterns.join(', ')}</div>
          )}
          {tooltip.content.isNormal && (
            <div style={{ color: '#22c55e' }}>✓ Normal Account</div>
          )}
        </div>
      )}
    </div>
  );
}

export default GraphView;
