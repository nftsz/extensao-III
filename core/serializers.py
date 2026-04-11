from rest_framework import generics, serializers
from django.db import transaction
from .models import Garcom, Produto, Comanda, ItemComanda


class GarcomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Garcom
        fields = '__all__'


class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = '__all__'


# =========================
# ITEM COMANDA (LEITURA + UPDATE)
# =========================

class ItemComandaSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(
        source='produtos.nome', read_only=True)

    class Meta:
        model = ItemComanda
        fields = [
            'id',
            'comanda',
            'produtos',
            'produto_nome',
            'quantidade',
            'preco_unitario',
            'subtotal',
            'garcom'
        ]
        read_only_fields = ['subtotal', 'preco_unitario']

    def update(self, instance, validated_data):
        if instance.comanda.status == 'FECHADA':
            raise serializers.ValidationError("Comanda fechada.")

        nova_qtd = validated_data.get('quantidade', instance.quantidade)

        if nova_qtd <= 0:
            raise serializers.ValidationError("Quantidade inválida.")

        diferenca = nova_qtd - instance.quantidade
        produto = instance.produtos

        with transaction.atomic():
            produto = Produto.objects.select_for_update().get(id=produto.id)

            if diferenca > 0 and produto.estoque < diferenca:
                raise serializers.ValidationError("Estoque insuficiente.")

            produto.estoque -= diferenca
            produto.save()

            instance.quantidade = nova_qtd
            instance.save()

        return instance


# =========================
# ITEM COMANDA (CREATE)
# =========================

class ItemComandaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemComanda
        fields = [
            'comanda',
            'produtos',
            'quantidade',
            'garcom'
        ]

    def validate(self, data):
        produto = data['produtos']
        comanda = data['comanda']
        quantidade = data['quantidade']

        if comanda.status == 'FECHADA':
            raise serializers.ValidationError("Comanda fechada.")

        if not produto.ativo:
            raise serializers.ValidationError("Produto inativo.")

        if quantidade <= 0:
            raise serializers.ValidationError("Quantidade inválida.")

        if produto.estoque < quantidade:
            raise serializers.ValidationError("Estoque insuficiente.")

        return data

    def create(self, validated_data):
        with transaction.atomic():
            produto = Produto.objects.select_for_update().get(
                id=validated_data['produtos'].id
            )

            comanda = validated_data['comanda']
            quantidade = validated_data['quantidade']

            # verifica se já existe item desse produto na comanda
            item_existente = ItemComanda.objects.filter(
                comanda=comanda,
                produtos=produto
            ).first()

            if item_existente:
                nova_qtd = item_existente.quantidade + quantidade

                if produto.estoque < quantidade:
                    raise serializers.ValidationError("Estoque insuficiente.")

                produto.estoque -= quantidade
                produto.save()

                item_existente.quantidade = nova_qtd
                item_existente.save()

                return item_existente

            if produto.estoque < quantidade:
                raise serializers.ValidationError("Estoque insuficiente.")

            produto.estoque -= quantidade
            produto.save()

            return ItemComanda.objects.create(
                preco_unitario=produto.preco,
                **validated_data
            )

# =========================
# COMANDA
# =========================


class ComandaSerializer(serializers.ModelSerializer):
    itens = ItemComandaSerializer(many=True, read_only=True)
    garcom_nome = serializers.CharField(source='garcom.nome', read_only=True)

    class Meta:
        model = Comanda
        fields = [
            'id',
            'numero',
            'identificador',
            'status',
            'total',
            'criado_em',
            'fechado_em',
            'garcom',
            'garcom_nome',
            'itens'
        ]
        read_only_fields = [
            'numero',
            'total',
            'criado_em',
            'fechado_em',
            'status'
        ]

    def update(self, instance, validated_data):
        novo_status = validated_data.get('status', instance.status)

        # ❌ impedir fechar comanda vazia
        if novo_status == 'FECHADA' and not instance.itens.exists():
            raise serializers.ValidationError(
                "Comanda vazia não pode ser fechada.")

        # ❌ impedir editar comanda já fechada
        if instance.status == 'FECHADA':
            raise serializers.ValidationError("Comanda já está fechada.")

        return super().update(instance, validated_data)
