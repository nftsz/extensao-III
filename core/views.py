from rest_framework import generics, status
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone

from .models import Garcom, Produto, Comanda, ItemComanda
from .serializers import (
    GarcomSerializer,
    ProdutoSerializer,
    ComandaSerializer,
    ItemComandaSerializer,
    ItemComandaCreateSerializer
)


# =========================
# GARÇOM
# =========================

class GarcomListCreateView(generics.ListCreateAPIView):
    queryset = Garcom.objects.all()
    serializer_class = GarcomSerializer


class GarcomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Garcom.objects.all()
    serializer_class = GarcomSerializer


# =========================
# PRODUTO
# =========================

class ProdutoListCreateView(generics.ListCreateAPIView):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer


class ProdutoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer


# =========================
# COMANDA
# =========================

class ComandaListCreateView(generics.ListCreateAPIView):
    serializer_class = ComandaSerializer

    def get_queryset(self):
        queryset = Comanda.objects.all().order_by('-id')

        status_param = self.request.query_params.get('status')

        if status_param:
            return queryset.filter(status=status_param)

        return queryset


class ComandaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comanda.objects.all()
    serializer_class = ComandaSerializer

    def destroy(self, request, *args, **kwargs):
        comanda = self.get_object()

        if comanda.itens.exists():
            return Response(
                {"erro": "Comanda com itens não pode ser excluída. Feche a comanda."},
                status=400
            )

        return super().destroy(request, *args, **kwargs)


# FECHAR COMANDA

class FecharComandaView(generics.UpdateAPIView):
    queryset = Comanda.objects.all()
    serializer_class = ComandaSerializer  

    def update(self, request, *args, **kwargs):
        comanda = self.get_object()

        if comanda.status == 'FECHADA':
            return Response({"erro": "Já fechada"}, status=400)

        if not comanda.itens.exists():
            return Response({"erro": "Comanda vazia"}, status=400)

        comanda.status = 'FECHADA'
        comanda.fechado_em = timezone.now()
        comanda.save()

        return Response({"msg": "Comanda fechada"})


# CANCELAR COMANDA

class CancelarComandaView(generics.DestroyAPIView):
    queryset = Comanda.objects.all()

    def destroy(self, request, *args, **kwargs):
        comanda = self.get_object()

        if comanda.itens.exists():
            return Response(
                {"erro": "Comanda não está vazia"},
                status=status.HTTP_400_BAD_REQUEST
            )

        comanda.delete()
        return Response(status=204)


# =========================
# ITEM DA COMANDA
# =========================

class ItemComandaListCreateView(generics.ListCreateAPIView):
    queryset = ItemComanda.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ItemComandaCreateSerializer
        return ItemComandaSerializer


class ItemComandaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ItemComanda.objects.all()
    serializer_class = ItemComandaSerializer

    def perform_destroy(self, instance):
        if instance.comanda.status == 'FECHADA':
            raise Exception("Comanda fechada.")

        with transaction.atomic():
            produto = Produto.objects.select_for_update().get(id=instance.produtos.id)

            produto.estoque += instance.quantidade
            produto.save()

            instance.delete()