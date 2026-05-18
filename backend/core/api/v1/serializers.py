from rest_framework import serializers
from core.models import Produto, LoteDoacao, Distribuicao, Perca


class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = "__all__"


class LoteDoacaoSerializer(serializers.ModelSerializer):
    available_quantity = serializers.ReadOnlyField()

    class Meta:
        model = LoteDoacao
        fields = "__all__"


class DistribuicaoSerializer(serializers.Serializer):
    produto = serializers.IntegerField()
    quantidade = serializers.IntegerField()


class PercaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perca
        fields = "__all__"