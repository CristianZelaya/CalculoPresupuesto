// Variables y selectores globales
const formulario    = document.querySelector('#agregar-gasto'),
      listadoGastos = document.querySelector('#gastos ul');
let presupuesto;

// Eventos
const eventListeners = () => {

    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

    formulario.addEventListener('submit', agregarGasto);
}

// Clases
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto( gasto ) {
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    calcularRestante() {
        const gastado = this.gastos.reduce( ( total, gasto ) =>  total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter( gasto => gasto.id !== id );
        this.calcularRestante();
    }

}

class UI {
    insertarPresupuesto( cantidad ) {
        const { presupuesto, restante} = cantidad;
        document.querySelector('#total').innerHTML = presupuesto;
        document.querySelector('#restante').innerHTML = restante;
    }

    imprimirAlerta( mensaje, tipo ) {
        // crear el div mensaje
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert');

        if ( tipo === 'error' ) {
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        divMensaje.innerHTML = mensaje;
        document.querySelector('.primario').insertBefore(divMensaje, formulario);

        setTimeout(() => {
            divMensaje.remove();
        }, 3000);

    }

    mostrarGastos( gastos ) {

        // Elimina el html previo
        this.limpiarHtml();

        gastos.forEach(({nombre, cantidad, id}) => {
    
            // Crear LI
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = ('list-group-item d-flex justify-content-between align-items-center');
            nuevoGasto.dataset.id = id;

            // Agregar HTML del gasto
            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill"> $${cantidad} </span>`;

            // Boton para borrar el gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times'
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }
            nuevoGasto.appendChild(btnBorrar);

            // Aegragar el html
            listadoGastos.appendChild(nuevoGasto);
        });
    }

    limpiarHtml() {
        while( listadoGastos.firstChild ) {
            listadoGastos.removeChild(listadoGastos.firstChild);
        }
    }

    actualizarRestante( restante ) {
        document.querySelector('#restante').innerHTML = restante;
    }

    comprobarPresupuesto( presupuestoObj ) {
        const { presupuesto, restante } = presupuestoObj;
        const divRestante = document.querySelector('.restante');
        
        // Comprobar 25%
        if ( (presupuesto / 4) > restante ) {
            divRestante.classList.remove('alert-success', 'alert-warning');
            divRestante.classList.add('alert-danger');
        } else if ( (presupuesto / 2) > restante ) {
            divRestante.classList.remove('alert-success');
            divRestante.classList.add('alert-warning');
        } else {
            divRestante.classList.remove('alert-danger', 'alert-warning');
            divRestante.classList.add('alert-success');
        }

        if ( restante <= 0 ) {
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }

}

// Instancia de interfazar de usuario
const ui = new UI();

// Funciones
const preguntarPresupuesto = () => {

    let presupuestoUsuario = prompt('¿Cual es tu presupuesto?');

    if ( presupuestoUsuario === '' || presupuestoUsuario === null || presupuestoUsuario <= 0 || isNaN(presupuestoUsuario)){
        window.location.reload();
    }

    // Instanciar presupuesto
    presupuesto = new Presupuesto(presupuestoUsuario);

    ui.insertarPresupuesto(presupuesto);
    
}

const agregarGasto = (e) => {

    e.preventDefault();

    const nombre = document.querySelector('#gasto').value,
          cantidad = Number(document.querySelector('#cantidad').value);
    
    if (nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
        return;
    } else if ( cantidad <= 0 || isNaN(cantidad) ) {
        ui.imprimirAlerta('Cantidad no valida', 'error');
        return;
    } else if (cantidad > presupuesto.restante) {
        ui.imprimirAlerta('La cantidad excede el presupuesto', 'error');
        return;
    }

    // Generar un objeto con el gasto
    const gasto = { nombre, cantidad, id: Date.now() }

    // Añade nuevo gasto
    presupuesto.nuevoGasto( gasto );
    
    // Mensaje de todo bien
    ui.imprimirAlerta('Gasto agregado correctamente');

    // Muestra los el listado de gatos
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos( gastos )
    
    // Actualizar restante 
    ui.actualizarRestante( restante );

    // Pintar el restante de otro color
    ui.comprobarPresupuesto( presupuesto );

    // Reinicia el formulario
    formulario.reset();
}

const eliminarGasto = ( id ) => {
    presupuesto.eliminarGasto(id);
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante( restante );
    ui.comprobarPresupuesto( presupuesto );
}

eventListeners();