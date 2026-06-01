/*************************************************************/
/* creación de inits */
/*************************************************************/
function init() {
    initIndex()
    initInicio()
    initCarrito()
    initTicket()
}


async function initIndex() {
    if (!document.querySelector("#pagina-index")) return

    establecerNombre()
}

async function initInicio() {
    if (!document.querySelector("#pagina-inicio")) return

    ({ teclados, mouses } = await cargarDatos())
    imprimirProductos(teclados)
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

function establecerNombre(){
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
    const respuestaTeclados = await fetch("../../data/teclados.json")
    const jsonTeclados = await respuestaTeclados.json()

    const respuestaMouses = await fetch("../../data/mouses.json")
    const jsonMouses = await respuestaMouses.json()


    return { teclados: jsonTeclados.teclados, mouses: jsonMouses.mouses }
}

/* 
async function cargarJSON(direccion) {
    try {
        const respuesta = await fetch(direccion)
        if (!respuesta.ok) return []
        return await respuesta.json()
    } catch {
        return []
    }
}
    
async function cargarDatos() {
    const teclados = await cargarJSON("../data/teclados.json")
    const mouses = await cargarJSON("../data/mouses.json")

    return {teclados, mouses}
}    
*/

function imprimirProductos(productos) {

    const contenedor = document.querySelector("#contenedor-productos")
    contenedor.innerHTML = `
    <p>No hay Productos disponibles</p>
    `
    if (productos.length > 0) {
        contenedor.innerHTML = `<ul>`
        productos.forEach(producto => {
            const nombre = producto.nombre
            contenedor.innerHTML += `
                <li class="producto">
                    <img src=${producto.img}>
                    <div class="contenido">
                        <h3>${nombre}</h3>
                        <p class="precio-producto">$${producto.precio}</p>
                        <p class="descripcion-producto">${producto.info}</p>
                    </div>
                    <button onclick="actualizarCarrito(-1, '${nombre}')"> - </button>
                    <button onclick="actualizarCarrito(1, '${nombre}')"> + </button>
                </li>
            `
        });

        contenedor.innerHTML += `
        </ul>`
    }

}

function filtrarProductos(texto) {
    if (texto != "") {    /* Creo un array nuevo obtenido mediante el filtrado con el texto a los arrays */

    console.log(texto)
    let resultado = ultimoArray.filter(i =>
        i.nombre.toLowerCase().includes(texto.toLowerCase())
    ); 

    console.log(resultado);

    // Imprimo nueva lista.
    imprimirProductos(resultado)
    } else {
        imprimirProductos(ultimoArray)
    }

}



/*************************************************************/
/* Exclusivo de pantalla Carrito */
/*************************************************************/
function imprimirTabla() {
    const tabla = document.querySelector("#tabla-carrito")
    const valorFinal = document.querySelector("#valor-final")
    let total = 0

    tabla.innerHTML = `
    <tr>
        <th>Producto</th>
        <th>Cantidad</th>
        <th>Precio total</th>
    </tr>
    `
    if (carrito != []) {
        carrito.forEach(i => {
            const valor = i.producto.precio * i.cantidad
            tabla.innerHTML += `
            <tr>
                <td>${i.producto.nombre}</td>
                <td>${i.cantidad}</td>
                <td>$${valor}</td>
            </tr>
            `
            total += valor
        });
    }

    valorFinal.innerHTML += ` $${total}`
}



/*************************************************************/
/* Funciones de multiples pantallas */
/*************************************************************/
function actualizarCarrito(operador, nombre) {
    const producto = teclados.find(i => i.nombre == nombre) || mouses.find(i => i.nombre == nombre)
    const productoEnCarrito = carrito.find(i => i.producto.nombre == nombre)

    if (!productoEnCarrito) {
        carrito.push({ producto: producto, cantidad: 1 })
        producto.stock--
    } else {
        productoEnCarrito.cantidad += operador
        if (productoEnCarrito.cantidad <= 0) carrito.splice((carrito.findIndex(i => i.producto.nombre == nombre)), 1)
    }
    guardarCarrito()
    console.log(carrito);
}

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito))
}

const productos = document.querySelectorAll('.tipo-producto')
productos.forEach(tipoProducto => {
    tipoProducto.addEventListener('click', () =>{
        nombreProducto = tipoProducto.innerHTML.toLowerCase()
        ultimoArray = (nombreProducto === "teclados") ? teclados : mouses;
    })
});

/*************************************************************/
/* Creacion de arrays para usar y ejecución init */
/*************************************************************/
let teclados = [] // Formato: visible en teclados.json
let mouses = [] // Formato: visible en mouses.json
let carrito = JSON.parse(localStorage.getItem("carrito")) || [] // formato: [{productos: obj(teclado/mouse), cantidad: int}, {...}]
let ultimoArray = teclados

init()