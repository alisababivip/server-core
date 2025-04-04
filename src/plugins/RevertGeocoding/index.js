const GeoApify = require("./geoapify");
const LocationIq = require("./locationiq");


module.exports = async (lat, long) => {
    let latitude = lat;
    let longitude = long;

    const parseLat = lat.split(",");
    if (parseLat[1]) latitude = parseLat[0];

    const parseLong = long.split(",");
    if (parseLong[1]) longitude = parseLong[0];

    let locationData = null;

    const byLocationIq = await LocationIq(Number(latitude), Number(longitude));
    if (byLocationIq.status) {
        locationData = byLocationIq;
        return locationData;
    }

    const byGeoApify = await GeoApify(Number(latitude), Number(longitude));
    if (byGeoApify.status) {
        locationData = byGeoApify;
        return locationData;
    }

    // false to get location
    return locationData;
}