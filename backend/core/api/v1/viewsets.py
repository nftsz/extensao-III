from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

from django.db import transaction
from django.utils import timezone

from models import Garcom, Produto, Comanda, ItemComanda
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

class GarcomViewSet(viewsets.ModelViewSet):
    queryset = Garcom.objects.all()
    serializer_class = GarcomSerializer


# =========================
# PRODUTO
# =========================

class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer


# =========================
# COMANDA
# =========================

class ComandaViewSet(viewsets.ModelViewSet):
    serializer_class = ComandaSerializer

    def get_queryset(self):
        queryset = Comanda.objects.all().order_by('-id')
        status_param = self.request.query_params.get('status')

        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset

    def destroy(self, request, *args, **kwargs):
        comanda = self.get_object()

        if comanda.itens.exists():
            return Response(
                {"erro": "Comanda com itens não pode ser excluída. Feche a comanda."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().destroy(request, *args, **kwargs)

    # 🔥 FECHAR COMANDA
    @action(detail=True, methods=['post'])
    def fechar(self, request, pk=None):
        comanda = self.get_object()

        if comanda.status == 'FECHADA':
            raise ValidationError("Já fechada")

        if not comanda.itens.exists():
            raise ValidationError("Comanda vazia")

        comanda.status = 'FECHADA'
        comanda.fechado_em = timezone.now()
        comanda.save()

        return Response({"msg": "Comanda fechada"})

    # 🔥 CANCELAR COMANDA
    @action(detail=True, methods=['delete'])
    def cancelar(self, request, pk=None):
        comanda = self.get_object()

        if comanda.itens.exists():
            raise ValidationError("Comanda não está vazia")

        comanda.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# =========================
# ITEM DA COMANDA
# =========================

class ItemComandaViewSet(viewsets.ModelViewSet):
    queryset = ItemComanda.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return ItemComandaCreateSerializer
        return ItemComandaSerializer

    def perform_destroy(self, instance):
        if instance.comanda.status == 'FECHADA':
            raise ValidationError("Comanda fechada.")

        with transaction.atomic():
            produto = Produto.objects.select_for_update().get(id=instance.produto.id)

            produto.estoque += instance.quantidade
            produto.save()

            instance.delete()