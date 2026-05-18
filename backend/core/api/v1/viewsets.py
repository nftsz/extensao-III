from datetime import date

from django.db.models import Sum
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response

from core.models import Produto, LoteDoacao, Distribuicao, Perca
from .serializers import (
    ProdutoSerializer,
    LoteDoacaoSerializer,
    DistribuicaoSerializer,
    PercaSerializer
)


class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer


class LoteDoacaoViewSet(viewsets.ModelViewSet):
    queryset = LoteDoacao.objects.all()
    serializer_class = LoteDoacaoSerializer
    


class PercaViewSet(viewsets.ModelViewSet):
    queryset = Perca.objects.all()
    serializer_class = PercaSerializer


class DistribuicaoAPIView(APIView):
    def post(self, request):
        serializer = DistribuicaoSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        produto_id = serializer.validated_data["produto"]
        quantidade = serializer.validated_data["quantidade"]

        lotes = LoteDoacao.objects.filter(
            produto_id=produto_id,
            data_expiracao__gte=date.today()
        ).order_by("data_expiracao")

        restante = quantidade

        for lote in lotes:
            disponivel = lote.available_quantity

            if disponivel <= 0:
                continue

            retirar = min(disponivel, restante)

            Distribuicao.objects.create(
                lote=lote,
                quantidade=retirar
            )

            restante -= retirar

            if restante == 0:
                break

        if restante > 0:
            return Response(
                {"erro": "Estoque insuficiente"},
                status=400
            )

        return Response(
            {"mensagem": "Distribuição realizada"},
            status=201
        )


class DashboardAPIView(APIView):
    def get(self, request):
        total_recebido = LoteDoacao.objects.aggregate(
            total=Sum("quantidade")
        )["total"] or 0

        total_distribuido = Distribuicao.objects.aggregate(
            total=Sum("quantidade")
        )["total"] or 0

        total_perdido = Perca.objects.aggregate(
            total=Sum("quantidade")
        )["total"] or 0

        return Response({
            "total_recebido": total_recebido,
            "total_distribuido": total_distribuido,
            "total_perdido": total_perdido
        })
