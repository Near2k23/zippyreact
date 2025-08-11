import {
  FETCH_DYNAMIC_HOURS,
  FETCH_DYNAMIC_HOURS_SUCCESS,
  FETCH_DYNAMIC_HOURS_FAILED,
  EDIT_DYNAMIC_HOUR
} from "../store/types";
import { firebase } from '../config/configureFirebase';
import { onValue, push, set, remove } from "firebase/database";

export const fetchDynamicHours = () => (dispatch) => {
  const { dynamicHoursRef } = firebase;

  dispatch({
    type: FETCH_DYNAMIC_HOURS,
    payload: null
  });

  onValue(
    dynamicHoursRef,
    snapshot => {
      if (snapshot && snapshot.exists()) {
        const data = snapshot.val();
        const arr = Object.keys(data).map(i => ({ id: i, ...data[i] }));
        dispatch({ type: FETCH_DYNAMIC_HOURS_SUCCESS, payload: arr });
      } else {
        dispatch({ type: FETCH_DYNAMIC_HOURS_FAILED, payload: "No dynamic hours available." });
      }
    },
    (error) => {
      dispatch({ type: FETCH_DYNAMIC_HOURS_FAILED, payload: error?.message || 'dynamic hours read failed' });
    }
  );
}

export const editDynamicHour = (item, method) => (dispatch) => {
  const { dynamicHoursRef, dynamicHoursEditRef } = firebase;
  dispatch({
    type: EDIT_DYNAMIC_HOUR,
    payload: { method, item }
  });
  if (method === 'Add') {
    push(dynamicHoursRef, item);
  } else if (method === 'Delete') {
    remove(dynamicHoursEditRef(item.id));
  } else {
    set(dynamicHoursEditRef(item.id), item);
  }
}


