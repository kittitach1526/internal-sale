from fastapi import FastAPI
import uvicorn
from routers import user

app = FastAPI()

# include router
app.include_router(user.router, prefix="/api")

# run server
if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )