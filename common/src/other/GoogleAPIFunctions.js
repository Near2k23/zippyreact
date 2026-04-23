import base64 from 'react-native-base64';
import { firebase } from '../config/configureFirebase';
import AccessKey from './AccessKey';
import store from '../store/store';

const getGoogleApiEndpoints = () => {
    const { config } = firebase;
    const settings = store.getState()?.settingsdata?.settings || {};
    const projectId = config?.projectId;
    const websiteHost = `https://${projectId}.web.app`;
    const companyWebsite = settings.CompanyWebsite;
    const currentOrigin = typeof window !== 'undefined' ? window?.location?.origin : null;
    const hostedBase = currentOrigin && companyWebsite === currentOrigin ? currentOrigin : websiteHost;
    const functionBase = `https://us-central1-${projectId}.cloudfunctions.net`;
    const isWeb = typeof document !== 'undefined';

    return isWeb
        ? [`${hostedBase}/googleapi`, `${functionBase}/googleapi`]
        : [`${functionBase}/googleapi`, `${hostedBase}/googleapi`];
};

const parseGoogleApiResponse = async (response, endpoint) => {
    const responseText = await response.text();
    const contentType = response.headers?.get?.('content-type') || '';

    if (!response.ok) {
        throw new Error(`googleapi ${response.status} @ ${endpoint}: ${responseText.slice(0, 160)}`);
    }

    if (!contentType.toLowerCase().includes('application/json')) {
        throw new Error(`googleapi non-json @ ${endpoint}: ${responseText.slice(0, 160)}`);
    }

    try {
        return JSON.parse(responseText);
    } catch (error) {
        throw new Error(`googleapi invalid-json @ ${endpoint}: ${responseText.slice(0, 160)}`);
    }
};

const callGoogleApi = async (payload) => {
    const { config } = firebase;
    const endpoints = getGoogleApiEndpoints();
    let lastError = null;

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${base64.encode(config.projectId + ":" + AccessKey)}`
                },
                body: JSON.stringify(payload)
            });

            return await parseGoogleApiResponse(response, endpoint);
        } catch (error) {
            lastError = error;
            console.log(error);
        }
    }

    throw lastError || new Error('googleapi Call Error');
};

export const fetchPlacesAutocomplete = (searchKeyword, sessionToken) => {
    return new Promise((resolve,reject)=>{
        callGoogleApi({
                "searchKeyword": searchKeyword,
                "sessiontoken": sessionToken
            })
        .then(json => {
            if(json && json.searchResults) {
                resolve(json.searchResults);
            }else{
                reject(json.error);
            }
        }).catch(error=>{
            console.log(error);
            reject("fetchPlacesAutocomplete Call Error")
        })
    });
}

export const fetchCoordsfromPlace = (place_id) => {
    return new Promise((resolve,reject)=>{
        callGoogleApi({
                "place_id": place_id
            })
        .then(json => {
            if(json && json.coords) {
                resolve(json.coords);
            }else{
                reject(json.error);
            }
        }).catch(error=>{
            console.log(error);
            reject("fetchCoordsfromPlace Call Error")
        })
    });
}


export const fetchAddressfromCoords = (latlng) => {
    return new Promise((resolve,reject)=>{
        callGoogleApi({
                "latlng": latlng
            })
        .then(json => {
            if(json && json.address) {
                resolve(json.address);
            }else{
                reject(json.error);
            }
        }).catch(error=>{
            console.log(error);
            reject("fetchAddressfromCoords Call Error")
        })
    });
}

export const getDistanceMatrix = (startLoc, destLoc) => {
    return new Promise((resolve,reject)=>{
        callGoogleApi({
                "start": startLoc,
                "dest": destLoc,
                "calltype": "matrix",
            })
        .then(json => {
            if(json.error){
                console.log(json.error);
                reject(json.error);
            }else{
                resolve(json);
            }
        }).catch(error=>{
            console.log(error);
            reject("getDistanceMatrix Call Error")
        })
    });
}

export const getDirectionsApi = (startLoc, destLoc, waypoints) => {
    return new Promise((resolve,reject)=>{
        const body = {
            "start": startLoc,
            "dest": destLoc,
            "calltype": "direction",
        };
        if(waypoints){
            body["waypoints"] = waypoints;
        }
        callGoogleApi(body)
        .then(json => {
            if (json.hasOwnProperty('distance_in_km')) {
                resolve(json);
            }else{
                console.log(json.error);
                reject(json.error);
            }
        }).catch(error=>{
            console.log(error);
            reject("getDirectionsApi Call Error")
        })
    });
}
