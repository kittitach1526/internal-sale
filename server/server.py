from fastapi import FastAPI
import uvicorn
from routers import user, fostec_product
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev ใช้แบบนี้ก่อน
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# include router
app.include_router(user.router, prefix="/api")
app.include_router(fostec_product.router, prefix="/api")

# run server
if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )