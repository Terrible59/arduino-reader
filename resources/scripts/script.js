const ws = new WebSocket('ws://localhost:3100');

const materialColors = [
    '#264653',
    '#2a9d8f',
    '#e9c46a',
    '#f4a261',
    '#e76f51',
    '#023047',
    '#d62828',
    '#9b2226',
    '#386641',
    '#6d6875',
    '#5f0f40',
    '#e07a5f',
    '#81b29a',
    '#415a77',
    '#6b705c',
    '#fdc500',
];

function* generate_id() {
    for (let i = 0;; i++) {
        yield i;
    }
}

const gen_id = generate_id();
const gen_port_id = generate_id();

const custom_port_ids = {};
const charts = [];

const maximums = {};
const averages = {};

ws.onopen = () => {
    console.log('Online')
}

ws.onclose = () => {
    console.log('Disconnected')
}

ws.onmessage = (res) => {
    const date = (new Date()).toLocaleTimeString();
    const serverData = JSON.parse(res.data);
    const {id_port, data} = serverData;

    if (charts.map(ch => ch.id_port).includes(id_port)) {
        const custom_id = custom_port_ids[id_port];
        const port_charts = charts.filter(chart => chart.id_port === id_port).sort((a, b) => a.data_index - b.data_index);

        for (let i = 0; i < data.length; i++) {
            const chart = port_charts.find(ch => ch.data_index === i);

            if (chart.data.length === 7) {
                chart.data.shift();
                chart.labels.shift();
            }

            chart.labels.push(date);
            chart.data.push(data[i]);

            if (!maximums[chart.chart_id] || data[i] > maximums[chart.chart_id]) {
                maximums[chart.chart_id] = data[i];
            }

            if (!averages[chart.chart_id]) {
                averages[chart.chart_id] = data[i];
            } else {
                averages[chart.chart_id] = (averages[chart.chart_id] + data[i]) / 2;
            }

            let average = document.querySelector(`.data-item-val_average[data-chart="${chart.chart_id}"]>span`);
            let max = document.querySelector(`.data-item-val_max[data-chart="${chart.chart_id}"]>span`);

            average.innerHTML = averages[chart.chart_id];
            max.innerHTML = maximums[chart.chart_id];

            chart.number.update(data[i]);
            chart.chart.update();
        }
    } else {
        const custom_port_id = gen_port_id.next().value;
        custom_port_ids[id_port] = custom_port_id;
	  const chartWrapperHtml = `
		        <div class="data-item" data-item="${custom_port_id}">
		            <h4 class="data-item__heading">${id_port}</h4>
		            <div class="data-card-wrapper">
		            </div>
		        </div>
			`;
	  document.querySelector(`.container`).insertAdjacentHTML("beforeend", chartWrapperHtml);

        for (let i = 0; i < data.length; i++) {
            const chart = makeChart(materialColors[Math.floor(Math.random()*materialColors.length)], id_port, i, custom_port_id);
            charts.push(chart);
        }
    }
}

function makeChart(color, id_port, data_index, custom_port_id) {
    const chart_id = gen_id.next().value;
    
    const chart_html = `
            <div class="data-card">
                <div class="data-item-wrapper">
                    <div class="data-card__value"><span id="number_${chart_id}">0</span></div>
                    <div class="data-item-val data-item-val_max" data-chart="${chart_id}">Максимум: <span></span></div>
                    <div class="data-item-val data-item-val_average" data-chart="${chart_id}">Среднее: <span></span></div>
                </div>
                <div class="data-card__chart">
                    <canvas id="chart_${chart_id}"></canvas>
                </div>
            </div>
    `;
    document.querySelector(`.data-item[data-item="${custom_port_id}"] .data-card-wrapper`).insertAdjacentHTML("beforeend", chart_html);
    const ctx = document.getElementById(`chart_${chart_id}`);

    const number = new countUp.CountUp(`number_${chart_id}`, 0, {decimalPlaces: 2, separator: ' '});
    number.start();

    const data = [];
    const labels = [];

    return {
        custom_port_id,
        data,
        labels,
        data_index,
        chart_id,
        number,
        id_port,
        chart: new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: data_index,
                    data: data,
                    borderWidth: 1,
                    backgroundColor: color,
                    borderColor: color,
                }]
            },
            options: {
                decimation: {
                    enabled: false,
                    algorithm: 'min-max',
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                tension: 0.2,
            }
        })
    };
}
