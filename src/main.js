
/*************************************************************/
/* creación de inits */
/*************************************************************/
function init() {
    initIndex()
    initInicio()
    initCarrito()
    initTicket()
    cambiarTema()
}



async function initIndex() {
    if (!document.querySelector("#pagina-index")) return

    establecerNombre()
}

async function initInicio() {
    if (!document.querySelector("#pagina-inicio")) return

    ({ teclados, mouses } = await cargarDatos())
    ultimoArray = teclados
    imprimirProductos(teclados)
    cambiarPagina()
}

function initCarrito() {
    if (!document.querySelector("#pagina-carrito")) return

    imprimirTabla()
    imprimirTicket()

}

function initTicket() {
    if (!document.querySelector("#pagina-ticket")) return

    /* Lógica ticket */
}




/*************************************************************/
/* Exclusivo de pantalla Index */
/*************************************************************/

function establecerNombre() {
    let botonContinuar = document.getElementById('btn-continuar')

    if (!botonContinuar) return

    let inputNombre = document.getElementById('input-nombre')

    botonContinuar.addEventListener('click', (e) => {
        let nombre = inputNombre.value.trim()
        if (nombre === "") {
            alert("El nombre no puede estar vacío")
        } else {
            localStorage.setItem('nombre', nombre)
            window.location.href = 'pages/cliente/inicio.html'
        }
    })
}




/*************************************************************/
/* Exclusivo de pantalla Inicio */
/*************************************************************/
async function cargarDatos() {
    try {
        const response = await fetch('http://localhost:3000/api/products')
        const datos = await response.json()
        const apiProductos = datos.payload 

        const listaTeclados = apiProductos.filter(p => p.categoria === "teclado")
        const listaMouses = apiProductos.filter(p => p.categoria === "mouse")

        return { teclados: listaTeclados, mouses: listaMouses }

    } catch (error) {
        console.log(error)
        return { teclados: [], mouses: [] }
    }
}

function cambiarPagina(){
    const paginasHtml = document.getElementById('contenedor-paginas')
    if (!paginasHtml) return

    paginasHtml.addEventListener('click', (e) => {
        if (e.target.classList.contains('numero-pagina')) {
            const pagina = parseInt(e.target.textContent.trim()) 
            imprimirProductos(ultimoArray, pagina)
        } else if (e.target.id === 'atras'){
            if (paginaActual > 1) {
                imprimirProductos(ultimoArray, paginaActual - 1)
            }
        } else if (e.target.id === 'adelante'){
            if (paginaActual < Math.ceil(ultimoArray.length / productosPorPagina)) {
                imprimirProductos(ultimoArray, paginaActual + 1)
            }
        }

    })
}

function imprimirPaginas(productosTraidos){
    const cantidadPaginas = Math.ceil(productosTraidos.length / productosPorPagina)

    const paginasHtml = document.getElementById('paginas')

    paginasHtml.innerHTML = ''
    for (let i = 1; i <= cantidadPaginas; i++) {
        paginasHtml.innerHTML += `<span class="numero-pagina">${i} </span>`
    }


}

async function imprimirProductos(productosTraidos, pagina = 1) {
    const contenedor = document.querySelector("#contenedor-productos")
    if (!contenedor) return
    paginaActual = pagina

    contenedor.innerHTML = ""
    
    let inicio = (pagina - 1) * productosPorPagina
    let fin = inicio + productosPorPagina
    
    let productosAMostrar = productosTraidos.slice(inicio, fin)

    imprimirPaginas(productosTraidos)

    try {
        productosAMostrar.forEach(producto => {
            const nombre = producto.nombre
            
            contenedor.innerHTML += `
                <li class="producto">
                    <img src="http://localhost:3000${producto.img}">
                    <div class="contenido">
                        <h3>${nombre}</h3>
                        <p class="precio-producto">$${producto.precio}</p>
                    </div>
                    <div class="compra-rapida">
                        <input type="number" id="cant-${nombre}" value="1" min="1" max="99" class="input-cantidad">
                        <button class="btn-agregar" onclick="agregarVarios('${nombre}')">Agregar al carrito</button>
                    </div>
                </li>
            `
        });
    } catch (error) {
        console.log(error)
    }
}

function agregarVarios(nombre) {
    const inputCantidad = document.getElementById(`cant-${nombre}`)
    const cantidad = parseInt(inputCantidad.value) || 1

    if (cantidad > 0) {
        actualizarCarrito(cantidad, nombre)
        inputCantidad.value = 1
    }
}

function filtrarProductos(texto) {
    if (texto != "") {    /* Creo un array nuevo obtenido mediante el filtrado con el texto a los arrays */

        console.log(texto)
        let resultado = ultimoArray.filter(i =>
            i.nombre.toLowerCase().includes(texto.toLowerCase())
        );

        console.log(resultado);

        imprimirProductos(resultado)
    } else {
        imprimirProductos(ultimoArray)
    }

}


