from django.urls import path
from .views import *

urlpatterns = [
    # GARÇOM
    path('garcons/', GarcomListCreateView.as_view()),
    path('garcons/<int:pk>/', GarcomDetailView.as_view()),

    # PRODUTOS
    path('produtos/', ProdutoListCreateView.as_view()),
    path('produtos/<int:pk>/', ProdutoDetailView.as_view()),

    # COMANDAS
    path('comandas/', ComandaListCreateView.as_view()),
    path('comandas/<int:pk>/', ComandaDetailView.as_view()),
    path('comandas/<int:pk>/fechar/', FecharComandaView.as_view()),
    path('comandas/<int:pk>/cancelar/', CancelarComandaView.as_view()),

    # ITENS
    path('itens/', ItemComandaListCreateView.as_view()),
    path('itens/<int:pk>/', ItemComandaDetailView.as_view()),
]
