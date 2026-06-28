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
                    <img src="${producto.img}">
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