import { Mapa } from './MAP.js';

//Poner el scroll al principio de la página al recargar
document.addEventListener('DOMContentLoaded', function() {
    window.scrollBy(0, -window.innerHeight);
});
//Variables globales
const selectBarrio = document.getElementById('barrio');

const icon = document.querySelector('.ul ion-icon');
const ul = document.querySelector('#ul');
const cerrarLi = document.querySelector('.cerrarLista');
const lista = document.querySelector('.listaTareas');
const title = document.querySelector('.title');


//constante del icono del menu para añadir atributo del número de tareas creadas
const mapSave = document.querySelector('.mapSave');

//Llenamos el listado de barrios
const barriosHTML = ["44 Guindalera", "45 Lista", "46 Castellana", "51 El Viso", "52 Prosperidad", "53 Ciudad Jardín", "54 Hispanoamérica", "55 Nueva España", "56 Castilla", "61 Bellas Vistas", "62 Cuatro Caminos", "63 Castillejos", "64 Almenara", "65 Valdeacederas", "66 Berruguete", "75 Rios Rosas", "76 Vallehermoso", "84 Pilar", "85 La Paz", "93 Ciudad Universitaria"];
const listaBarrios = [44, 45, 46, 51, 52, 53, 54, 55, 56, 61, 62, 63, 64, 65, 66, 75, 76, 84, 85, 93];

//Llenamos el select con la lista de barrios
for (let i = 0; i < listaBarrios.length; i++) {
    let option = document.createElement('option');
    option.value = listaBarrios[i];
    option.innerHTML = barriosHTML[i];
    selectBarrio.appendChild(option);
};

//Constante para establecer el punto de partida del primer mapa que se muestra
const latLngInicio = { lat: 40.413914, lng: -3.679218 };

const mapa = new Mapa(10, latLngInicio);

cargarMapasLocalStorage();

document.querySelector('#formulario').addEventListener('submit', mostrarMapa);

//Muestra el mapa con todos los parkímetros del barrio seleccionado
async function mostrarMapa(e) {
    e.preventDefault();

    const barrioSeleccionado = selectBarrio.options[selectBarrio.selectedIndex].value;

    if (barrioSeleccionado == 0) {
        alert("Tienes que seleccionar un barrio");
    } else {
        const { value: name } = await swal({
            title: 'Tareas de mantenimiento.',
            input: 'text',
            inputPlaceholder: 'Escrique aquí el título para la nueva tarea..',
            showCancelButton: true,
            inputValidator: (value) => {
                return !value && 'Necesitas escribir un título válido!'
            }
        })

        if (name) {

            let tarea = await comprobarNombre(name);

            let papelera = await comprobarPapelera(name);

            await swal({ type: 'success', title: 'Tarea "' + name + '" guardada..' });


            const latLng = optenerCentro(barrioSeleccionado);

            const mapa = new Mapa(15, latLng);

            //Mostrar todos los parquímetros en el mapa 

            mapa.crearMapa(barrioSeleccionado, name);
            window.scrollBy(0, -window.innerHeight);

            setTimeout(function() {
                crearLi(name, 'menu');

                cargarNumeroMapas();
            }, 400);

        }
    }
}

function comprobarNombre(name) {

    if (!localStorage.getItem('mapSave')) {
        return null;
    } else {

        let tareas = JSON.parse(localStorage.getItem('mapSave'));
        tareas.forEach(el => {

            let tarea = JSON.parse(localStorage.getItem(el));

            if (name === el) {
                Swal.fire({
                    type: 'error',
                    title: 'Oops...',
                    text: 'El nombre no puede estar duplicado!',
                    footer: 'Elige un título diferente!'
                })
                console.info('el nombre', name, 'ya existe!!!');
                throw Error;
            } else {
                console.log('tarea añadida!!');
                return name;
            }
        })
    }
}

