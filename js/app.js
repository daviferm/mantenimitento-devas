import { Mapa } from './MAP.js';
import { baseDatos } from './baseDatos.js';

const selectBarrio = document.getElementById('barrio');
let barrioActual;

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

            barrioActual = barrioSeleccionado;

            const latLng = {
                lat: Number(park.latitud),
                lng: Number(park.longitud)
            };

            const mapa = new Mapa(14, latLng);

            //Mostrar todos los parquímetros en el mapa 
            mostrarParquimetros(barrioSeleccionado, mapa, name);
        }
    }
}

// Función para mostrar todos los pines de los parquímetros en el mapa
function mostrarParquimetros(barrioSeleccionado, mapa, name) {
    let mets = [barrioSeleccionado];
    baseDatos.forEach(elem => {
            if (elem.barrio.startsWith(barrioSeleccionado)) {

                let { latitud, longitud, alias } = elem;
                let contenido = `
                <div class="infoPark">
                    <p>Número: ${alias}</p>
                    <button id="btnInfo" type="button">Hecho</button>
                </div>
            `;
                mets.push(alias);
                let latLng = {
                    lat: Number(latitud),
                    lng: Number(longitud)
                }
                mapa.mostrarPines(latLng, contenido, 1, barrioSeleccionado, name);
            }
        })
        //Guardar datos en localStorage
    localStorage.setItem(name, JSON.stringify(mets));

}