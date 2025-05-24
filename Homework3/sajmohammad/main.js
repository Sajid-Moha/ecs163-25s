// base dimensions
const scatterWidth = 540;
const scatterHeight = 540;

const pieWidth = 540;
const pieHeight = 540

const sankeyWidth = 540;
const sankeyHeight = 540;

// Scatter Margins
let scatterMargin = {top: 30, right: 30, bottom: 50, left: 60};
const innerScatterWidth = scatterWidth - scatterMargin.left - scatterMargin.right;
const innerScatterHeight = scatterHeight - scatterMargin.top - scatterMargin.bottom;

// Pie Chart Margins
let pieMargin = {top: 10, right: pieWidth * .25, bottom: 30, left: 30};
const innerPieWidth = pieWidth - pieMargin.left - pieMargin.right;
const innerPieHeight = pieHeight - pieMargin.top - pieMargin.bottom;

// Sankey Plot Margins
let sankeyMargin = {top: 20, right: 20, bottom: 20, left: 20};
const innerSankeyWidth = sankeyWidth - sankeyMargin.left - sankeyMargin.right;
const innerSankeyHeight = sankeyHeight - sankeyMargin.top - sankeyMargin.bottom;

// FOR PIE CHART AND SANKEY DIAGRAM: (initial dangerous types)
let checkedTypes = ['Fire', 'Poison', 'Electric', 'Fighting', 'Ghost', 'Dragon'];

// SIZE REFERENCES
let maxSafeHeight = 0.7; // default reference: doberman dog
let maxSafeWeight = 40;  // default reference: doberman dog

/*
*
*
*
*/

