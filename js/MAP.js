// import { baseDatos } from './baseDatos.js';
// import { baseDatosMets } from './baseDatosMet.js';

export class Mapa {
    constructor(zoom, latLng) {
        //Inicializar y obtenet la propiedad de mapa
        this.mapa = new google.maps.Map(document.getElementById('map'), {
            center: latLng,
            fullscreenControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControl: false,
            gestureHandling: "greedy", //mover el mapa con un dedo
            zoom: zoom
        });

        this.infoWindowActivo;
    }

    mostrarPin(latLng, contenido, opacidad, name, alias) {
        let marker = new google.maps.Marker({
            position: latLng,
            map: this.mapa,
            opacity: opacidad,
            animation: google.maps.Animation.DROP,
            label: alias,
            icon: '../img/icono-position.png',
            title: 'Parkímetro'
        });

        let infowindow = new google.maps.InfoWindow({
            content: contenido
        });

        // Mostrar InfoWindow al hace click
        marker.addListener('click', (e) => {
            // Cerrar infoWindowActivo
            if (this.infoWindowActivo) {
                this.infoWindowActivo.close();
            }
            // Mostrarlo
            infowindow.open(this.mapa, marker);

            // Añadir un evento click al boton del infoWindow para marcarlo con hecho
            setTimeout(function() {

                let boton = document.getElementById('btnInfo');
                let btnMap = document.getElementById('btnMap');

                boton.addEventListener('click', (e) => {
                    let numMet = e.target.parentElement.parentElement.parentElement.textContent.match(/\d{10}/)[0];

                    marker.setOptions({ opacity: .5 });
                    infowindow.close();
                    // marker.setMap(null);
                    borrarElemLocalStorage(name, numMet)

                })

                btnMap.addEventListener('click', () => {

                    window.open("https://www.google.es/maps/dir/mi+ubicacion/" + latLng.lat + "," + latLng.lng + "/");

                })
            }, 1000);

            //Asignar activo
            this.infoWindowActivo = infowindow;

        })

    }

    async crearMapa(barrioSeleccionado, name) {

        let mets = [];

        let data = await fetch('../data/data.json')
            .then(async function(res) {
                let respuesta = await res.json();
                return respuesta;
            })

        let baseDatosMets = data.parkimetros;

        baseDatosMets.forEach(elem => {
            if (elem.barrio.startsWith(barrioSeleccionado)) {

                let { latitud, longitud, alias } = elem;
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
                alias = elem.alias.substr(7);

                mets.push(elem);
                let latLng = {
                    lat: Number(latitud),
                    lng: Number(longitud)
                }

                this.mostrarPin(latLng, contenido, 1, name, alias);
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