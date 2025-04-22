// script.js – D3 Bar Chart implementation

// Set up margin convention
const margin = { top: 40, right: 140, bottom: 100, left: 60 },
      outerWidth = 800,
      outerHeight = 450,
      width = outerWidth - margin.left - margin.right,
      height = outerHeight - margin.top - margin.bottom;

// Select the SVG and apply the outer dimensions (useful if you tweak in CSS later)
const svg = d3
  .select("#chart")
  .attr("width", outerWidth)
  .attr("height", outerHeight);

// Chart group inside the margins
const chartG = svg
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Global scales (will be populated after the data loads)
const xScale = d3.scaleBand().padding(0.1);
const yScale = d3.scaleLinear();
const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

// Axis generators (will be configured after the data loads)
const xAxisG = chartG.append("g").attr("class", "axis x-axis").attr("transform", `translate(0,${height})`);
const yAxisG = chartG.append("g").attr("class", "axis y-axis");

// Tooltip (optional / extra‑credit)
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip");

// Load the data and render the chart
// Parse numeric values as numbers using row conversion function
function rowConverter(d) {
  return { ...d, value: +d.value };
}

d3.csv("data.csv", rowConverter).then((data) => {
  // -----------------------------
  // 1.  Update scales’ domains & ranges
  // -----------------------------
  xScale.domain(data.map((d) => d.name)).range([0, width]);
  yScale.domain([0, d3.max(data, (d) => d.value)]).nice().range([height, 0]);
  const categories = Array.from(new Set(data.map((d) => d.category)));
  colorScale.domain(categories);

  // -----------------------------
  // 2.  Draw / update axes
  // -----------------------------
  xAxisG
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end");

  yAxisG.call(d3.axisLeft(yScale));

  // -----------------------------
  // 3.  Enter‑Update pattern for bars
  // -----------------------------
  const bars = chartG.selectAll("rect.bar").data(data, (d) => d.name);

  // ENTER -------------
  const barsEnter = bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.name))
    .attr("y", height)
    .attr("width", xScale.bandwidth())
    .attr("height", 0)
    .attr("fill", (d) => colorScale(d.category))
    .on("mouseover", (event, d) => {
      tooltip
        .transition()
        .duration(150)
        .style("opacity", 1);
      tooltip
        .html(`<strong>${d.name}</strong><br/>${d.value}`)
        .style("left", `${event.pageX + 12}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", () => {
      tooltip.transition().duration(150).style("opacity", 0);
    });

  // UPDATE + ENTER merged (so we can animate both)
  barsEnter
    .merge(bars)
    .transition()
    .duration(800)
    .attr("x", (d) => xScale(d.name))
    .attr("y", (d) => yScale(d.value))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => height - yScale(d.value))
    .attr("fill", (d) => colorScale(d.category));

  // EXIT ------------- (not strictly necessary for static chart but keeps pattern complete)
  bars.exit().transition().duration(400).attr("y", height).attr("height", 0).remove();

  // -----------------------------
  // 4.  Value labels
  // -----------------------------
  const labels = chartG.selectAll("text.bar-label").data(data, (d) => d.name);

  const labelsEnter = labels
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("text-anchor", "middle")
    .attr("x", (d) => xScale(d.name) + xScale.bandwidth() / 2)
    .attr("y", height)
    .text((d) => d.value);

  labelsEnter
    .merge(labels)
    .transition()
    .duration(800)
    .attr("x", (d) => xScale(d.name) + xScale.bandwidth() / 2)
    .attr("y", (d) => yScale(d.value) - 5)
    .text((d) => d.value);

  labels.exit().remove();

  // -----------------------------
  // 5.  Legend
  // -----------------------------
  const legendG = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${margin.left + width + 20},${margin.top})`);

  const legendRow = legendG
    .selectAll("g.legend-row")
    .data(categories)
    .enter()
    .append("g")
    .attr("class", "legend-row")
    .attr("transform", (_d, i) => `translate(0, ${i * 20})`);

  legendRow
    .append("rect")
    .attr("width", 14)
    .attr("height", 14)
    .attr("fill", (d) => colorScale(d));

  legendRow
    .append("text")
    .attr("x", 20)
    .attr("y", 10)
    .attr("dy", "0.32em")
    .text((d) => d);
});
