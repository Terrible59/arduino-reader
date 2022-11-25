const ws = new WebSocket('ws://localhost:3100');

function* generate_id() {
    for (let i = 0;; i++) {
        yield i;
    }
}

const gen_id = generate_id();

const charts = []

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
        const port_charts = charts.filter(chart => chart.id_port === id_port).sort((a, b) => a.data_index - b.data_index);

        for (let i = 0; i < data.length; i++) {
            const chart = port_charts.find(ch => ch.data_index === i);

            if (chart.data.length === 7) {
                chart.data.shift();
                chart.labels.shift();
            }

            chart.labels.push(date);
            chart.data.push(data[i]);

            chart.number.update(data[i]);
            chart.chart.update();
        }
    } else {
        for (let i = 0; i < data.length; i++) {
            const chart = makeChart('#D00000', id_port, i);
            charts.push(chart);
        }
    }
}

function makeChart(color, id_port, data_index) {
    const chart_id = gen_id.next().value;

    const chart_html = `
            <div class="data-card">
                <div class="data-card__heading">${id_port}</div>
                <div class="data-card__value"><span id="number_${chart_id}">0</span></div>
                <div class="data-card__chart">
                    <canvas id="chart_${chart_id}"></canvas>
                </div>
            </div>
    `;
    document.querySelector(".data-card-wrapper").insertAdjacentHTML("beforeend", chart_html)
    const ctx = document.getElementById(`chart_${chart_id}`);

    const number = new countUp.CountUp(`number_${chart_id}`, 0, {decimalPlaces: 2, separator: ' '});
    number.start();

    const data = [];
    const labels = [];

    return {
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