from django.db import models
from django.db.models import Sum

class Produto(models.Model):
    nome = models.CharField(max_length=100)
    categoria = models.CharField(max_length=50)
    unidade = models.CharField(max_length=20)  # kg, unidade, litro

    ativo = models.BooleanField(default=True)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome

class LoteDoacao(models.Model):
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    quantidade = models.PositiveIntegerField()
    data_expiracao = models.DateField()
    recebido_em = models.DateTimeField(auto_now_add=True)

    @property
    def available_quantity(self):
        distribuido = self.distribuicoes.aggregate(
            total=Sum("quantidade")
        )["total"] or 0

        perca = self.percas.aggregate(
            total=Sum("quantidade")
        )["total"] or 0

        return self.quantidade - distribuido - perca

    def __str__(self):
        return f"{self.produto.nome} - {self.quantidade}{self.produto.unidade}"


class Distribuicao(models.Model):
    lote = models.ForeignKey(
        LoteDoacao,
        related_name="distribuicoes",
        on_delete=models.CASCADE
    )
    quantidade = models.PositiveIntegerField()
    distribuido_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantidade} de {self.lote.produto.nome}"


class Perca(models.Model):
    lote = models.ForeignKey(
        LoteDoacao,
        related_name="percas",
        on_delete=models.CASCADE
    )
    quantidade = models.PositiveIntegerField()
    motivo = models.CharField(max_length=100)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantidade} perdida - {self.motivo}"