// Main plotting function
d3.csv("pokemon_alopez247.csv").then(rawData => {
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

  /* SCATTER PLOT */
  // referenced documentation for zoom: https://observablehq.com/@d3/zoomable-scatterplot?collection=@d3/d3-zoom
  // AI Generated part of clipping code to prevent overflow
  // AI generated snippet for finding change in safety sizes --> modified to update my graph
  {
    const scatterSvg = d3.select("#size-plot");
    let k = innerScatterHeight / innerScatterWidth;

    const totalWidth = scatterWidth;
    const totalHeight = scatterHeight;

    // Store original domain for constraint calculations
    const originalXDomain = [d3.min(processedData, d => d.Height_m), d3.max(processedData, d => d.Height_m)];
    const originalYDomain = [d3.min(processedData, d => d.Weight_kg), d3.max(processedData, d => d.Weight_kg)];

    /* setup zoom with extent constraints */
    const zoom = d3.zoom()
                    .scaleExtent([0.5, 32])
                    .extent([[0, 0], [innerScatterWidth, innerScatterHeight]])
                    .translateExtent([
                      [0, 0], 
                      [innerScatterWidth, innerScatterHeight]
                    ])
                    .on("zoom", zoomed);

    // Set up the SVG with expanded viewBox for labels
    scatterSvg.attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
              .attr("preserveAspectRatio", "xMidYMid meet");

    // Create main group that's translated to account for margins
    const mainGroup = scatterSvg.append("g")
                                .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);

    // Add clipping path to hide points outside the plot area
    scatterSvg.append("defs")
              .append("clipPath")
              .attr("id", "scatter-clip")
              .append("rect")
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", innerScatterWidth)
              .attr("height", innerScatterHeight);
          
    const scatter_g_grid = mainGroup.append("g");

    const scatter_g_dot = mainGroup.append("g")
                                  .attr("fill", "none")
                                  .attr("stroke-linecap", "round")
                                  .attr("clip-path", "url(#scatter-clip)");
                                            
    /* axises / grid */
    let scatter_x = d3.scaleLinear()
                      .domain(originalXDomain)
                      .range([0, innerScatterWidth]);
    let scatter_y = d3.scaleLinear()
                      .domain(originalYDomain)
                      .range([innerScatterHeight, 0]);

    let scatter_xAxis = (g, x) => g
                        .attr("transform", `translate(0,${innerScatterHeight})`)
                        .call(d3.axisTop(x).ticks(12))
                        .call(g => g.select(".domain").attr("display", "none"));

    let scatter_yAxis = (g, y) => g
                        .call(d3.axisRight(y).ticks(12 * k))
                        .call(g => g.select(".domain").attr("display", "none"))

    let scatter_grid = (g, x, y) => g
          .attr("stroke", "currentColor")
          .attr("stroke-opacity", 0.1)
          .call(g => g
            .selectAll(".x")
            .data(x.ticks(12))
            .join(
              enter => enter.append("line").attr("class", "x").attr("y2", innerScatterHeight),
              update => update,
              exit => exit.remove()
            )
              .attr("x1", d => 0.5 + x(d))
              .attr("x2", d => 0.5 + x(d)))
          .call(g => g
            .selectAll(".y")
            .data(y.ticks(12 * k))
            .join(
              enter => enter.append("line").attr("class", "y").attr("x2", innerScatterWidth),
              update => update,
              exit => exit.remove()
            )
              .attr("y1", d => 0.5 + y(d))
              .attr("y2", d => 0.5 + y(d)));

    scatter_g_dot.selectAll("circle")
                  .data(processedData)
                  .join("circle")
                    .attr("cx", d => scatter_x(d["Height_m"]))
                    .attr("cy", d => scatter_y(d["Weight_kg"]))
                    .attr("r", 3)
                    .attr("fill", "blue")
                    .attr("stroke", "blue")
                    .attr("stroke-width", 1);

    // Add intial doberman references
    {
      const g1 = scatter_g_grid;

      // Add reference lines for doberman with clipping
      g1.append("line")
        .attr("class", "weight-ref-line")
        .attr("x1", 0)
        .attr("x2", innerScatterWidth)
        .attr("y1", scatter_y(40))
        .attr("y2", scatter_y(40))
        .attr("stroke", "red")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "10,5")
        .attr("clip-path", "url(#scatter-clip)");

      g1.append("text")
        .attr("class", "weight-ref-text")
        .attr("x", .8 * innerScatterWidth)
        .attr("y", scatter_y(40) - 10)
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .attr("fill", "red")
        .attr("clip-path", "url(#scatter-clip)")
        .text("Safe Weight");

      g1.append("line")
        .attr("class", "height-ref-line")
        .attr("x1", scatter_x(.71))
        .attr("x2", scatter_x(.71))
        .attr("y1", 0)
        .attr("y2", innerScatterHeight)
        .attr("stroke", "red")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "10,5")
        .attr("clip-path", "url(#scatter-clip)");

      g1.append("text")
        .attr("class", "height-ref-text")
        .attr("x", scatter_x(.71) + 10)
        .attr("y", innerScatterHeight * 0.1)
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .attr("fill", "red")
        .attr("opacity", "1")
        .attr("clip-path", "url(#scatter-clip)")
        .text("Safe Height");

      // Calculate the intersection point
      const intersectionX = scatter_x(.71);
      const intersectionY = scatter_y(40);

      // Add a highlighted rectangle with top-right corner at the intersection
      g1.append("rect")
        .attr("class", "safe-zone-rect")
        .attr("x", 0)
        .attr("y", intersectionY)
        .attr("width", intersectionX)
        .attr("height", innerScatterHeight - intersectionY)
        .attr("fill", "red")
        .attr("opacity", .3)
        .attr("stroke", "darkred")
        .attr("stroke-width", 2)
        .attr("clip-path", "url(#scatter-clip)"); 
    }

    const scatter_gx = mainGroup.append("g");
    const scatter_gy = mainGroup.append("g");

    // Add axis labels (now positioned relative to the SVG, not the mainGroup)
    scatterSvg.append("text")
              .attr("class", "x-axis-label")
              .attr("text-anchor", "middle")
              .attr("x", scatterMargin.left + innerScatterWidth / 2)
              .attr("y", scatterMargin.top + innerScatterHeight + 40)
              .style("font-size", "14px")
              .style("font-family", "Arial, sans-serif")
              .text("Height (m)");

    scatterSvg.append("text")
              .attr("class", "y-axis-label")
              .attr("text-anchor", "middle")
              .attr("transform", `translate(${20}, ${scatterMargin.top + innerScatterHeight / 2}) rotate(-90)`)
              .style("font-size", "14px")
              .style("font-family", "Arial, sans-serif")
              .text("Weight (kg)");

  // Apply zoom to the SVG but constrain interaction to the plot area
  scatterSvg.call(zoom).call(zoom.transform, d3.zoomIdentity);

  function zoomed() { // D3 v5: no parameters needed
    const transform = d3.event.transform; // D3 v5: access transform through d3.event
    
    // Apply additional domain constraints to prevent going outside data bounds
    const zx = transform.rescaleX(scatter_x).interpolate(d3.interpolateRound);
    const zy = transform.rescaleY(scatter_y).interpolate(d3.interpolateRound);
    
    // Check if we're trying to go outside the original domain and constrain if needed
    const currentXDomain = zx.domain();
    const currentYDomain = zy.domain();
    
    // Constrain X domain
    if (currentXDomain[0] < originalXDomain[0] || currentXDomain[1] > originalXDomain[1]) {
      const xRange = originalXDomain[1] - originalXDomain[0];
      const currentRange = currentXDomain[1] - currentXDomain[0];
      
      if (currentRange >= xRange) {
        // If zoomed out too far, reset to original domain
        zx.domain(originalXDomain);
      } else {
        // If panned outside, adjust to keep within bounds
        if (currentXDomain[0] < originalXDomain[0]) {
          zx.domain([originalXDomain[0], originalXDomain[0] + currentRange]);
        } else if (currentXDomain[1] > originalXDomain[1]) {
          zx.domain([originalXDomain[1] - currentRange, originalXDomain[1]]);
        }
      }
    }
    
    // Constrain Y domain
    if (currentYDomain[0] < originalYDomain[0] || currentYDomain[1] > originalYDomain[1]) {
      const yRange = originalYDomain[1] - originalYDomain[0];
      const currentRange = currentYDomain[1] - currentYDomain[0];
      
      if (currentRange >= yRange) {
        // If zoomed out too far, reset to original domain
        zy.domain(originalYDomain);
      } else {
        // If panned outside, adjust to keep within bounds
        if (currentYDomain[0] < originalYDomain[0]) {
          zy.domain([originalYDomain[0], originalYDomain[0] + currentRange]);
        } else if (currentYDomain[1] > originalYDomain[1]) {
          zy.domain([originalYDomain[1] - currentRange, originalYDomain[1]]);
        }
      }
    }
    
    // Update circles with new positions but keep consistent size
    scatter_g_dot.selectAll("circle")
                .attr("cx", d => zx(d["Height_m"]))
                .attr("cy", d => zy(d["Weight_kg"]))
                .attr("r", 3); // Keep constant size regardless of zoom level
    
    // Update reference lines and rectangle during zoom with bounds checking
    const weightLineY = zy(maxSafeWeight);
    const heightLineX = zx(maxSafeHeight);
    
    scatter_g_grid.select(".weight-ref-line")
                  .attr("x1", 0)
                  .attr("x2", innerScatterWidth)
                  .attr("y1", weightLineY)
                  .attr("y2", weightLineY);
                  
    scatter_g_grid.select(".weight-ref-text")
                  .attr("x", .8 * innerScatterWidth)
                  .attr("y", weightLineY - 10);
                  
    scatter_g_grid.select(".height-ref-line")
                  .attr("x1", heightLineX)
                  .attr("x2", heightLineX)
                  .attr("y1", 0)
                  .attr("y2", innerScatterHeight);
                  
    scatter_g_grid.select(".height-ref-text")
                  .attr("x", heightLineX + 10)
                  .attr("y", innerScatterHeight * 0.1);
    
    // Update the safe zone rectangle with bounds checking to prevent negative dimensions
    const rectX = Math.max(0, Math.min(heightLineX, innerScatterWidth));
    const rectY = Math.max(0, Math.min(weightLineY, innerScatterHeight));
    const rectWidth = Math.max(0, rectX);
    const rectHeight = Math.max(0, innerScatterHeight - rectY);
    
    // Only show rectangle if it has positive dimensions and makes sense
    const rectElement = scatter_g_grid.select(".safe-zone-rect");
    if (rectWidth > 0 && rectHeight > 0 && rectX >= 0 && rectY <= innerScatterHeight) {
      rectElement
        .attr("x", 0)
        .attr("y", rectY)
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .style("display", null); // Show the rectangle
    } else {
      rectElement.style("display", "none"); // Hide the rectangle when it would be invalid
    }
    
    scatter_gx.call(scatter_xAxis, zx);
    scatter_gy.call(scatter_yAxis, zy);
    scatter_g_grid.call(scatter_grid, zx, zy);
  }

  // Add event listener for the update button (move this outside DOMContentLoaded)
  const updateButton = document.getElementById('update-safety');
  const heightInput = document.getElementById('max-height');
  const weightInput = document.getElementById('max-weight');

  if (updateButton && heightInput && weightInput) {
    updateButton.addEventListener('click', function() {
      // Get new values from inputs
      const newHeight = parseFloat(heightInput.value);
      const newWeight = parseFloat(weightInput.value);
      
      // Validate inputs
      if (isNaN(newHeight) || isNaN(newWeight) || newHeight <= 0 || newWeight <= 0) {
        alert('Please enter valid positive numbers for height and weight.');
        return;
      }
      
      // Update global variables
      maxSafeHeight = newHeight;
      maxSafeWeight = newWeight;
      
      // Update all visualizations
      updateScatterSafetyLines();
      if (window.updateSankeyDiagram) {
        window.updateSankeyDiagram();
      }
    });
    
    // Allow Enter key to trigger update
    [heightInput, weightInput].forEach(input => {
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          updateButton.click();
        }
      });
    });
  }

  // Add this function to update safety reference lines in scatter plot
  function updateScatterSafetyLines() {
    const scatter_g_grid = d3.select("#size-plot g").select("g"); // Adjust selector as needed
    
    // Update weight reference line
    const weightLineY = scatter_y(maxSafeWeight);
    scatter_g_grid.select(".weight-ref-line")
                  .transition()
                  .duration(300)
                  .attr("y1", weightLineY)
                  .attr("y2", weightLineY);
                  
    scatter_g_grid.select(".weight-ref-text")
                  .transition()
                  .duration(300)
                  .attr("y", weightLineY - 10);
    
    // Update height reference line
    const heightLineX = scatter_x(maxSafeHeight);
    scatter_g_grid.select(".height-ref-line")
                  .transition()
                  .duration(300)
                  .attr("x1", heightLineX)
                  .attr("x2", heightLineX);
                  
    scatter_g_grid.select(".height-ref-text")
                  .transition()
                  .duration(300)
                  .attr("x", heightLineX + 10);
    
    // Update safe zone rectangle
    const rectX = Math.max(0, Math.min(heightLineX, innerScatterWidth));
    const rectY = Math.max(0, Math.min(weightLineY, innerScatterHeight));
    const rectWidth = Math.max(0, rectX);
    const rectHeight = Math.max(0, innerScatterHeight - rectY);
    
    const rectElement = scatter_g_grid.select(".safe-zone-rect");
    if (rectWidth > 0 && rectHeight > 0 && rectX >= 0 && rectY <= innerScatterHeight) {
      rectElement
        .transition()
        .duration(300)
        .attr("x", 0)
        .attr("y", rectY)
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .style("display", null);
    } else {
      rectElement.style("display", "none");
    }
  }

  }

  /* PIE CHART */
  {
    /* GATHERING DATA TYPES */
    let types = ['Grass', 'Fire', 'Water', 'Bug', 'Normal', 'Poison', 'Electric',
                  'Ground', 'Fairy', 'Fighting', 'Psychic', 'Rock', 'Ghost', 'Ice',
                  'Dragon', 'Dark', 'Steel', 'Flying'];
    let container = document.getElementById('types-container');
    // CHECKED TYPES ARRAY DEFINED EARLIER

    const pieSvg = d3.select("#danger-plot")
                     .attr("width", pieWidth)
                     .attr("height", pieHeight)
                     .attr("viewBox", `0 0 ${pieWidth} ${pieHeight}`)
                     .attr("preserveAspectRatio", "xMidYMid meet");

    var radius = (5 * Math.min(innerPieWidth, innerPieHeight)) / 12;

    // append the svg object to the div
    var pie_svg = pieSvg.append("g")
      .attr("transform", "translate(" + ((pieWidth / 4) + (pieWidth / 6))  + "," + pieHeight / 2 + ")");

    // set the color scale
    var color = d3.scaleOrdinal()
      .range(d3.schemeSet2);

    // Compute the position of each group on the pie:
    var pie = d3.pie()
      .value(function(d) {return d.value; });

    // shape helper to build arcs:
    var arcGenerator = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    // Function to update the pie chart
    function updatePieChart() {
      let pieData = {"Safe": 0};
      
      rawData.forEach((d) => {
        if (checkedTypes.includes(d.Type_1)) {
          if (!pieData[d.Type_1]) {
            pieData[d.Type_1] = 0;
          }
          pieData[d.Type_1] += 1;
        } else {
          pieData["Safe"] += 1;
        }
      });

      // Update color domain
      color.domain(Object.keys(pieData));

      var data_ready = pie(d3.entries(pieData));

      // Update pie slices
      const slices = pie_svg
        .selectAll('path')
        .data(data_ready);

      slices.enter()
        .append('path')
        .merge(slices)
        .transition()
        .duration(300)
        .attr('d', arcGenerator)
        .attr('fill', function(d){ return(color(d.data.key)) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

      slices.exit().remove();

      // Update legend
      const legendRectSize = pieWidth * .05;
      const legendSpacing = legendRectSize * .2;
      const legendHeight = legendRectSize + legendSpacing;

      // Remove old legend
      pie_svg.select(".legend").remove();

      // Create new legend
      const legend = pie_svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${radius + 10}, ${-Object.keys(pieData).length * legendHeight / 2})`);

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

    // Create checkboxes
    types.forEach(type => {
      const label = document.createElement('label');
      label.style.marginRight = '10px';
      label.style.display = 'inline-block';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'type';
      checkbox.value = type;
      checkbox.checked = checkedTypes.includes(type);

      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          // add to checkedTypes
          if (!checkedTypes.includes(type)) {
            checkedTypes.push(type);
          }
        } else {
          // remove from checkedTypes (fixed the filter logic)
          checkedTypes = checkedTypes.filter(t => t !== type);
        }
        // Update both the pie chart and Sankey diagram when checkbox changes
        updatePieChart();
        if (window.updateSankeyDiagram) {
          window.updateSankeyDiagram();
        }
      });

      label.appendChild(checkbox);
      label.append(` ${type}`);
      container.appendChild(label);
    });

    // Initial pie chart render
    updatePieChart();
  }

  /*
  * Sankey Diagram : code modified from documentation "https://d3-graph-gallery.com/graph/sankey_basic.html" &
  * incorporated checkbox functionality using help from AI
  */
  {
    // Create the SVG container once (outside the update function)
    let sankeySvg = d3.select("#sankey-plot")
                    .attr("id", "sankey-svg")
                    .attr("width", sankeyWidth)
                    .attr("height", sankeyHeight)
                    .attr("viewBox", `0 0 ${sankeyWidth} ${sankeyHeight}`)
                    .attr("preserveAspectRatio", "xMidYMid meet");

    // Create main group for the diagram
    let sankeyMainGroup = sankeySvg.select("g.sankey-main");
    if (sankeyMainGroup.empty()) {
      sankeyMainGroup = sankeySvg.append("g")
                                .attr("class", "sankey-main")
                                .attr("transform", `translate(${sankeyMargin.left},${sankeyMargin.top})`);
    }

    // Color scale used
    let color = d3.scaleOrdinal()
                .domain(["Safe Type", "Unsafe Type", "Reasonable Size", "Too Big", "Good Pet", "Bad Pet", "All Pokemon"])
                .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2"]);

    function updateSankeyDiagram() {
  let unsafe = new Set();
  checkedTypes.forEach((t) => {
    unsafe.add(t);
  });
  
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
  };
  
  rawData.forEach((d) => {
    let h = Number(d.Height_m);
    let w = Number(d.Weight_kg);
    let type = d.Type_1;
  
    // Use dynamic safety thresholds
    if (!unsafe.has(type)) {
      counts["safeCount"] += 1;
      // safe
      if (h <= maxSafeHeight && w <= maxSafeWeight) {
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
      if (h <= maxSafeHeight && w <= maxSafeWeight) {
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
  ];
  
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
  ];

  // Filter out links with zero values to avoid rendering issues
  links = links.filter(link => link.value > 0);
  
  // Set the sankey diagram properties
  let sankey = d3.sankey()
                .nodeWidth(36)
                .nodePadding(40)
                .size([innerSankeyWidth, innerSankeyHeight]);
  
  // Constructs a new Sankey generator with the default settings
  let sankeyGraph = sankey({
    nodes: nodes.map(d => Object.assign({}, d)),
    links: links.map(d => Object.assign({}, d))
  });

  // Clear existing content
  sankeyMainGroup.selectAll("*").remove();
  
  // Add the links
  let link = sankeyMainGroup.append("g")
                  .attr("class", "links")
                  .selectAll(".link")
                  .data(sankeyGraph.links)
                  .enter().append("path")
                    .attr("class", "link")
                    .attr("d", d3.sankeyLinkHorizontal())
                    .style("fill", "none")
                    .style("stroke", d => color(d.source.name))
                    .style("stroke-width", d => Math.max(1, d.width))
                    .style("stroke-opacity", 0.4)
                    .sort((a, b) => b.width - a.width);
  
  // no drag behavior
  function dragmove(event, d) {
    return;
  }
  
  // Add the nodes
  let node = sankeyMainGroup.append("g")
                  .attr("class", "nodes")
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
}

    // initial render
    updateSankeyDiagram();
    
    // AI generated: Make the update function available globally so it can be called from checkbox events
    window.updateSankeyDiagram = updateSankeyDiagram;
  }
})
.catch(function(error){
    console.log(error);
});