function comprobarPapelera(name) {

    if (!localStorage.getItem('papelera')) {
        return null;
    } else {

        let tareas = JSON.parse(localStorage.getItem('papelera'));
        tareas.forEach(el => {

            let tarea = JSON.parse(localStorage.getItem(el));

            if (name === el.tarea) {
                Swal.fire({
                    type: 'error',
                    title: 'Oops...',
                    text: 'El nombre ya existe en la papelera!',
                    footer: 'Elige un título diferente!'
                })
                console.info('el nombre', name, 'ya existe!!!');
                throw Error;
            } else {
                console.log('tarea añadida!!');
                return name;
            }
        })
    }
}

cerrarLi.addEventListener('click', function() {

    lista.style.transform = 'translateY(110%)';
})

let activeUl = true;
icon.addEventListener('click', ulSize);
ul.addEventListener('click', (e) => {

    if (e.target.className == 'enlace') {
        //Obtener el texto del enlace
        let texto = e.target.textContent;

        cargarMapaGuardado(texto);
        lista.style.transform = 'translateY(110%)';
        // ulSize();
    }
    if (e.target.parentElement.className == 'cerrar') {

        //Obtenemos el texto del mapa que vamos a borrar
        let texto = e.target.parentElement.parentElement.firstElementChild.textContent.trim();

        //Lanzar un alerta para preguntar si quieres borrar el mapa
        swal({
            title: `Seguro que quieres borrar el mapa: "${texto}"?`,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, borrar el mapa!'
        }).then((result) => {
            if (result.value) {
                swal(
                    'Borrado!',
                    'El archivo a sido borrado.',
                    'success'
                );
                let papelera;

                //Crear una variable para guardar los mapas eliminados
                if (!localStorage.getItem('papelera')) {

                    papelera = [];

                    localStorage.setItem('papelera', JSON.stringify(papelera));
                } else {
                    papelera = JSON.parse(localStorage.getItem('papelera'));
                    console.log(papelera);
                }
                //Borrar el mapa 
                // localStorage.removeItem(texto);
                //Obtener un array con los nombres de los mapas guardados en localStorage
                let mapas = JSON.parse(localStorage.getItem('mapSave'));
                //Borrar el nombre del mapa del array
                let borrado = mapas.splice(mapas.indexOf(texto), 1);

                //Añadir el elemento borrado a la papelera y guardar en localStorage
                //con una marca de tiempo
                const obj = {
                    tarea: borrado[0],
                    time: new Date().getTime()
                }
                papelera.push(obj);
                localStorage.setItem('papelera', JSON.stringify(papelera));
                console.log(papelera);

                //Volver a guardar en localStorage
                localStorage.setItem('mapSave', JSON.stringify(mapas));
                //Borrar enlace del mapa
                let borrarLi = e.target.parentElement.parentElement.parentElement;
                borrarLi.remove();

                cargarNumeroMapas();
            }
        })


    }
    if (e.target.parentElement.className == 'restaurar') {

        //Obtenemos el texto del mapa que vamos a borrar
        let texto = e.target.parentElement.parentElement.firstElementChild.textContent.trim();

        //Lanzar un alerta para preguntar si quieres restaurar el mapa
        swal({
            title: `Quieres restaurar el mapa: "${texto}"?`,
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, restaurar mapa!'
        }).then((result) => {
            if (result.value) {

                let papelera = JSON.parse(localStorage.getItem('papelera'));
                let mapas = JSON.parse(localStorage.getItem('mapSave'));

                let mapa = papelera.findIndex(elem => elem.tarea == texto);
                papelera.splice(mapa, 1);
                mapas.push(texto);
                localStorage.setItem('mapSave', JSON.stringify(mapas));
                localStorage.setItem('papelera', JSON.stringify(papelera));
                getPosicion();
                console.log('tarea restaurada!!');

            }
        })
    }
})


