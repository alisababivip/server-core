const axios = require("axios");
const config = require('@Configs/geocoding/locationiq.json');

module.exports = async (lat, long) => {
    try {
        const getData = await axios({
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://us1.locationiq.com/v1/reverse?lat=${lat}&lon=${long}&format=json&key=${config.API_KEY}`,
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
            dataExport.country = (data.address.country) ? data.address.country : null;
            dataExport.country_code = (data.address.country_code) ? data.address.country_code : null;
            dataExport.city = (data.address.city) ? data.address.city : null;
            dataExport.district = (data.address.city_district) ? data.address.city_district : null;
            dataExport.postcode = (data.address.postcode) ? data.address.postcode : null;
            dataExport.suburb = (data.address.suburb) ? data.address.suburb : null;
            dataExport.road = (data.address.road) ? data.address.road : null;
            dataExport.full_andress = (data.display_name) ? data.display_name : null;

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