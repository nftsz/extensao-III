from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .viewsets import (
    ProdutoViewSet,
    LoteDoacaoViewSet,
    PercaViewSet,
    DistribuicaoAPIView,
    DashboardAPIView
)

router = DefaultRouter()

router.register("produtos", ProdutoViewSet)
router.register("lotes", LoteDoacaoViewSet)
router.register("percas", PercaViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("distribuir/", DistribuicaoAPIView.as_view()),
    path("dashboard/", DashboardAPIView.as_view()),
]