//Crear un enlace para el mapa
function crearLi(name, db) {

    document.querySelector('.noList').style.display = 'none';

    //Obtener el mapa de localStorage
    let mapaGuardado = JSON.parse(localStorage.getItem(name));

    //Obtener el número del barrio del mapa seleccionado
    let barrio = Number(mapaGuardado[0].barrio.substr(0, 2));

    let html;
    if (db == 'menu') {
        let li = document.createElement('li');
        html = `
                <div class="link animated fast fadeIn">
                    <div class="name">
                        <p class="enlace">${name}</p>
                    </div>
                    <div class="barrio">
                        <div>
                            <p>Barrio: <strong> ${barrio} </strong></p>
                        </div>
                    </div>
                    <div class="cerrar">
                        <ion-icon name="trash"></ion-icon>
                    </div>
                </div>
    
                `;
        li.innerHTML = html;
        ul.appendChild(li);
        const numMets = cargarNumeroMets(name);
        li.setAttribute('data-mets', numMets);
        return li;

    } else {
        let li = document.createElement('li');
        html = `
                <div class="link paper animated fast fadeIn">
                    <div class="name">
                        <p class="nombre">${name}</p>
                    </div>
                    <div class="barrio">
                        <div>
                            <p>Barrio: <strong> ${barrio} </strong></p>
                        </div>
                    </div>
                    <div class="restaurar">
                        <ion-icon name="refresh"></ion-icon>
                    </div>
                </div>
                `;
        li.innerHTML = html;
        ul.appendChild(li);
        const numMets = cargarNumeroMets(name);
        li.setAttribute('data-mets', numMets);
        return li;

    }

}


// Función para cargar los mapas guardados en localStorage
function cargarMapasLocalStorage() {
    if (localStorage.getItem('mapSave') !== null) {
        let lis = JSON.parse(localStorage.getItem('mapSave'));
        cargarNumeroMapas();
        lis.forEach((el) => {
            crearLi(el, 'menu');
        })

        if (lis.length <= 0) {
            document.querySelector('.noList').style.display = 'flex';
            mapSave.setAttribute('data-count', 0);

        }
    } else {
        document.querySelector('.noList').style.display = 'flex';
        mapSave.setAttribute('data-count', 0);

    }
}
//Cargar número de listas guardadas
function cargarNumeroMapas() {
    let lis = JSON.parse(localStorage.getItem('mapSave'));

    mapSave.setAttribute('data-count', lis.length);

    if (JSON.parse(localStorage.getItem('mapSave')).length <= 0) {

        document.querySelector('.noList').style.display = 'flex';
        mapSave.setAttribute('data-count', 0);
    }

}
//Cargar número de mets
function cargarNumeroMets(name) {
    let mets = JSON.parse(localStorage.getItem(name));
    let count = 0;

    mets.forEach(function(el) {
        if (!el.hecho) {
            count++;
        }
    })
    return count + "/" + mets.length;

}

//Actualizar tamaño de la lista de enlaces
function ulSize() {
    let li = document.getElementsByTagName('li').length;

    while (ul.children[2]) {
        ul.children[2].remove();
    }

    cargarMapasLocalStorage();
    title.style.display = 'none';
    lista.style.transform = 'translateY(0%)';

}

//Optener cetro del mapa según el barrio
function optenerCentro(barrio) {
    let numBarrio = Number(barrio);
    let centro;
    switch (numBarrio) {
        case 44:
            centro = { lat: 40.436347, lng: -3.667389 };
            break;
        case 45:
            centro = { lat: 40.432375, lng: -3.676183 };
            break;
        case 46:
            centro = { lat: 40.433368, lng: -3.683588 };
            break;
        case 51:
            centro = { lat: 40.445408, lng: -3.684342 };
            break;
        case 52:
            centro = { lat: 40.443262, lng: -3.669103 };
            break;
        case 53:
            centro = { lat: 40.448204, lng: -3.67265 };
            break;
        case 54:
            centro = { lat: 40.455497, lng: -3.677462 };
            break;
        case 55:
            centro = { lat: 40.461893, lng: -3.679066 };
            break;
        case 56:
            centro = { lat: 40.472714, lng: -3.677789 };
            break;
        case 61:
            centro = { lat: 40.451753, lng: -3.707646 };
            break;
        case 62:
            centro = { lat: 40.452326, lng: -3.696489 };
            break;
        case 63:
            centro = { lat: 40.459081, lng: -3.693029 };
            break;
        case 64:
            centro = { lat: 40.469211, lng: -3.69408 };
            break;
        case 65:
            centro = { lat: 40.466564, lng: -3.702468 };
            break;
        case 66:
            centro = { lat: 40.459403, lng: -3.704318 };
            break;
        case 75:
            centro = { lat: 40.441979, lng: -3.698296 };
            break;
        case 76:
            centro = { lat: 40.441833, lng: -3.71095 };
            break;
        case 84:
            centro = { lat: 40.476389, lng: -3.708886 };
            break;
        case 85:
            centro = { lat: 40.48158, lng: -3.697391 };
            break;
        case 93:
            centro = { lat: 40.449879, lng: -3.714955 };
            break;
    }

    return centro;
}

