from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .viewsets import (
    GarcomViewSet,
    ProdutoViewSet,
    ComandaViewSet,
    ItemComandaViewSet,
)

# Router principal
router = DefaultRouter()
router.register(r'garcons', GarcomViewSet)
router.register(r'produtos', ProdutoViewSet)
router.register(r'comandas', ComandaViewSet)
router.register(r'itens', ItemComandaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]