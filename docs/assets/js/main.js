const API_URL = 'https://infobencanajkmv2.jkm.gov.my/api/data-dashboard-table-pps.php?a=0&b=0&seasonmain_id=208&seasonnegeri_id=';

async function fetchData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        updateDashboard(data);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('chart').innerHTML = 'Error loading data';
        document.querySelector('#data-table tbody').innerHTML = '<tr><td colspan="5">Error loading data</td></tr>';
    }
}

function updateDashboard(data) {
    // Update stats
    document.getElementById('total-pps').textContent = data.length;
    document.getElementById('total-victims').textContent = data.reduce((sum, item) => sum + (parseInt(item.jumlah_mangsa) || 0), 0);
    document.getElementById('total-families').textContent = data.reduce((sum, item) => sum + (parseInt(item.jumlah_keluarga) || 0), 0);
    
    // Update timestamp
    document.getElementById('last-update').textContent = new Date().toLocaleString();
    
    // Create visualizations
    createChart(data);
    createTable(data);
}

function createChart(data) {
    const margin = {top: 20, right: 20, bottom: 60, left: 40};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear existing chart
    d3.select('#chart').html('');

    // Process data
    const districtData = d3.group(data, d => d.daerah);
    const chartData = Array.from(districtData, ([key, value]) => ({
        district: key,
        count: value.length
    })).sort((a, b) => b.count - a.count);

    // Create SVG
    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1)
        .domain(chartData.map(d => d.district));

    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(chartData, d => d.count)]);

    // Add bars
    svg.selectAll('.bar')
        .data(chartData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.district))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d.count))
        .attr('height', d => height - y(d.count))
        .attr('fill', '#2196F3');

    // Add value labels
    svg.selectAll('.label')
        .data(chartData)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.district) + x.bandwidth() / 2)
        .attr('y', d => y(d.count) - 5)
        .attr('text-anchor', 'middle')
        .text(d => d.count);

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    svg.append('g')
        .call(d3.axisLeft(y));
}

function createTable(data) {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '';

    data.forEach(item => {
        const row = tbody.insertRow();
        [
            item.nama_pps,
            item.daerah,
            item.jumlah_mangsa,
            item.jumlah_keluarga,
            item.status
        ].forEach(text => {
            const cell = row.insertCell();
            cell.textContent = text;
        });
    });
}

// Initialize dashboard
fetchData();

// Refresh data every 5 minutes
setInterval(fetchData, 5 * 60 * 1000);
