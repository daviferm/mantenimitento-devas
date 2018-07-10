import { Mapa } from './MAP.js';
import { baseDatos } from './baseDatos.js';


//Variables globales
const selectBarrio = document.getElementById('barrio');

const icon = document.querySelector('.ul ion-icon');
const ul = document.querySelector('#ul');

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
            await swal({ type: 'success', title: 'Tarea "' + name + '" guardada..' })
            let park = baseDatos.find(item => {
                return item.barrio.startsWith(barrioSeleccionado);
            });

            const latLng = {
                lat: Number(park.latitud),
                lng: Number(park.longitud)
            };
            const mapa = new Mapa(15, latLng);

            //Mostrar todos los parquímetros en el mapa 
            mapa.crearMapa(barrioSeleccionado, name);

            crearLi(name);
            cargarNumeroMapas();
        }
    }
}
let activeUl = true;
icon.addEventListener('click', ulSize);
ul.addEventListener('click', (e) => {

    if (e.target.className == 'enlace') {
        //Obtener el texto del enlace
        let texto = e.target.textContent;

        cargarMapaGuardado(texto);
    }
    if (e.target.parentElement.className == 'cerrar') {

        //Obtenemos el texto del mapa que vamos a borrar
        let texto = e.target.parentElement.previousElementSibling.textContent.trim();

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

                //Borrar el mapa 
                localStorage.removeItem(texto);
                //Obtener un array con los nombres de los mapas guardados en localStorage
                let mapas = JSON.parse(localStorage.getItem('mapSave'));
                //Borrar el nombre del mapa del array
                mapas.splice(mapas.indexOf(texto), 1);
                //Volver a guardar en localStorage
                localStorage.setItem('mapSave', JSON.stringify(mapas));
                //Borrar enlace del mapa
                let borrarLi = e.target.parentElement.parentElement.parentElement;
                borrarLi.remove();
                //Establecemos la variable "activeUl" en true para que no se cierre
                //la lista de enlaces al borrar uno
                activeUl = true;
                //Actualizar tamaño de la lista
                ulSize();
                cargarNumeroMapas();
            }
        })


    }
})

//Crear un enlace para el mapa
function crearLi(name) {
    let html;
    let li = document.createElement('li');
    html = `<div class="link">
                <div>
                    <p class="enlace">${name}</p>
                </div>
                <div class="cerrar">
                    <span>x</span>
                </div>
            </div>`;
    li.innerHTML = html;
    ul.appendChild(li);
    const numMets = cargarNumeroMets(name);
    li.setAttribute('data-mets', numMets);

}

// Función para cargar los mapas guardados en localStorage
function cargarMapasLocalStorage() {
    if (localStorage.getItem('mapSave') !== null) {
        let lis = JSON.parse(localStorage.getItem('mapSave'));
        cargarNumeroMapas();
        lis.forEach((el) => {
            crearLi(el);
        })

    }
}
//Cargar número de listas guardadas
function cargarNumeroMapas() {
    let lis = JSON.parse(localStorage.getItem('mapSave'));
    const mapSave = document.querySelector('.mapSave');

    mapSave.setAttribute('data-count', lis.length);
}
//Cargar número de mets
function cargarNumeroMets(name) {
    let mets = JSON.parse(localStorage.getItem(name));
    let count = 0;
    mets.forEach(function(el) {
        if (!el.hecho) {
            count++
        }
    })
    return count + "/" + mets.length;

}

//Actualizar tamaño de la lista de enlaces
function ulSize() {
    let li = document.getElementsByTagName('li').length;

    if (activeUl) {
        ul.style.width = '190px';
        ul.style.height = `${li*40}px`;
        activeUl = !activeUl;
    } else {
        ul.style.width = '0px';
        ul.style.height = '0px';
        activeUl = !activeUl;
    }
}
//Cargar mapa guardado al cliquear en un enlace
function cargarMapaGuardado(nameMap) {

    //Obtener el mapa de localStorage
    let mapaGuardado = JSON.parse(localStorage.getItem(nameMap));

    const latLng = {
        lat: Number(mapaGuardado[0].latitud),
        lng: Number(mapaGuardado[0].longitud)
    };

    const mapa = new Mapa(15, latLng);
    let opacidad;
    mapaGuardado.forEach((elem) => {

        let contenido = `
            <div class="infoPark">
                <p>Número: ${elem.alias}</p>
                <button id="btnInfo" type="button">Hecho</button>
            </div>
        `;

        const latLng = {
            lat: Number(elem.latitud),
            lng: Number(elem.longitud)
        };
        let alias = elem.alias.substr(7);
        if (elem.hecho) {
            opacidad = .6;
        } else {
            opacidad = 1;
        }

        let pin = mapa.mostrarPin(latLng, contenido, opacidad, nameMap, alias);
    })
}