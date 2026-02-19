import React, { useEffect, useRef, useState } from "react";
import './GraphView.css';
import * as d3 from "d3";

function GraphView({ graph, suspicious = [], onNodeClick }) {
  const svgRef = useRef();
  const simulationRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const [activeRing, setActiveRing] = useState(null);

  useEffect(() => {
    if (!graph || !graph.nodes) return;

    const svgElement = svgRef.current;
    if (!svgElement) return;

    function draw() {
      const width = svgElement.clientWidth || 800;
      const height = 600;

      if (simulationRef.current) {
        try { simulationRef.current.stop(); } catch (e) {}
        simulationRef.current = null;
      }

      const svg = d3.select(svgElement);
      svg.selectAll("*").remove();

      svg.attr("viewBox", null)
         .attr("width", width)
         .attr("height", height);

      graph.nodes.forEach(n => {
        if (n.x == null || n.y == null) {
          n.x = width / 2 + (Math.random() - 0.5) * 120;
          n.y = height / 2 + (Math.random() - 0.5) * 120;
        }
      });

      const simulation = d3
        .forceSimulation(graph.nodes)
        .force(
          "link",
          d3.forceLink(graph.edges)
            .id(d => d.id)
            .distance(130)
            .strength(0.8)
        )
        .force("charge", d3.forceManyBody().strength(-250))
        .force("collision", d3.forceCollide().radius(30))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .alphaDecay(0.05);

      simulationRef.current = simulation;
      simulation.alpha(1).restart();

      const link = svg
        .append("g")
        .selectAll("line")
        .data(graph.edges)
        .enter()
        .append("line")
        .attr("stroke", "#334155")
        .attr("stroke-width", 1.5);

      const node = svg
        .append("g")
        .selectAll("circle")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr("r", 15)
        .attr("fill", d =>
          suspicious.find(s => s.account_id === d.id)
            ? "#ff4d4d"
            : "#00f5c4"
        )
        .attr("stroke", "#0f172a")
        .attr("stroke-width", 2)
        .attr("class", d => suspicious.find(s => s.account_id === d.id) ? "suspicious-node" : "")
        .style("cursor", "pointer")
        .call(
          d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        )
        .on("click", (event, d) => {
          const found = suspicious.find(s => s.account_id === d.id);
          let nodeDetails = null;
          if (found) {
            setActiveRing(found.ring_id);
            nodeDetails = found;
          } else {
            setActiveRing(null);
            nodeDetails = {
              account_id: d.id,
              suspicion_score: null,
              detected_patterns: [],
              ring_id: null,
              is_legit: true
            };
          }
          if (onNodeClick) onNodeClick(nodeDetails);
        })
        .on("mouseover", function(event, d) {
          const found = suspicious.find(s => s.account_id === d.id);
          let html = `<div><strong>Account:</strong> ${d.id}</div>`;
          if (found) {
            html += `<div><strong>Risk:</strong> ${found.suspicion_score}</div>`;
            html += `<div><strong>Patterns:</strong> ${found.detected_patterns.join(', ')}</div>`;
          }
          showTooltip(html, event.pageX, event.pageY);
        })
        .on("mouseout", function() {
          hideTooltip();
        });

      // Tooltip helpers
      function showTooltip(html, x, y) {
        let tooltip = document.getElementById('graph-tooltip');
        if (!tooltip) {
          tooltip = document.createElement('div');
          tooltip.id = 'graph-tooltip';
          tooltip.className = 'graph-tooltip';
          document.body.appendChild(tooltip);
        }
        tooltip.innerHTML = html;
        tooltip.style.display = 'block';
        tooltip.style.left = (x + 12) + 'px';
        tooltip.style.top = (y - 24) + 'px';
      }
      function hideTooltip() {
        const tooltip = document.getElementById('graph-tooltip');
        if (tooltip) tooltip.style.display = 'none';
      }

      const label = svg
        .append("g")
        .selectAll("text")
        .data(graph.nodes)
        .enter()
        .append("text")
        .text(d => d.id)
        .attr("font-size", "11px")
        .attr("fill", "#cbd5e1");

      simulation.on("tick", () => {
        link
          .attr("x1", d => clamp(d.source.x, 20, width - 20))
          .attr("y1", d => clamp(d.source.y, 20, height - 20))
          .attr("x2", d => clamp(d.target.x, 20, width - 20))
          .attr("y2", d => clamp(d.target.y, 20, height - 20));

        node
          .attr("cx", d => d.x = clamp(d.x, 20, width - 20))
          .attr("cy", d => d.y = clamp(d.y, 20, height - 20));

        label
          .attr("x", d => d.x + 18)
          .attr("y", d => d.y + 4);
      });

      // === RING HIGHLIGHT LOGIC ===
      if (activeRing) {
        const ringMembers = suspicious
          .filter(s => s.ring_id === activeRing)
          .map(s => s.account_id);

        node
          .transition()
          .duration(300)
          .attr("opacity", d =>
            ringMembers.includes(d.id) ? 1 : 0.15
          )
          .attr("stroke", d =>
            ringMembers.includes(d.id) ? "#ffffff" : "#0f172a"
          )
          .attr("stroke-width", d =>
            ringMembers.includes(d.id) ? 3 : 1
          );

        link
          .transition()
          .duration(300)
          .attr("opacity", d =>
            ringMembers.includes(d.source.id) &&
            ringMembers.includes(d.target.id)
              ? 1
              : 0.1
          )
          .attr("stroke-width", d =>
            ringMembers.includes(d.source.id) &&
            ringMembers.includes(d.target.id)
              ? 3
              : 1
          );
      }

      setTimeout(() => {
        try { simulation.stop(); } catch (e) {}
      }, 2500);

      function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
      }

      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
    }

    draw();

    const ro = new ResizeObserver(() => draw());
    resizeObserverRef.current = ro;
    if (svgElement.parentElement) ro.observe(svgElement.parentElement);

    const onWin = () => draw();
    window.addEventListener("resize", onWin);

    return () => {
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      window.removeEventListener("resize", onWin);
      if (simulationRef.current) simulationRef.current.stop();
    };

  }, [graph, suspicious, activeRing, onNodeClick]);

  if (!graph || !graph.nodes) {
    return (
      <div style={{ textAlign: "center", padding: "60px", opacity: 0.4 }}>
        Fraud network graph will appear here after analysis.
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="600"
    />
  );
}

export default GraphView;
