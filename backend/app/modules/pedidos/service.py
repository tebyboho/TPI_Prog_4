from datetime import date, datetime, time

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoNoEncontrado(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class PedidoNoCancelable(Exception):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def _get_pedido(self, uow: PedidoUnitOfWork, id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:  # se restituye aunque el producto esté inactivo
                producto.stock += item.cantidad

    def crear(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("El pedido tiene productos repetidos")

            pedido = Pedido(
                usuario_id=usuario_id,
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                estado="PENDIENTE",
                total=0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto '{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}' (disponible: {producto.stock})"
                    )
                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=item.producto_id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            return PedidoRead.model_validate(pedido)

    def listar(self, usuario: UserPublic, estado: str | None, skip: int, limit: int) -> PedidosPaginados:
        with self.uow as uow:
            if usuario.role == "admin":
                total, pedidos = uow.pedidos.list_all(estado, skip, limit)
            else:
                total, pedidos = uow.pedidos.list_by_usuario(usuario.id, estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get_pedido(uow, id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, id: int, nuevo_estado: str) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get_pedido(uow, id)
            if nuevo_estado not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(f"No se puede pasar de {pedido.estado} a {nuevo_estado}")
            if nuevo_estado == "CANCELADO":
                self._restituir_stock(uow, pedido)
            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now()
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get_pedido(uow, id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != "PENDIENTE":
                raise PedidoNoCancelable("Solo se pueden cancelar pedidos en estado PENDIENTE")
            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now()
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteo = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteo.get("PENDIENTE", 0),
                en_preparacion=conteo.get("EN_PREPARACION", 0),
                entregados=conteo.get("ENTREGADO", 0),
                cancelados=conteo.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_desde(datetime.combine(date.today(), time.min)),
                ingresos_entregados=uow.pedidos.sum_total_por_estado("ENTREGADO"),
            )