/*************************************************************/
/* Exclusivo de pantalla Carrito */
/*************************************************************/
function imprimirTabla() {
    const tabla = document.querySelector("table")
    const valorFinal = document.querySelector("#valor-final")
    if (!tabla || !valorFinal) return
    let total = 0

    tabla.innerHTML = `
    <tr>
        <th>Producto</th>
        <th>Cantidad</th>
        <th>Precio total</th>
        <th></th>
    </tr>
    `
    if (carrito.length > 0) {
        console.log(carrito);

        carrito.forEach(i => {
            const valor = i.producto.precio * i.cantidad
            tabla.innerHTML += `
            <tr>
                <td>${i.producto.nombre}</td>
                <td>${i.cantidad}</td>
                <td>$${valor}</td>
                <td>
                    <button onclick="actualizarCarrito(-1, '${i.producto.nombre}')"> - </button>
                    <button onclick="actualizarCarrito(1, '${i.producto.nombre}')"> + </button>
                </td>
            </tr>
            `
            total += valor
        });
    }

    valorFinal.innerHTML = `Total a pagar: $${total}`
}
function imprimirTicket(){
    const botonConfirmar = document.getElementById('btn-confirmar')

    if (!botonConfirmar) return

    botonConfirmar.addEventListener('click', async () => {
        if (carrito.length === 0) {
            alert("El carrito está vacío.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 20; 

        
        // Encabezado principal
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("TICKET DE COMPRA", 14, y);
        y += 10;

        // Linea decorativa
        doc.setLineWidth(0.5);
        doc.line(14, y, 196, y);
        y += 10;

        // Datos del cliente
        const nombreCliente = localStorage.getItem('nombre') || 'Cliente';
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Cliente: ${nombreCliente}`, 14, y);
        
        // Fecha actual
        const fecha = new Date().toLocaleDateString();
        doc.text(`Fecha: ${fecha}`, 150, y);
        y += 15;

        // Encabezados
        doc.setFont("helvetica", "bold");
        doc.text("Producto", 14, y);
        doc.text("Cant.", 110, y);
        doc.text("Precio Unit.", 140, y);
        doc.text("Subtotal", 175, y);
        y += 6;

        // Linea de los encabezados
        doc.line(14, y, 196, y);
        y += 8;

        // Items
        doc.setFont("helvetica", "normal");
        let totalGeneral = 0;

        carrito.forEach(item => {
            const nombre = item.producto.nombre;
            const cantidad = item.cantidad;
            const precioUnitario = parseFloat(item.producto.precio);
            const subtotal = precioUnitario * cantidad;
            totalGeneral += subtotal;

            // Columnas alineadas horizontalmente usando la coordenada X
            doc.text(nombre, 14, y);
            doc.text(cantidad.toString(), 114, y);
            doc.text(`$${precioUnitario.toFixed(2)}`, 140, y);
            doc.text(`$${subtotal.toFixed(2)}`, 175, y);

            y += 10;
        });

        // Linea antes del total final
        y += 2;
        doc.line(14, y, 196, y);
        y += 12;

        // Total Final 
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`TOTAL A PAGAR:`, 110, y);
        doc.text(`$${totalGeneral.toFixed(2)}`, 175, y);
        y += 15;

        // Mensaje de despedida centrado
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.text("¡Muchas gracias por tu compra!", 105, y, { align: "center" });

        // Descargar
        doc.save(`Ticket_${nombreCliente.replace(/\s+/g, '_')}.pdf`);

        // Guarda la venta en la base de datos
        try {
            await fetch("http://localhost:3000/api/sales", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    total_price: totalGeneral,
                    user_name: nombreCliente
                })
            });
        } catch (error) {
            console.error("Error al guardar la venta:", error);
        }

        // Limpio el carrito
        carrito = []
        window.location.href = "../../index.html";
    })
}


/*************************************************************/
/* Exclusivo de pantalla Ticket */
/*************************************************************/



/*************************************************************/
/* Funciones de multiples pantallas */
/*************************************************************/
function actualizarCarrito(cantidad, nombre) {
    const producto = teclados.find(i => i.nombre == nombre) || mouses.find(i => i.nombre == nombre)
    const productoEnCarrito = carrito.find(i => i.producto.nombre == nombre)

    if (!productoEnCarrito) {
        if (cantidad > 0) carrito.push({ producto: producto, cantidad: cantidad })
    } else {
        productoEnCarrito.cantidad += cantidad
        if (productoEnCarrito.cantidad <= 0) {
            carrito.splice((carrito.findIndex(i => i.producto.nombre == nombre)), 1)
        }
    }
    guardarCarrito()
    console.log(carrito);

    // Si el usuario está parado en la vista de carrito, refresca la tabla al presionar + o -
    if (document.querySelector("#pagina-carrito")) {
        imprimirTabla()
    }
}

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito))
}

const menuProductos = document.querySelectorAll('.tipo-producto')
menuProductos.forEach(tipoProducto => {
    tipoProducto.addEventListener('click', () => {
        menuProductos.forEach(p => p.classList.remove('aparecer'));
        tipoProducto.classList.add('aparecer');

        let nombreProducto = tipoProducto.innerHTML.toLowerCase()
        ultimoArray = nombreProducto.includes("teclados") ? teclados : mouses;

        imprimirProductos(ultimoArray);
    })
});

function cambiarTema() {
    const botonTema = document.getElementById("cambiar-tema");
    const icono = document.getElementById("icono");

    if (!botonTema || !icono) return

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('instantaneo'); 
        document.body.classList.add('modo-oscuro');
        icono.innerHTML = "☀️";
    }

    botonTema.addEventListener('click', () => {
        document.body.classList.remove('instantaneo'); 
        document.body.classList.toggle('modo-oscuro');
        let estaOscuro = document.body.classList.contains('modo-oscuro')
        icono.innerHTML = estaOscuro ? "☀️" : "🌙"

        localStorage.setItem('theme', estaOscuro ? 'dark' : 'light');
    })

}


/*************************************************************/
/* Creacion de arrays para usar y ejecución init */
/*************************************************************/
let teclados = [] 
let mouses = [] 
let carrito = JSON.parse(localStorage.getItem("carrito")) || [] 
let ultimoArray = []
let paginaActual = 1
const productosPorPagina = 3

init()