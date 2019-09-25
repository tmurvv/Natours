/* eslint-disable */
export const displayMap = locations => {
    mapboxgl.accessToken =
        'pk.eyJ1IjoidG11cnZ2IiwiYSI6ImNrMHUyMGoyMzBnM2szY2xvMm1vODNtZmMifQ.8xBVu4KGoPbzOlRTPRB1uQ';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/tmurvv/ck0u251fn5eis1cqn4tnm68mi',
        scrollZoom: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        //create marker
        const el = document.createElement('div');
        el.className = 'marker';
        //add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map);
        //add popup
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);
        //extend map bounds to include the marker
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
};
