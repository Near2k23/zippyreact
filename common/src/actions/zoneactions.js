import {
  FETCH_ZONES,
  FETCH_ZONES_SUCCESS,
  FETCH_ZONES_FAILED,
  EDIT_ZONE,
  SET_CURRENT_ZONE
} from "../store/types";
import { firebase } from '../config/configureFirebase';
import { onValue, push, set, remove } from "firebase/database";

export const fetchZones = () => (dispatch) => {
  const { zonesRef } = firebase;

  dispatch({
    type: FETCH_ZONES,
    payload: null
  });

  onValue(
    zonesRef,
    snapshot => {
      if (snapshot && snapshot.exists()) {
        const data = snapshot.val();
        const arr = Object.keys(data).map(i => ({ id: i, ...data[i] }));
        dispatch({ type: FETCH_ZONES_SUCCESS, payload: arr });
      } else {
        dispatch({ type: FETCH_ZONES_SUCCESS, payload: [] });
      }
    },
    (error) => {
      dispatch({ type: FETCH_ZONES_FAILED, payload: error?.message || 'zones read failed' });
    }
  );
}

export const editZone = (zone, method) => (dispatch) => {
  const { zonesRef, zonesEditRef } = firebase;
  dispatch({
    type: EDIT_ZONE,
    payload: { method, zone }
  });
  if (method === 'Add') {
    push(zonesRef, zone);
  } else if (method === 'Delete') {
    remove(zonesEditRef(zone.id));
  } else {
    set(zonesEditRef(zone.id), zone);
  }
}

export const setCurrentZone = (zone) => (dispatch) => {
  dispatch({
    type: SET_CURRENT_ZONE,
    payload: zone
  });
}

export const isPointInZone = (lat, lng, zone) => {
  if (!zone.geometry || !zone.geometry.coordinates || zone.geometry.coordinates.length === 0) return false;
  const polygon = zone.geometry.coordinates[0];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lng) !== (yj > lng))
        && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

export const detectZoneByLocation = (lat, lng, zones) => {
  if (!zones || zones.length === 0) return null;
  
  for (const zone of zones) {
    if (zone.geometry) {
      if (zone.geometry.type === 'circle' && zone.geometry.center) {
        const distance = calculateDistance(
          lat, 
          lng, 
          zone.geometry.center.lat, 
          zone.geometry.center.lng
        );
        if (distance <= zone.geometry.radius) {
          return zone;
        }
      } else if (zone.geometry.type === 'polygon' && zone.geometry.coordinates) {
        if (isPointInPolygon([lng, lat], zone.geometry.coordinates)) {
          return zone;
        }
      }
    }
  }
  
  return null;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isPointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect =
      yi > y !== yj > y &&
      x < (xj - xi) * (y - yi) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}
