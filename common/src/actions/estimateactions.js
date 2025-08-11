import {
  FETCH_ESTIMATE,
  FETCH_ESTIMATE_SUCCESS,
  FETCH_ESTIMATE_FAILED,
  CLEAR_ESTIMATE
} from "../store/types";
import Polyline from '@mapbox/polyline';
import { firebase } from '../config/configureFirebase';
import { FareCalculator } from '../other/FareCalculator';
import { onValue } from "firebase/database";

export const getEstimate = (bookingData) => async (dispatch) => {
  const   {
      settingsRef,
      dynamicHoursRef
  } = firebase;

  dispatch({
    type: FETCH_ESTIMATE,
    payload: bookingData,
  });
          

  let res = bookingData.routeDetails;

  if(res){
    let points = Polyline.decode(res.polylinePoints);

    let waypoints = points.map((point) => {
        return {
            latitude: point[0],
            longitude: point[1]
        }
    });
    
    onValue(settingsRef, settingdata => {
      let settings = settingdata.val();
      let distance = settings.convert_to_mile? (res.distance_in_km / 1.609344) : res.distance_in_km;

      onValue(dynamicHoursRef, dynSnap => {
        const rules = dynSnap.val();
        let activeRule = null;
        if (rules) {
          const nowTs = bookingData.bookLater && bookingData.tripdate ? bookingData.tripdate : new Date().getTime();
          const nowDate = new Date(nowTs);
          const nowMinutes = (nowDate.getHours() * 60) + nowDate.getMinutes();

          const toMinutesOfDay = (value) => {
            if (value === null || value === undefined) return null;
            if (typeof value === 'string') {
              if (value.includes(':')) {
                const parts = value.split(':');
                const hours = parseInt(parts[0], 10) || 0;
                const minutes = parseInt(parts[1], 10) || 0;
                return (hours * 60) + minutes;
              }
              const asNum = parseFloat(value);
              if (!isNaN(asNum)) return toMinutesOfDay(asNum);
              return null;
            }
            if (typeof value === 'number') {
              if (value > 1e12 || value > 1e9) {
                const date = new Date(value > 1e12 ? value : value * 1000);
                return (date.getHours() * 60) + date.getMinutes();
              }
              if (value >= 0 && value < 1440) return value;
              return null;
            }
            return null;
          };

          const arr = Object.keys(rules).map(k => ({ id: k, ...rules[k] }));
          for (const rule of arr) {
            if (rule && rule.active) {
              const startVal = rule.start_hour !== undefined ? rule.start_hour : rule.start_time;
              const endVal = rule.end_hour !== undefined ? rule.end_hour : rule.end_time;
              const startMinutes = toMinutesOfDay(startVal);
              const endMinutes = toMinutesOfDay(endVal);

              if (startMinutes !== null && endMinutes !== null) {
                const wrapsMidnight = endMinutes < startMinutes;
                const inRange = wrapsMidnight
                  ? (nowMinutes >= startMinutes || nowMinutes <= endMinutes)
                  : (nowMinutes >= startMinutes && nowMinutes <= endMinutes);
                if (inRange) {
                  activeRule = rule; break;
                }
              }
            }
          }
        }

        let {totalCost, grandTotal, convenience_fees, dynamic_fee} = FareCalculator(
          distance,
          res.time_in_secs,
          bookingData.carDetails,
          bookingData.instructionData,
          settings.decimal,
          activeRule
        );
        
        dispatch({
          type: FETCH_ESTIMATE_SUCCESS,
          payload: {
            pickup:bookingData.pickup,
            drop:bookingData.drop,
            carDetails:bookingData.carDetails,
            instructionData: bookingData.instructionData,
            estimateDistance: parseFloat(parseFloat(distance).toFixed(settings.decimal)),
            fareCost: totalCost ? parseFloat(parseFloat(totalCost).toFixed(settings.decimal)) : 0,
            estimateFare: grandTotal ? parseFloat(parseFloat(grandTotal).toFixed(settings.decimal)) : 0,
            estimateTime:res.time_in_secs,
            convenience_fees: convenience_fees ? parseFloat(parseFloat(convenience_fees).toFixed(settings.decimal)) : 0,
            dynamic_fee: dynamic_fee ? parseFloat(parseFloat(dynamic_fee).toFixed(settings.decimal)) : 0,
            waypoints: waypoints
          },
        });
      }, {onlyOnce:true});
    }, {onlyOnce:true});
  }else{
    dispatch({
      type: FETCH_ESTIMATE_FAILED,
      payload: "No Route Found",
    });
  }

}

export const clearEstimate = () => (dispatch) => {
    dispatch({
        type: CLEAR_ESTIMATE,
        payload: null,
    });    
}
