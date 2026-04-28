from fastapi import FastAPI
import uvicorn
from routers import user, fostec_product,measuring_work, group_cost, cost, sales, product_category, product_type, auth, group_user
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
app.include_router(measuring_work.router, prefix="/api")
app.include_router(group_cost.router, prefix="/api")
app.include_router(cost.router, prefix="/api")
app.include_router(sales.router, prefix="/api")
app.include_router(product_category.router, prefix="/api")
app.include_router(product_type.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(group_user.router, prefix="/api")

# run servers
if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )