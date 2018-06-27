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

    mostrarPines(latLng, contenido, opacidad, barrio, name) {
        let marker = new google.maps.Marker({
            position: latLng,
            map: this.mapa,
            opacity: opacidad,
            animation: google.maps.Animation.DROP,
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
                    borrarElemLocalStorage(name, barrio, numMet)


                })
                //Asignar activo
            this.infoWindowActivo = infowindow;

        })


    }


}
//Función para borrar los parkímetros de localStorage
function borrarElemLocalStorage(name, barrio, numMet) {

    let mets = JSON.parse(localStorage.getItem(name));
    mets.forEach((item, index) => {
        if (item == numMet) {
            mets.splice(index, 1);
        }
    })
    localStorage.setItem(name, JSON.stringify(mets));

}