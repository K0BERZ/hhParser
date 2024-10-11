from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import asyncio
import aiohttp
import logging

# Инициализация приложения FastAPI
app = FastAPI()

# Статус загрузки
loading_status = {"is_loading": False}

app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

BASE_URL = 'https://api.hh.ru/vacancies'
HEADERS = {'User-Agent': 'Mozilla/5.0'}

positions = ["Data Analyst", "Data Science", "Data Engineer", "Аналитик данных", "Дата-саентист"]
levels = ["Junior", "Middle"]
regions = {
    "Москва": 1,
    "Санкт-Петербург": 2,
    "Новосибирская область": 1202,
    "Томская область": 1203,
    "Нижегородская область": 1524,
    "Свердловская область": 1261,
}

logging.basicConfig(level=logging.INFO)

async def fetch_vacancies(session, params, area_id, keyword, level):
    url = "https://api.hh.ru/vacancies"
    params["area"] = area_id  # добавляем ID региона в параметры
    params["text"] = f"{keyword} {level}"

    try:
        async with session.get(url, params=params) as response:
            if response.status == 200:
                data = await response.json()
                found = data.get("found", 0)  # добавляем безопасное извлечение данных
                logging.info(f"Получены данные для {keyword} {level} в регионе {area_id}: {found} вакансий")
                return found
            else:
                logging.error(f"Ошибка при получении данных для {keyword} в регионе {area_id}: {response.status}")
                return None
    except Exception as e:
        logging.error(f"Ошибка при запросе {keyword} в регионе {area_id}: {e}")
        return None


async def fetch_all_vacancies():
    params = {"per_page": 0}
    async with aiohttp.ClientSession() as session:
        tasks = []
        for area_name, area_id in regions.items():
            for keyword in positions:
                for level in levels:
                    task = asyncio.create_task(fetch_vacancies(session, params, area_id, keyword, level))
                    tasks.append((keyword, level, area_id, task))
                    await asyncio.sleep(0.3)

        results = await asyncio.gather(*(task for _, _, _, task in tasks), return_exceptions=True)

        chart_data = {position: {level: [] for level in levels} for position in positions}

        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logging.error(f"Ошибка при получении данных: {result}")
            elif result is not None:
                keyword, level, area_id = tasks[i][0], tasks[i][1], tasks[i][2]
                chart_data[keyword][level].append(result)  # Обратите внимание на это изменение

        return chart_data


@app.get("/api/vacancies")
async def get_vacancies(background_tasks: BackgroundTasks):
    if not loading_status["is_loading"]:
        background_tasks.add_task(update_vacancies)
        loading_status["is_loading"] = True
    return JSONResponse(content={"status": "loading"})


async def update_vacancies():
    global loading_status
    logging.info("Начата загрузка вакансий...")
    try:
        data = await fetch_all_vacancies()
        loading_status["data"] = data
        loading_status["is_loading"] = False
        logging.info("Загрузка вакансий завершена.")
    except Exception as e:
        logging.error(f"Ошибка при загрузке вакансий: {e}")
        loading_status["is_loading"] = False


# Проверка статуса загрузки
@app.get("/api/status")
async def check_status():
    if loading_status["is_loading"]:
        return JSONResponse(content={"status": "loading"})
    elif "data" in loading_status:
        return JSONResponse(content={"status": "ready", "data": loading_status["data"]})
    else:
        return JSONResponse(content={"status": "idle"})


@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})