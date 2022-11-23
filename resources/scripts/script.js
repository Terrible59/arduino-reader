const ws = new WebSocket('ws://localhost:3100');

const numbers = [
    new countUp.CountUp('number1', 0),
    new countUp.CountUp('number2', 0),
    new countUp.CountUp('number3', 0),
    new countUp.CountUp('number4', 0),
    new countUp.CountUp('number5', 0),
];

for (let i = 0; i < 5; i++) {
    if (numbers[i].error) {
        console.log(numbers[i].error);
    }
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
        chartData[i][date] = serverData[i];
        charts[i].update();
        numbers[i].update(serverData[i]);
    }
}

function makeChart(number, label) {
    const ctx = document.getElementById(`chart${number + 1}`);
    return new Chart(ctx, {
        type: 'line',
        data: {
          labels: Object.keys(chartData[number]),
          datasets: [{
            label: label,
            data: chartData[number],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
    });
}

const chartData = [{}, {}, {}, {}, {}];

const charts = [
    makeChart(0, 'Температура'),
    makeChart(1, 'Температура'),
    makeChart(2, 'Температура'),
    makeChart(3, 'Температура'),
    makeChart(4, 'Температура')
];

