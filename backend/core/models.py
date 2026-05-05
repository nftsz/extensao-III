from django.db import models

# Create your models here.
class Garcom(models.Model):
    nome = models.CharField(max_length=150)

    def __str__(self):
        return self.nome


class Produto(models.Model):
    nome = models.CharField(max_length=100)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    estoque = models.IntegerField()

    ativo = models.BooleanField(default=True)

    def __str__(self):
        return self.nome


class Comanda(models.Model):
    STATUS_CHOICES = [
        ('ABERTA', 'Aberta'),
        ('FECHADA', 'Fechada')
    ]

    identificador = models.CharField(max_length=100) # nome da mesa ou do cliente
    numero = models.CharField(max_length=10, unique=True, blank=True) # numero da comanda

    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default='ABERTA')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0) # valor subtotal de itens

    criado_em = models.DateTimeField(auto_now_add=True)
    fechado_em = models.DateTimeField(null=True, blank=True)

    garcom = models.ForeignKey(Garcom, on_delete=models.SET_NULL, null=True)

    def save(self, *args, **kwargs):
        if not self.numero:
            ultimo = Comanda.objects.order_by('-id').first()

            if ultimo and ultimo.numero:
                novo_num = int(ultimo.numero) + 1
            else:
                novo_num = 1

            self.numero = str(novo_num).zfill(3)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.numero} - {self.identificador}"


class ItemComanda(models.Model):
    comanda = models.ForeignKey(
        Comanda, on_delete=models.CASCADE, related_name='itens')
    produtos = models.ForeignKey(Produto, on_delete=models.SET_NULL, null=True)

    quantidade = models.IntegerField()
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    garcom = models.ForeignKey(Garcom, on_delete=models.SET_NULL, null=True)

    def save(self, *args, **kwargs):
        self.subtotal = self.quantidade * self.preco_unitario
        super().save(*args, **kwargs)

        total = sum(item.subtotal for item in self.comanda.itens.all())
        self.comanda.total = total
        self.comanda.save()
