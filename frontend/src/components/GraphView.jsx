import CytoscapeComponent from "react-cytoscapejs";

export default function GraphView({ analysisData, setSelectedAccount }) {
  if (!analysisData) {
    return (
      <div style={emptyStyle}>
        Fraud network graph will appear here after analysis.
      </div>
    );
  }

  const elements = [];

  // ===== CASE 1: FULL GRAPH AVAILABLE =====
  if (analysisData.graph) {
    analysisData.graph.nodes.forEach(node => {
      const suspicious = analysisData.suspicious_accounts.find(
        acc => acc.account_id === node.id
      );

      elements.push({
        data: { id: node.id },
        classes: suspicious ? "suspicious" : ""
      });
    });

    analysisData.graph.edges.forEach(edge => {
      elements.push({
        data: {
          id: edge.source + "-" + edge.target,
          source: edge.source,
          target: edge.target
        }
      });
    });
  }

  // ===== CASE 2: FALLBACK TO FRAUD RINGS =====
  else if (analysisData.fraud_rings) {
    analysisData.fraud_rings.forEach(ring => {
      const members = ring.member_accounts;

      members.forEach(acc => {
        if (!elements.find(e => e.data?.id === acc)) {
          elements.push({
            data: { id: acc },
            classes: "suspicious"
          });
        }
      });

      for (let i = 0; i < members.length; i++) {
        elements.push({
          data: {
            id: members[i] + "-" + members[(i + 1) % members.length],
            source: members[i],
            target: members[(i + 1) % members.length]
          }
        });
      }
    });
  }

  return (
    <div style={{ height: "100%" }}>
      <CytoscapeComponent
        elements={elements}
        style={{ width: "100%", height: "100%" }}
        layout={{
          name: "cose",
          animate: true,
          fit: true,
          padding: 20
        }}
        cy={(cy) => {
          cy.on("tap", "node", function (evt) {
            const node = evt.target;
            const account = analysisData.suspicious_accounts.find(
              acc => acc.account_id === node.id()
            );

            setSelectedAccount(account || null);
          });
        }}
        stylesheet={[
          {
            selector: "node",
            style: {
              label: "data(id)",
              backgroundColor: "#3a3f44",
              width: 40,
              height: 40,
              fontSize: 9,
              color: "#fff",
              borderWidth: 2,
              borderColor: "#2a2f35"
            }
          },
          {
            selector: ".suspicious",
            style: {
              backgroundColor: "#e63946",
              borderColor: "#ff4d6d",
              borderWidth: 3
            }
          },
          {
            selector: "edge",
            style: {
              width: 2,
              lineColor: "#495057",
              targetArrowColor: "#495057",
              targetArrowShape: "triangle",
              curveStyle: "bezier"
            }
          },
          {
            selector: "node:selected",
            style: {
              borderWidth: 4,
              borderColor: "#4cc9f0"
            }
          }
        ]}
      />
    </div>
  );
}

const emptyStyle = {
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#9aa4af"
};