//Cargar mapa guardado al cliquear en un enlace
function cargarMapaGuardado(nameMap) {
    window.scrollBy(0, -window.innerHeight);

    //Obtener el mapa de localStorage
    let mapaGuardado = JSON.parse(localStorage.getItem(nameMap));

    //Obtener el número del barrio del mapa seleccionado
    let barrio = Number(mapaGuardado[0].barrio.substr(0, 2));

    //Obtener el centro del mapa
    const latLng = optenerCentro(barrio);

    const mapa = new Mapa(15, latLng);
    let opacidad;
    mapaGuardado.forEach((elem) => {

        let contenido = `
            <div class="infoPark">
                <p>Número: ${elem.alias}</p>
                <div class="buttons">
                    <div class="divBtnInfo">
                        <button id="btnInfo" type="button">Tarea realizada</button>
                    </div>
                    <div class="divBtnMap">
                        <button id="btnMap" type="button"></button>
                    </div>
                </div>
            </div>
        `

        const latLng = {
            lat: Number(elem.latitud),
            lng: Number(elem.longitud)
        };
        let alias = elem.alias.substr(7);
        if (elem.hecho) {
            opacidad = .5;
        } else {
            opacidad = 1;
        }

        if (elem.estado != 'desmontada') {

            mapa.mostrarPin(latLng, contenido, opacidad, nameMap, alias);
        }
        let cont = document.querySelector('.infoPark');
    })
    let miPosicion = mapa.getPosicion();


}
// Obtener posicion GPS
let getPosicion = () => {

    while (ul.children[2]) {
        ul.children[2].remove();
    }

    let papelera = JSON.parse(localStorage.getItem('papelera'));
    title.style.display = 'block';

    lista.style.transform = 'translateY(0%)';
    papelera.forEach(el => {

        console.log(el);
        let time = el.time;

        if (time + 604800000 < new Date().getTime()) {
            //Si pasa mas de 7 dias borrar el mapa definitivamente

            let papelera = JSON.parse(localStorage.getItem('papelera'));

            let idx = papelera.findIndex(elem => elem.tarea === el.tarea);
            papelera.splice(idx, 1);
            localStorage.setItem('papelera', JSON.stringify(papelera));

            console.log('Mapa borrado: ', el);

        } else if (time + 518400000 < new Date().getTime()) {
            //Si queda menos de un dia para eliminarlo se pone el fondo rojo.

            const li = crearLi(el.tarea, 'papelera');

            li.children[0].style.background = 'rgb(138, 83, 93)';

        } else {

            const li = crearLi(el.tarea, 'papelera');

        }
    });


    // if (navigator.geolocation) {

    //     navigator.geolocation.getCurrentPosition((position) => {
    //         position = {
    //             lat: position.coords.latitude,
    //             lng: position.coords.longitude
    //         };
    //         let latLng = {
    //             lat: position.lat,
    //             lng: position.lng
    //         }
    //         miPosicion = mapa.mostrarPosicion(latLng);

    //     });

    // } else {
    //     throw error = new Error('Necesitas habilitar GPS!');
    // }
}

const locate = document.querySelector('.posicionGps');
locate.addEventListener('click', getPosicion);

// let tiempo1 = new Date("2019", "03", "10", "10", "10").getTime();
// let tiempo2 = new Date("2019", "03", "16", "10", "10").getTime();

// console.log(tiempo2 - tiempo1);