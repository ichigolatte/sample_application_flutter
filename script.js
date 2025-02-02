// script.js
let csvData = '';

document.getElementById('csvFileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
  const fileInput = event.target;
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function(e) {
      csvData = e.target.result;
      visualizeData(csvData, document.getElementById('chartType').value, document.getElementById('columnSelect').value);
    };

    reader.readAsText(file);
  }
}

function updateChart() {
  visualizeData(csvData, document.getElementById('chartType').value, document.getElementById('columnSelect').value);
}

function visualizeData(csvData, chartType, columnCount) {
  // Parse CSV data
  const data = d3.csvParse(csvData);

  // Set up dimensions of the chart
  const width = 600;
  const height = 400;

  // Remove existing chart
  d3.select('#chart').selectAll('*').remove();

  // Create SVG container
  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Create scales
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.x))
    .range([0, width])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d3.max(Object.values(d).slice(1)))])
    .range([height, 0]);

  // Create color scale
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  // Create chart based on user selection
  if (chartType === 'bar') {
    // Create bars
    svg.selectAll('.barGroup')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'barGroup')
      .attr('transform', d => `translate(${xScale(d.x)}, 0)`)
      .selectAll('rect')
      .data(d => Object.entries(d).slice(1))
      .enter()
      .append('rect')
      .attr('x', d => xScale.bandwidth() / Object.entries(data[0]).length * parseInt(d[0]))
      .attr('y', d => yScale(+d[1]))
      .attr('width', xScale.bandwidth() / Object.entries(data[0]).length)
      .attr('height', d => height - yScale(+d[1]))
      .attr('fill', (d, i) => colorScale(i));
  } else if (chartType === 'line') {
    // Create line
    const line = d3.line()
      .x(d => xScale(d.x) + xScale.bandwidth() / 2)
      .y(d => yScale(+d.y));

    svg.append('path')
      .data([data])
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'blue');
  } else if (chartType === 'scatter') {
    // Create circles for scatter plot
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.x) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(+d.y))
      .attr('r', 5)
      .attr('fill', 'blue');
  } else if (chartType === 'table') {
    // Create table
    const table = d3.select('#chart')
      .append('table')
      .style('border-collapse', 'collapse')
      .style('width', '100%');

    // Add header
    const thead = table.append('thead');
    thead.append('tr')
      .selectAll('th')
      .data(data.columns.slice(0, columnCount > 0 ? columnCount : data.columns.length))
      .enter()
      .append('th')
      .text(d => d)
      .style('border', '1px solid #dddddd')
      .style('text-align', 'left')
      .style('padding', '8px');

    // Add rows
    const tbody = table.append('tbody');
    const rows = tbody.selectAll('tr')
      .data(data)
      .enter()
      .append('tr');

    // Add cells
    const cells = rows.selectAll('td')
      .data(d => Object.values(d).slice(0, columnCount > 0 ? columnCount : Object.values(d).length))
      .enter()
      .append('td')
      .text(d => d)
      .style('border', '1px solid #dddddd')
      .style('text-align', 'left')
      .style('padding', '8px');
  }

  // Add x-axis
  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  // Add y-axis
  svg.append('g')
    .call(d3.axisLeft(yScale));
}
