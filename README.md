# FlickMatch — Movie & Series Recommender

FlickMatch is a full-stack movie recommendation web application that uses content-based similarity, TMDB metadata, and an interactive UI to help users discover movies related to titles they already love.

The project contains:

A FastAPI backend for recommendation logic, similarity search, TMDB integration, and API endpoints.

A React + Vite frontend with animation-rich poster walls, detailed modals, and a search assistant for finding similar movies.

FlickMatch is designed to be fast, reactive, and beautiful — with subtle animations, shuffle interactions, floating poster walls, and a clean modern UI.

## ✨ Key Features

### Frontend

- Animated floating poster wall (2D movement + idle drift)

- Live poster shuffle with spinning animation and burst effect

- Movie details modal (unified for hovered or recommended items)

- Recommendation panel with:

- Toggle: Movie / Series (Series coming soon)

- Clear input button

- Fetch recommendations using backend API

- TMDB rating displayed instead of similarity score

- Fully responsive modern UI (TailwindCSS)

- Smooth hover, scale, fade-in, and motion effects

### Backend

- FastAPI server with:

  - /api/recommend/{title} → movie similarity recommendations

  - /api/movie/{id} → TMDB movie details

  - /api/wall-movies → paginated, randomizable movie dataset for poster wall

- TMDB API integration

- Precomputed embeddings / TF-IDF similarity

- Efficient multi-page poster wall streaming

## 🧱 Project Structure

```
Main Site/
│
├── FlickMatch/                ← Backend (FastAPI)
│   ├── app/
│   │   ├── main.py
│   │   ├── recommender.py
│   │   ├── tmdb_client.py
│   │   └── ... other backend modules
│   ├── static/
│   ├── templates/
│   ├── requirements.txt
│   └── .env.example
│
├── flickmatch-frontend/       ← Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── api/
│   │   └── ...
│   ├── public/
│   ├── index.html
│   └── package.json
│
└── README.md (this file)
```

## 🚀 How to Run the Full Project

1. Clone the Repository

```
git clone https://github.com/USERNAME/FlickMatch-.git
cd FlickMatch/Main Site
```

### 🛠️ Backend Setup (FastAPI)

1. Navigate to backend

```
cd FlickMatch
```

2. Create virtual environment

```
python -m venv venv
```

3. Activate it

- Windows:

```
venv\Scripts\activate

```

- Mac/Linux:

```
source venv/bin/activate
```

4. Install dependencies

```
pip install -r requirements.txt
```

5. Configure environment

- Create .env inside FlickMatch/:

```
TMDB_API_KEY=YOUR_TMDB_KEY
```

6. Run FastAPI server

```
uvicorn app.main:app --reload
```

7. View API docs

- Swagger: http://127.0.0.1:8000/docs

- ReDoc: http://127.0.0.1:8000/redoc

### 🎨 Frontend Setup (React + Vite)

1. Navigate to frontend

```
cd flickmatch-frontend
```

2. Install npm packages

```
npm install
```

3. Set API Base URL

- Create .env file in flickmatch-frontend/:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

4. Run development server

```
npm run dev
```

- Frontend will start at:
  👉 http://localhost:5173

### 🧪 Testing the Application

#### Test Backend

```
curl "http://127.0.0.1:8000/api/recommend/Inception"
```

- Test Poster Wall

```
curl "http://127.0.0.1:8000/api/wall-movies?limit=60&offset=0"
```

#### Test Frontend

- Open http://localhost:5173

- Hover posters → MovieCard updates

- Press Shuffle → Poster wall refresh

- Open Search → Recommend → Pick a movie

# 📝 Additional Notes

### Data

- Poster wall uses a dataset of ~4,800 movies.

- Recommendations use precomputed similarity scores.

- TMDB API is used for high-quality metadata and posters.

### Series Mode

- UI supports "Series" toggle

- Backend series engine (future update)
