// base dimensions
const scatterWidth = 540;
const scatterHeight = 540;

const pieWidth = 540;
const pieHeight = 540

// Scatter Margins
let scatterMargin = {top: 30, right: 30, bottom: 50, left: 60};
const innerScatterWidth = scatterWidth - scatterMargin.left - scatterMargin.right;
const innerScatterHeight = scatterHeight - scatterMargin.top - scatterMargin.bottom;

// Pie Chart Margins
let pieMargin = {top: 10, right: pieWidth * .25, bottom: 30, left: 30};
const innerPieWidth = pieWidth - pieMargin.left - pieMargin.right;
const innerPieHeight = pieHeight - pieMargin.top - pieMargin.bottom;;

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

    // Add doberman references
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
    const weightLineY = zy(40);
    const heightLineX = zx(.71);
    
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
  }

  /* PIE CHART */
  {
    const pieSvg = d3.select("#danger-plot")
                     .attr("width", pieWidth)
                     .attr("height", pieHeight)
                     .attr("viewBox", `0 0 ${pieWidth} ${pieHeight}`)
                     .attr("preserveAspectRatio", "xMidYMid meet");

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
      .attr("transform", "translate(" + ((pieWidth / 4) + (pieWidth / 6))  + "," + pieHeight / 2 + ")");

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
})
.catch(function(error){
    console.log(error);
});
