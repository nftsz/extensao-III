from rest_framework import serializers
from core.models import Produto, LoteDoacao, Distribuicao, Perca


class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = "__all__"

class LoteDoacaoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.ReadOnlyField(source='produto.nome', read_only=True)
    produto_unidade = serializers.ReadOnlyField(source='produto.unidade', read_only=True)
    available_quantity = serializers.ReadOnlyField()

    class Meta:
        model = LoteDoacao
        fields = ['id', 'produto', 'produto_nome', 'produto_unidade', 'quantidade', 'available_quantity', 'data_expiracao', 'recebido_em']


class DistribuicaoSerializer(serializers.Serializer):
    produto = serializers.IntegerField()
    quantidade = serializers.IntegerField()


class PercaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perca
        fields = "__all__"
