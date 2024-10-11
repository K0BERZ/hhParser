//document.addEventListener("DOMContentLoaded", function () {
//    startLoading();
//
//    function startLoading() {
//        // Отправляем начальный запрос на запуск фоновой задачи
//        fetch('/api/vacancies')
//            .then(response => response.json())
//            .then(data => {
//                if (data.status === "loading") {
//                    checkStatus();  // Начинаем проверку статуса загрузки
//                }
//            })
//            .catch(error => console.error("Ошибка при запросе на запуск загрузки:", error));
//    }
//
//    function checkStatus() {
//        // Периодически проверяем статус загрузки данных
//        setTimeout(function () {
//            fetch('/api/status')
//                .then(response => response.json())
//                .then(data => {
//                    if (data.status === "ready") {
//                        document.getElementById("spinner").style.display = "none";  // Скрываем индикатор загрузки
//                        document.getElementById("charts-container").style.display = "block";  // Показываем контейнер графиков
//                        renderCharts(data.data);  // Отрисовываем графики с готовыми данными
//                    } else if (data.status === "loading") {
//                        checkStatus();  // Данные еще загружаются, продолжаем проверку
//                    }
//                })
//                .catch(error => console.error("Ошибка при проверке статуса:", error));
//        }, 1000);  // Проверяем каждые 1 секунду
//    }
//
//    function renderCharts(data) {
//        const chartsContainer = document.getElementById("charts-container");
//        chartsContainer.innerHTML = "";  // Очищаем контейнер перед добавлением графиков
//
//        for (const position in data) {
//            const chartContainer = document.createElement('div');
//            chartContainer.style.marginBottom = '20px';
//
//            const canvas = document.createElement('canvas');
//            canvas.id = `chart-${position.replace(/ /g, "_")}`;  // Заменяем пробелы на _
//            chartContainer.appendChild(canvas);
//            chartsContainer.appendChild(chartContainer);
//
//            const datasets = [];
//            const labels = Object.keys(regions);  // Используем названия регионов
//
//            // Добавляем данные для Junior
//            datasets.push({
//                label: 'Junior',
//                data: data[position].Junior,
//                backgroundColor: 'rgba(75, 192, 192, 0.2)',
//                borderColor: 'rgba(75, 192, 192, 1)',
//                borderWidth: 1
//            });
//
//            // Добавляем данные для Middle
//            datasets.push({
//                label: 'Middle',
//                data: data[position].Middle,
//                backgroundColor: 'rgba(153, 102, 255, 0.2)',
//                borderColor: 'rgba(153, 102, 255, 1)',
//                borderWidth: 1
//            });
//
//            const ctx = canvas.getContext('2d');
//            new Chart(ctx, {
//                type: 'bar',
//                data: {
//                    labels: labels,  // Используем названия регионов
//                    datasets: datasets
//                },
//                options: {
//                    scales: {
//                        y: {
//                            beginAtZero: true
//                        }
//                    },
//                    responsive: true,
//                    maintainAspectRatio: false
//                }
//            });
//
//            // Добавляем заголовок для графика
//            const title = document.createElement('h3');
//            title.textContent = position;  // Подписываем график по профессии
//            chartsContainer.appendChild(title);
//        }
//    }
//});


async function fetchVacancies() {
    try {
        const response = await fetch('/api/vacancies');
        const data = await response.json();

        if (data.status === 'loading') {
            console.log('Загрузка данных, подождите...'); // Логируем, что идет загрузка
            // Здесь можно добавить код для периодического опроса статуса
            const checkStatus = setInterval(async () => {
                const statusResponse = await fetch('/api/status');
                const statusData = await statusResponse.json();
                if (statusData.status === 'ready') {
                    clearInterval(checkStatus);
                    renderCharts(statusData.data);
                    document.getElementById('spinner').style.display = 'none'; // Скрываем индикатор загрузки
                    document.getElementById('charts-container').style.display = 'block'; // Показываем контейнер с графиками
                }
            }, 1000); // Проверяем статус каждые 1000 мс
        } else {
            console.error('Ошибка при загрузке данных:', data);
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    }
}

// Вызываем функцию после загрузки страницы
document.addEventListener('DOMContentLoaded', fetchVacancies);

function renderChart(position, data) {
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    document.getElementById('charts-container').appendChild(chartContainer);

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar', // Тип графика
        data: {
            labels: ['Москва', 'Санкт-Петербург', 'Новосибирская область', 'Томская область', 'Нижегородская область', 'Свердловская область'],
            datasets: [{
                label: position,
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true // Начинаем с нуля
                }
            }
        }
    });
}

//function renderCharts(data) {
//    for (const position in data) {
//        for (const level in data[position]) {
//            const vacanciesData = data[position][level]; // Получаем количество вакансий
//            console.log(`Отрисовка графика для ${position} ${level} с данными:`, vacanciesData);
//            renderChart(`${position} ${level}`, vacanciesData); // Рендерим график для профессии и уровня
//        }
//    }
//}
function renderCharts(data) {
    const positions = Object.keys(data);
    const regions = ['Москва', 'Санкт-Петербург', 'Новосибирская область', 'Томская область', 'Нижегородская область', 'Свердловская область'];

    // Удаляем предыдущие графики, если они существуют
    document.getElementById('charts-container').innerHTML = '';

    positions.forEach(position => {
        // Собираем данные для Junior и Middle
        const juniorData = data[position]['Junior'];
        const middleData = data[position]['Middle'];

        // Объединяем данные в один массив
        const combinedData = juniorData.map((val, index) => {
            return {
                region: regions[index],
                junior: val,
                middle: middleData[index]
            };
        });

        // Создаем заголовок для графика
        const title = document.createElement('h3');
        title.innerText = position; // Используем название профессии
        title.style.textAlign = 'center'; // Центрируем заголовок
        document.getElementById('charts-container').appendChild(title);

        // Создаем график
        const canvas = document.createElement('canvas');
        document.getElementById('charts-container').appendChild(canvas);

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: combinedData.map(item => item.region), // Названия регионов
                datasets: [{
                    label: 'Junior',
                    data: combinedData.map(item => item.junior), // Данные Junior
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                }, {
                    label: 'Middle',
                    data: combinedData.map(item => item.middle), // Данные Middle
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Количество вакансий'
                        }
                    }
                }
            }
        });
    });
}