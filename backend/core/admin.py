from django.contrib import admin
from .models import Garcom, Produto, Comanda, ItemComanda

admin.site.register(Garcom)
admin.site.register(Produto)
admin.site.register(Comanda)
admin.site.register(ItemComanda)
