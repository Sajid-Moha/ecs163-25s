const width = window.innerWidth;
const height = window.innerHeight;

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 10, right: 30, bottom: 30, left: 60},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

let distrLeft = 400, distrTop = 0;
let distrMargin = {top: 10, right: 30, bottom: 30, left: 60},
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 350 - distrMargin.top - distrMargin.bottom;

let pieLeft = 0, pieTop = 0;
let pieMargin = {top: 10, right: 30, bottom: 30, left: 60},
    pieWidth = 400 - pieMargin.left - pieMargin.right,
    pieHeight = 350 - pieMargin.top - pieMargin.bottom;

let sankeyMargin = {top: 10, right: 10, bottom: 10, left: 10},
sankeyWidth = 450 - sankeyMargin.left - sankeyMargin.right,
sankeyHeight = 480 - sankeyMargin.top - sankeyMargin.bottom;


function generateScatterPlot(svg, processedData) {
  const g1 = svg.append("g")
                .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
                .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
                .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);

  // X label
  g1.append("text")
    .attr("x", scatterWidth - 25)
    .attr("y", (scatterHeight / 2) - 15)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("opacity", "0.6")
    .text("HEIGHT (M)");

  // Y label
  g1.append("text")
    .attr("x", -(scatterHeight / 2) + 100)
    .attr("y", (scatterWidth / 2) + 25)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("opacity", "0.6")
    .text("WEIGHT (KG)");

  // X ticks
  const x1 = d3.scaleLinear()
                .domain([d3.min(processedData, d => d.Height_m), d3.max(processedData, d => d.Height_m)])
                .range([0, scatterWidth]);
  const xAxisCall = d3.axisBottom(x1)
            .ticks(7);
  g1.append("g")
      .attr("transform", `translate(0, ${scatterHeight / 2})`)
      .call(xAxisCall)
      .selectAll("text")
      .attr("y", "10")
      .attr("x", "-5")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-40)");

  // Y ticks
  const y1 = d3.scaleLinear()
                .domain([d3.min(processedData, d => d.Weight_kg), d3.max(processedData, d => d.Weight_kg)])
                .range([scatterHeight, 0]);
  const yAxisCall = d3.axisLeft(y1)
            .ticks(13);
  g1.append("g")
    .attr("transform", `translate(${scatterWidth / 2}, 0)`)
    .call(yAxisCall);

  // circles
  const circles = g1.selectAll("circle").data(processedData);

  circles.enter().append("circle")
          .attr("cx", d => x1(d.Height_m))
          .attr("cy", d => y1(d.Weight_kg))
          .attr("r", 5)
          .attr("fill", "yellow")
          .attr("stroke", "blue")
          .attr("stroke-width", 2);

  const g2 = svg.append("g")
                .attr("width", distrWidth + distrMargin.left + distrMargin.right)
                .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
                .attr("transform", `translate(${distrLeft}, ${distrTop})`);

  return {
    "g1": g1,
    "g2": g2,
    "x1": x1,
    "y1": y1
  };
}

// plots
d3.csv("pokemon_alopez247.csv").then(rawData =>{
    console.log("rawData", rawData);

    rawData.forEach(function(d){
        d.Height_m = Number(d.Height_m);
        d.Weight_kg = Number(d.Weight_kg);
    });


    const processedData = rawData.map(d=>{
                          return {
                              "Height_m": d.Height_m,
                              "Weight_kg": d.Weight_kg
                          };
    });
    console.log("processedData", processedData);

    //plot 1: Scatter Plot
    const svg = d3.select("#size-plot");
    let sp = generateScatterPlot(svg, processedData);

    // doberman references
    {
      g1 = sp["g1"];
      x1 = sp["x1"];
      y1 = sp["y1"];

      // add reference lines for doberman
      g1.append("line")
      .attr("x1", 0)
      .attr("x2", scatterWidth)
      .attr("y1", y1(40))
      .attr("y2", y1(40))
      .attr("stroke", "gray")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");

      g1.append("line")
      .attr("x1", x1(.71))
      .attr("x2", x1(.71))
      .attr("y1", 0)
      .attr("y2", scatterHeight)
      .attr("stroke", "gray")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");

    // Calculate the intersection point
    const intersectionX = x1(.71);
    const intersectionY = y1(40);

    // Add a highlighted rectangle with top-right corner at the intersection
    g1.append("rect")
      .attr("x", 0)
      .attr("y", intersectionY)
      .attr("width", intersectionX)
      .attr("height", scatterHeight - y1(40))
      .attr("fill", "red")
      .attr("opacity", .7)
      .attr("stroke", "black")
      .attr("stroke-width", 3);
    }

    /*     
    * Pie Chart : code snippet taken from d3.js documentation and modified     
    */
  {
    let pieData = {"Safe": 0};
    // types in dataset:
    /*
    Water (105)
    Bug (63)
    Normal (93)
    Poison (28)
    Electric (36)
    Ground (30)
    Fairy (17)
    Fighting (25)
    Psychic (47)
    Rock (41)
    Ghost (23)
    Ice (23)
    Dragon (24)
    Dark (28)
    Steel (22)
    Flying (3)
    */
    let unsafe = new Set();
    unsafe.add("Poison");
    unsafe.add("Electric");
    unsafe.add("Fighting");
    unsafe.add("Ghost");
    unsafe.add("Dragon");
    unsafe.add("Fire");
    
    rawData.forEach((d) => {
      if (unsafe.has(d.Type_1)) {
        if (!pieData[d.Type_1]) {
          pieData[d.Type_1] = 0;
        }
        pieData[d.Type_1] += 1;
      } else {
        pieData["Safe"] += 1;
      }
    });


    var radius = Math.min(pieWidth, pieHeight) / 2 - 20;

    // append the svg object to the div
    var pie_svg = d3.select("#danger-plot")
      .attr("width", pieWidth)
      .attr("height", pieHeight)
      .append("g")
      .attr("transform", "translate(" + pieWidth / 2 + "," + pieHeight / 2 + ")");

    var data = pieData;

    // set the color scale
    var color = d3.scaleOrdinal()
      .domain(Object.keys(data))
      .range(d3.schemeSet2);

    // Compute the position of each group on the pie:
    var pie = d3.pie()
      .value(function(d) {return d.value; });

    var data_ready = pie(d3.entries(data));

    // shape helper to build arcs:
    var arcGenerator = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    // Build the pie chart
    pie_svg
      .selectAll('mySlices')
      .data(data_ready)
      .enter()
      .append('path')
        .attr('d', arcGenerator)
        .attr('fill', function(d){ return(color(d.data.key)) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);


      // code for legend was AI-generated then modified to fit usecase
      const legendRectSize = 18;
      const legendSpacing = 4;
      const legendHeight = legendRectSize + legendSpacing;

      const legend = pie_svg.append("g")
        .attr("transform", `translate(${radius + 30}, ${-Object.keys(data).length * legendHeight / 2})`);

      // Create legend items
      const legendItems = legend.selectAll(".legend-item")
        .data(data_ready)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * legendHeight})`);

      // Add colored squares to legend
      legendItems.append("rect")
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .style("fill", d => color(d.data.key))
        .style("stroke", "black");

      // Add text labels to legend
      legendItems.append("text")
        .attr("x", legendRectSize + legendSpacing)
        .attr("y", legendRectSize - legendSpacing)
        .text(d => `${d.data.key} (${d.data.value})`)
        .style("font-size", "12px")
        .attr("fill", "black");
  }

  /*
  * Sankey Diagram : code modified from documentation "https://d3-graph-gallery.com/graph/sankey_basic.html"
  */
 {
  let unsafe = new Set();
  unsafe.add("Poison");
  unsafe.add("Electric");
  unsafe.add("Fighting");
  unsafe.add("Ghost");
  unsafe.add("Dragon");
  unsafe.add("Fire");
  
  let counts = {
    "safeCount": 0,
    "unsafeCount": 0,
    "s_rs_count": 0, // safe -> reasonable size
    "s_tb_count": 0, // safe -> too big
    "us_rs_count": 0, // unsafe -> reasonable size
    "us_tb_count": 0, // unsafe -> too big
    "rs_gp_count": 0, // reasonable size -> good pet,
    "rs_bp_count": 0,
    "tb_bp_count": 0 // too big -> bad pet
  }
  
  rawData.forEach((d) => {
    let h = Number(d.Height_m);
    let w = Number(d.Weight_kg);
    let type = d.Type_1;
  
    let max_height = .7
    let max_weight = 40
    if (!unsafe.has(type)) {
      counts["safeCount"] += 1;
      // safe
      if (h <= max_height && w <= max_weight) {
        // safe -> reasonable size (good pet)
        counts["s_rs_count"] += 1;
        counts["rs_gp_count"] += 1;
      } else {
        // safe -> too big (bad pet)
        counts["s_tb_count"] += 1;
        counts["tb_bp_count"] += 1;
      }
    } else {
      // unsafe
      counts["unsafeCount"] += 1;
      if (h <= max_height && w <= max_weight) {
        // unsafe -> reasonable size (bad pet)
        counts["us_rs_count"] += 1;
        counts["rs_bp_count"] += 1;
      } else {
        // unsafe -> too big (bad pet)
        counts["us_tb_count"] += 1;
        counts["tb_bp_count"] += 1;
      }
    }
  });
  
  let nodes = [
    {"node": 0, "name": "Safe Type"},
    {"node": 1, "name": "Unsafe Type"},
    {"node": 2, "name": "Reasonable Size"},
    {"node": 3, "name": "Too Big"},
    {"node": 4, "name": "Good Pet"},
    {"node": 5, "name": "Bad Pet"},
    {"node": 6, "name": "All Pokemon"}
  ]
  
  let links = [
    // origin -> safe
    {"source": 6, "target": 0, "value": counts["safeCount"]},
    // origin -> unsafe
    {"source": 6, "target": 1, "value": counts["unsafeCount"]},
    // safe -> reasonable size
    {"source": 0, "target": 2, "value": counts["s_rs_count"]},
    // safe -> too big
    {"source": 0, "target": 3, "value": counts["s_tb_count"]},
    // unsafe -> reasonable size
    {"source": 1, "target": 2, "value": counts["us_rs_count"]},
    // unsafe -> too big
    {"source": 1, "target": 3, "value": counts["us_tb_count"]},
    // reasonable size -> good pet
    {"source": 2, "target": 4, "value": counts["rs_gp_count"]},
    // reasonable size -> bad pet
    {"source": 2, "target": 5, "value": counts["rs_bp_count"]},
    // too big -> bad pet
    {"source": 3, "target": 5, "value": counts["tb_bp_count"]}
  ]
  
  let sankeySvg = d3.select("#sankey-card").append("svg")
                    .attr("width", sankeyWidth + sankeyMargin.left + sankeyMargin.right)
                    .attr("height", sankeyHeight + sankeyMargin.top + sankeyMargin.bottom)
                    .attr("viewBox", `0 0 ${sankeyWidth + sankeyMargin.left + sankeyMargin.right} ${sankeyHeight + sankeyMargin.top + sankeyMargin.bottom}`)
                    .attr("preserveAspectRatio", "xMidYMid meet")
                    .append("g")
                    .attr("transform", `translate(${sankeyMargin.left},${sankeyMargin.top})`);
                          
  // Color scale used
  let color = d3.scaleOrdinal()
                .domain(["Safe", "Unsafe", "Reasonable Size", "Too Big", "Good Pet", "Bad Pet", "origin"])
                .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2"]);
  
  // Set the sankey diagram properties
  let sankey = d3.sankey()
                  .nodeWidth(36)
                  .nodePadding(40) // Increased padding to prevent overlap
                  .size([sankeyWidth, sankeyHeight]);
  
  // Constructs a new Sankey generator with the default settings.
  let sankeyGraph = sankey({
    nodes: nodes.map(d => Object.assign({}, d)),
    links: links.map(d => Object.assign({}, d))
  });    
  
  // add in the links
  let link = sankeySvg.append("g")
                    .selectAll(".link")
                    .data(sankeyGraph.links)
                    .enter().append("path")
                      .attr("class", "link")
                      .attr("d", d3.sankeyLinkHorizontal())
                      .style("fill", "none")
                      .style("stroke", d => color(d.source.name))
                      .style("stroke-width", d => Math.max(1, d.width))
                      .style("stroke-opacity", 0.5)
                      .sort((a, b) => b.width - a.width);
  
  // AI Generated snippet to stop blocks from moving:
  // Contains the dragging behavior while restricting horizontal movement
  function dragmove(event, d) {
    // Only allow vertical movement (keep x-position fixed)
    d.y0 = Math.max(0, Math.min(sankeyHeight - (d.y1 - d.y0), event.y));
    d.y1 = d.y0 + (d.y1 - d.y0);
    d3.select(this).attr("transform", `translate(${d.x0},${d.y0})`);
    link.attr("d", d3.sankeyLinkHorizontal());
  }
  
  let node = sankeySvg.append("g")
                    .selectAll(".node")
                    .data(sankeyGraph.nodes)
                    .enter().append("g")
                      .attr("class", "node")
                      .attr("transform", d => `translate(${d.x0},${d.y0})`)
                      .call(d3.drag()
                        .subject(d => d)
                        .on("start", function () { this.parentNode.appendChild(this); })
                        .on("drag", dragmove));
  
  // add the rectangles for the nodes
  node.append("rect")
      .attr("height", d => d.y1 - d.y0)
      .attr("width", sankey.nodeWidth())
      .style("fill", d => d.color = color(d.name))
      .style("stroke", d => d3.rgb(d.color).darker(2))
      .append("title")
      .text(d => `${d.name}\nCount: ${d.value}`);
  
  // add in the title for the nodes
  node.append("text")
      .attr("x", d => d.x0 < sankeyWidth / 2 ? 6 + sankey.nodeWidth() : -6)
      .attr("y", d => (d.y1 - d.y0) / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", d => d.x0 < sankeyWidth / 2 ? "start" : "end")
      .text(d => d.name)
      .style("font-size", "12px")
      .style("pointer-events", "none");
  
  sankeySvg.selectAll(".link")
      .style("stroke-opacity", 0.4);
 }
})
    .catch(function(error){
      console.log(error);
});
