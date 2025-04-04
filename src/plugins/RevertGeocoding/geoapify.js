const axios = require("axios");
const config = require('@Configs/geocoding/geoapify.json');

module.exports = async (lat, long) => {
    try {
        const getData = await axios({
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${long}&apiKey=${config.API_KEY}`,
            headers: {}
        });

        if (!getData) return {
            status: false
        };

        const data = getData.data;

        if (!!data.error) {
            return {
                status: false
            }
        } else {
            const dataExport = {};
            dataExport.country = (data.features[0].properties.country) ? data.features[0].properties.country : null;
            dataExport.country_code = (data.features[0].properties.country_code) ? data.features[0].properties.country_code : null;
            dataExport.city = (data.features[0].properties.city) ? data.features[0].properties.city : null;
            dataExport.district = (data.features[0].properties.district) ? data.features[0].properties.district : null;
            dataExport.postcode = (data.features[0].properties.postcode) ? data.features[0].properties.postcode : null;
            dataExport.suburb = (data.features[0].properties.suburb) ? data.features[0].properties.suburb : null;
            dataExport.road = (data.features[0].properties.name) ? data.features[0].properties.name : null;
            dataExport.full_andress = (data.features[0].properties.formatted) ? data.features[0].properties.formatted : null;

            return {
                status: true,
                data: dataExport
            };
        }
    } catch (err) {
        //console.log(err);
        return {
            status: false
        }
    }
}