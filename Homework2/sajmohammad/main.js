/*
*
* AI referenced: how to set up automatic SVG resizing
*
*/
// Set up responsive behavior with aspect ratios
const container = d3.select("#container");
const width = window.innerWidth;
const height = window.innerHeight;

// Aspect ratios for maintaining proportions
const scatterAspectRatio = 1.1;
const pieAspectRatio = 1;
const sankeyAspectRatio = 1.3;

// Calculate base dimensions
const baseWidth = Math.min(width * 0.45, 450);
const scatterWidth = baseWidth;
const scatterHeight = scatterWidth / scatterAspectRatio;
const pieWidth = baseWidth;
const pieHeight = pieWidth / pieAspectRatio;
const sankeyWidth = Math.min(width * 0.9, 800);
const sankeyHeight = sankeyWidth / sankeyAspectRatio;

// Margins
let scatterMargin = {top: 30, right: 30, bottom: 50, left: 60};
let pieMargin = {top: 10, right: 30, bottom: 30, left: 30};
let sankeyMargin = {top: 20, right: 20, bottom: 20, left: 20};

// Calculate actual plot dimensions
const innerScatterWidth = scatterWidth - scatterMargin.left - scatterMargin.right;
const innerScatterHeight = scatterHeight - scatterMargin.top - scatterMargin.bottom;
const innerPieWidth = pieWidth - pieMargin.left - pieMargin.right;
const innerPieHeight = pieHeight - pieMargin.top - pieMargin.bottom;
const innerSankeyWidth = sankeyWidth - sankeyMargin.left - sankeyMargin.right;
const innerSankeyHeight = sankeyHeight - sankeyMargin.top - sankeyMargin.bottom;

