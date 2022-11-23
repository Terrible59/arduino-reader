const ws = new WebSocket('ws://localhost:3100');

const numbers = [
    new countUp.CountUp('number1', 0),
    new countUp.CountUp('number2', 0),
    new countUp.CountUp('number3', 0),
    new countUp.CountUp('number4', 0),
    new countUp.CountUp('number5', 0),
];

for (let i = 0; i < 5; i++) {
    numbers[i].start();
}

ws.onopen = () => {
    console.log('Online')
}

ws.onclose = () => {
    console.log('Disconnected')
}

ws.onmessage = (res) => {
    const serverData = JSON.parse(res.data);
    const date = (new Date()).toLocaleTimeString();

    for (let i = 0; i < 5; i++) {
        if (Object.keys(chartData[i]).length == 7) {
            delete chartData[i][Object.keys(chartData[i])[0]];
        }
        chartData[i][date] = serverData[i];
        charts[i].update();
        numbers[i].update(serverData[i]);
    }
}

function makeChart(number, label, color) {
    const ctx = document.getElementById(`chart${number + 1}`);
    return new Chart(ctx, {
        type: 'line',
        data: {
          labels: Object.keys(chartData[number]),
          datasets: [{
            label: label,
            data: chartData[number],
            borderWidth: 1,
            backgroundColor: color,
            borderColor: color,
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          tension: 0.2,
        }
    });
}

const chartData = [{}, {}, {}, {}, {}];

const charts = [
    makeChart(0, 'Температура', '#D00000'),
    makeChart(1, 'Скорость', '#FFBA08'),
    makeChart(2, 'Давление', '#3F88C5'),
    makeChart(3, 'Запас топлива', '#032B43'),
    makeChart(4, 'Еще один датчик', '#136F63')
];