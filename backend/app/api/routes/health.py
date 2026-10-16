from fastapi import APIRouter

router = APIRouter(
    tags=["Health"],
)


@router.get("/health")
@router.get("/health/")
@router.get("/api/v1/health")
@router.get("/api/v1/health/")
async def health_check():
    return {
        "status": "ok",
        "service": "MOM Creator API",
    }