// Function to handle window resize
function handleResize() {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  
  // Recalculate dimensions based on new window size
  const newBaseWidth = Math.min(newWidth * 0.45, 450);
  const newSankeyWidth = Math.min(newWidth * 0.9, 800);
  
  // Resize scatter plot
  d3.select("#size-plot")
    .attr("width", newBaseWidth)
    .attr("height", newBaseWidth / scatterAspectRatio)
    .attr("viewBox", `0 0 ${scatterWidth} ${scatterHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet");
    
  // Resize pie chart
  d3.select("#danger-plot")
    .attr("width", newBaseWidth)
    .attr("height", newBaseWidth / pieAspectRatio)
    .attr("viewBox", `0 0 ${pieWidth} ${pieHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet");
    
  // Resize sankey diagram
  d3.select("#sankey-svg")
    .attr("width", newSankeyWidth)
    .attr("height", newSankeyWidth / sankeyAspectRatio)
    .attr("viewBox", `0 0 ${sankeyWidth} ${sankeyHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet");
}

// Add resize event listener
window.addEventListener('resize', handleResize);

/*
*
*
*
*/

function generateScatterPlot(svg, processedData) {
  // Set up the SVG with viewBox for responsiveness
  svg.attr("width", scatterWidth)
     .attr("height", scatterHeight)
     .attr("viewBox", `0 0 ${scatterWidth} ${scatterHeight}`)
     .attr("preserveAspectRatio", "xMidYMid meet");
  
  const g1 = svg.append("g")
                .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);

  // X label
  g1.append("text")
    .attr("x", innerScatterWidth / 2)
    .attr("y", innerScatterHeight + 40)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .attr("opacity", "0.6")
    .text("HEIGHT (M)");

  // Y label
  g1.append("text")
    .attr("x", -innerScatterHeight / 2)
    .attr("y", -40)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("opacity", "0.6")
    .text("WEIGHT (KG)");

  // X ticks
  const x1 = d3.scaleLinear()
                .domain([d3.min(processedData, d => d.Height_m), d3.max(processedData, d => d.Height_m)])
                .range([0, innerScatterWidth]);
  const xAxisCall = d3.axisBottom(x1)
            .ticks(7);
  g1.append("g")
      .attr("transform", `translate(0, ${innerScatterHeight})`)
      .call(xAxisCall)
      .selectAll("text")
      .attr("y", "10")
      .attr("x", "-5")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-40)");

  // Y ticks
  const y1 = d3.scaleLinear()
                .domain([d3.min(processedData, d => d.Weight_kg), d3.max(processedData, d => d.Weight_kg)])
                .range([innerScatterHeight, 0]);
  const yAxisCall = d3.axisLeft(y1)
            .ticks(13);
  g1.append("g")
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

  return {
    "g1": g1,
    "x1": x1,
    "y1": y1,
    "width": innerScatterWidth,
    "height": innerScatterHeight
  };
}

// Main plotting function
d3.csv("pokemon_alopez247.csv").then(rawData => {
    console.log("rawData", rawData);

    rawData.forEach(function(d){
        d.Height_m = Number(d.Height_m);
        d.Weight_kg = Number(d.Weight_kg);
    });

    const processedData = rawData.map(d => {
        return {
            "Height_m": d.Height_m,
            "Weight_kg": d.Weight_kg
        };
    });
    console.log("processedData", processedData);

    // Create the SVG containers with proper viewBoxes
    const scatterSvg = d3.select("#size-plot");
    const pieSvg = d3.select("#danger-plot")
                     .attr("width", pieWidth)
                     .attr("height", pieHeight)
                     .attr("viewBox", `0 0 ${pieWidth} ${pieHeight}`)
                     .attr("preserveAspectRatio", "xMidYMid meet");

    // Create the scatter plot
    let sp = generateScatterPlot(scatterSvg, processedData);

    // Add doberman references
    {
      const g1 = sp["g1"];
      const x1 = sp["x1"];
      const y1 = sp["y1"];
      const innerScatterWidth = sp["width"];
      const innerScatterHeight = sp["height"];

      // Add reference lines for doberman
      g1.append("line")
      .attr("x1", 0)
      .attr("x2", innerScatterWidth)
      .attr("y1", y1(40))
      .attr("y2", y1(40))
      .attr("stroke", "gray")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");

      g1.append("text")
      .attr("x", .8 * innerScatterWidth)
      .attr("y", y1(40) - 10)
      .attr("font-size", "12px")
      .attr("text-anchor", "start")
      .attr("fill", "red")
      .text("Safe Weight");

      g1.append("line")
      .attr("x1", x1(.71))
      .attr("x2", x1(.71))
      .attr("y1", 0)
      .attr("y2", innerScatterHeight)
      .attr("stroke", "gray")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");

      g1.append("text")
      .attr("x", x1(.71) + 10)
      .attr("y", innerScatterHeight * 0.1)
      .attr("font-size", "12px")
      .attr("text-anchor", "start")
      .attr("fill", "red")
      .attr("opacity", "1")
      .text("Safe Height");

      // Calculate the intersection point
      const intersectionX = x1(.71);
      const intersectionY = y1(40);

      // Add a highlighted rectangle with top-right corner at the intersection
      g1.append("rect")
        .attr("x", 0)
        .attr("y", intersectionY)
        .attr("width", intersectionX)
        .attr("height", innerScatterHeight - intersectionY)
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
      // types in dataset
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

      var radius = (5 * Math.min(innerPieWidth, innerPieHeight)) / 12;

      // append the svg object to the div
      var pie_svg = pieSvg.append("g")
        .attr("transform", "translate(" + pieWidth / 2  + "," + pieHeight / 2 + ")");

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

      // Legend setup
      const legendRectSize = pieWidth * .05;
      const legendSpacing = legendRectSize * .2;
      const legendHeight = legendRectSize + legendSpacing;

      const legend = pie_svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${radius + 10}, ${-Object.keys(data).length * legendHeight / 2})`);

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
      
      // Create a proper SVG with viewBox for responsiveness
      let sankeySvg = d3.select("#sankey-card").append("svg")
                      .attr("id", "sankey-svg")
                      .attr("width", sankeyWidth)
                      .attr("height", sankeyHeight)
                      .attr("viewBox", `0 0 ${sankeyWidth} ${sankeyHeight}`)
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
                    .nodePadding(40)
                    .size([innerSankeyWidth, innerSankeyHeight]);
      
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
      
      // Drag behavior for nodes while restricting horizontal movement
      function dragmove(event, d) {
        // Only allow vertical movement (keep x-position fixed)
        d.y0 = Math.max(0, Math.min(innerSankeyHeight - (d.y1 - d.y0), event.y));
        d.y1 = d.y0 + (d.y1 - d.y0);
        d3.select(this).attr("transform", `translate(${d.x0},${d.y0})`);
        link.attr("d", d3.sankeyLinkHorizontal());
      }
      
      // sankey chart
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
      
      // Add the rectangles for the nodes
      node.append("rect")
        .attr("height", d => d.y1 - d.y0)
        .attr("width", sankey.nodeWidth())
        .style("fill", d => d.color = color(d.name))
        .style("stroke", d => d3.rgb(d.color).darker(2))
        .append("title")
        .text(d => `${d.name}\nCount: ${d.value}`);
      
      // Add the title for the nodes
      node.append("text")
        .attr("x", d => d.x0 < innerSankeyWidth / 2 ? 6 + sankey.nodeWidth() : -6)
        .attr("y", d => (d.y1 - d.y0) / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", d => d.x0 < innerSankeyWidth / 2 ? "start" : "end")
        .text(d => d.name)
        .style("font-size", "12px")
        .style("pointer-events", "none");
      
      sankeySvg.selectAll(".link")
        .style("stroke-opacity", 0.4);
    }

    // AI Generated: Initial call to set up the proper dimensions
    handleResize();
})
.catch(function(error){
    console.log(error);
});
