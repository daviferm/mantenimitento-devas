import { baseDatos } from './baseDatos.js';

export class Mapa {
    constructor(zoom, latLng) {
        //Inicializar y obtenet la propiedad de mapa
        this.mapa = new google.maps.Map(document.getElementById('map'), {
            center: latLng,
            fullscreenControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControl: false,
            zoom: zoom
        });

        this.infoWindowActivo;
    }

    mostrarPosicion(latLng) {
        let marker = new google.maps.Marker({
            position: latLng,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10, //tamaño
                strokeColor: '#f00', //color del borde
                strokeWeight: 5, //grosor del borde
                fillColor: '#00f', //color de relleno
                fillOpacity: 1 // opacidad del relleno
            },
            map: this.mapa
        })

    }
    mostrarPin(latLng, contenido, opacidad, name, alias) {
        let marker = new google.maps.Marker({
            position: latLng,
            map: this.mapa,
            opacity: opacidad,
            animation: google.maps.Animation.DROP,
            label: alias,
            title: 'Parkímetro'
        });

        let infowindow = new google.maps.InfoWindow({
            content: contenido
        });
        // Mostrar InfoWindow al hace click
        marker.addListener('click', () => {
            // Cerrar infoWindowActivo
            if (this.infoWindowActivo) {
                this.infoWindowActivo.close();
            }
            // Mostrarlo
            infowindow.open(this.mapa, marker);

            // Añadir un evento click al boton del infoWindow para marcarlo con hecho
            document.getElementById('btnInfo').addEventListener('click', (e) => {
                    let numMet = e.target.parentElement.textContent.match(/\d{10}/)[0];

                    marker.setMap(null);
                    borrarElemLocalStorage(name, numMet)


                })
                //Asignar activo
            this.infoWindowActivo = infowindow;

        })

    }

    crearMapa(barrioSeleccionado, name) {

        let mets = [];
        baseDatos.forEach(elem => {
            if (elem.barrio.startsWith(barrioSeleccionado)) {

                let { latitud, longitud, alias } = elem;
                let contenido = `
                        <div class="infoPark">
                            <p>Número: ${alias}</p>
                            <button id="btnInfo" type="button">Hecho</button>
                        </div>
                `;
                mets.push(elem);
                let latLng = {
                    lat: Number(latitud),
                    lng: Number(longitud)
                }

                this.mostrarPin(latLng, contenido, 1, name);
            }
        })

        //Guardar datos en localStorage
        agregarMapaLocalStorage(name);

        // Agregar lista de parquímetros del mapa a localStorage
        localStorage.setItem(name, JSON.stringify(mets));
    }
    getPosicion() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                position = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                let latLng = {
                    lat: position.lat,
                    lng: position.lng
                }
                let miPosicion = this.mostrarPosicion(latLng);

            });

        } else {
            throw error = new Error('Necesitas habilitar GPS!');
        }
    }
}


//Función para borrar los parkímetros de localStorage
function borrarElemLocalStorage(name, numMet) {

    let mets = JSON.parse(localStorage.getItem(name));
    mets.forEach((item, index) => {
        if (item.alias == numMet) {
            mets[index].hecho = true;
            // mets.splice(index, 1);
        }
    })
    localStorage.setItem(name, JSON.stringify(mets));

}

function agregarMapaLocalStorage(name) {
    // tweets de localstorage
    let mapSave;
    mapSave = obtenerMapasLocalStorage();

    // Añadir el nombre del nuevo mapa
    mapSave.push(name);

    // Eliminar nombres duplicados
    let set = new Set(mapSave);

    mapSave = [...set];

    // Convertir a String y agregarlo a Local Storage
    localStorage.setItem('mapSave', JSON.stringify(mapSave));

}


function obtenerMapasLocalStorage() {
    let mapSave;
    // Revisar valores de localstorage
    if (localStorage.getItem('mapSave') === null) {
        mapSave = [];
    } else {
        mapSave = JSON.parse(localStorage.getItem('mapSave'));
    }
    return mapSave;
}