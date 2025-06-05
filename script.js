
const fields = {
    Species: ["Ovina", "Caprina", "Vacuna", "Porcina", "Avícola", "Cunícula"],
    Devices: ["Drones", "RFID", "Collares", "Cámaras de visión", "IA", "Alimentadores automáticos", "Básculas", "Sensores acústicos", "Sensores de movimiento", "Vallados virtuales"],
    Study: ["Comportamiento alimenticio", "Comportamiento social", "Manejo", "Nutrición", "Salud"],
    Projects: ["Project1", "Project2", "Project3", "Project4"],
    Status: ["IP", "Predoc", "Postdoc", "Técnico"],
    Institution: ["UPV", "UdL", "UCO", "USAL", "UAB"]
};

let selectedFilters = {};

function createFilters() {
    const container = document.getElementById("filters");
    for (const field in fields) {
        selectedFilters[field] = new Set();
        const wrapper = document.createElement("div");
        wrapper.className = field;
        const title = document.createElement("strong");
        title.textContent = field;
        wrapper.appendChild(title);
        fields[field].forEach(value => {
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = value;
            checkbox.addEventListener("change", () => {
                if (checkbox.checked) selectedFilters[field].add(value);
                else selectedFilters[field].delete(value);
                updateGraph();
            });
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(value));
            wrapper.appendChild(document.createElement("br"));
            wrapper.appendChild(label);
        });
        container.appendChild(wrapper);
    }
}

function updateGraph() {
    const nodes = people.filter(p => {
        return Object.keys(selectedFilters).some(field =>
            selectedFilters[field].size > 0 &&
            ((Array.isArray(p[field]) && p[field].some(val => selectedFilters[field].has(val))) ||
            (!Array.isArray(p[field]) && selectedFilters[field].has(p[field])))
        );
    });

    const links = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const shared = Object.keys(fields).some(field => {
                const a = nodes[i][field];
                const b = nodes[j][field];
                if (Array.isArray(a) && Array.isArray(b)) return a.some(val => b.includes(val));
                return a === b;
            });
            if (shared) links.push({ source: nodes[i].id, target: nodes[j].id });
        }
    }

    drawGraph(nodes, links);
}

function drawGraph(nodes, links) {
    d3.select("#graph").selectAll("*").remove();
    const svg = d3.select("#graph").append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    const width = document.getElementById("graph").clientWidth;
    const height = document.getElementById("graph").clientHeight;

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke", "#ccc");

    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", d => d.Status === "IP" ? 12 : 8)
        .attr("fill", d => d.Status === "IP" ? "#e74c3c" : "#3498db")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    const label = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .enter().append("text")
        .text(d => d.id)
        .attr("font-size", "10px")
        .attr("dx", 12)
        .attr("dy", ".35em");

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label.attr("x", d => d.x)
            .attr("y", d => d.y);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

createFilters();
updateGraph();
