# Веб-приложение для мониторинга количества вакансий для IT-специалистов с hh.ru

Этот проект представляет собой одностраничное веб-приложение для мониторинга вакансий в области ИТ.
Оно показывает количество вакансий уровня Junior и Middle для Data Analyst, Data Science, Data Engineer, Аналитик данных, Дата-саентист.
Поиск происходит по следующим регионам: Москва, Санкт-Петербург, Новосибирская область, Томская область, Нижегородская область и Свердловская область.
Загрузка данных занимает порядка 10с. Во время загрузки данных в консоли происходит логирование данного процесса. 

## Содержание

- [Установка](#установка)
- [Запуск приложения](#запуск-приложения)
- [Использование](#использование)

## Установка
1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/K0BERZ/hhParser.git
   cd hhParser
   ```

2. Создайте и активируйте виртуальное окружение:
    ```bash
    python -m venv venv
    source venv/bin/activate  # Для Windows используйте `venv\Scripts\activate`
    ```
3. Установите необходимые библиотеки:
    ```bash
    pip install -r requirements.txt
    ```
   
## Запуск приложения

После установки всех зависимостей и необходимых ресурсов запустите приложение с помощью команды:

   ```bash
    uvicorn app.main:app --reload
   ```

## Использование

1. После запуска приложения в браузере перейдите по ссылке [http://127.0.0.1:8000](http://127.0.0.1:8000)
2. Подождите, пока данные загрузятся
