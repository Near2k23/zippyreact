import {
  FETCH_TAXES,
  FETCH_TAXES_SUCCESS,
  FETCH_TAXES_FAILED,
  EDIT_TAXES
} from "../store/types";
import { firebase } from '../config/configureFirebase';
import { onValue, push, set, remove } from "firebase/database";

export const fetchTaxes = () => (dispatch) => {
  const { taxesRef } = firebase;

  dispatch({
    type: FETCH_TAXES,
    payload: null
  });

  onValue(taxesRef, snapshot => {
    if (snapshot.val()) {
      const data = snapshot.val();
      const arr = Object.keys(data).map(i => {
        data[i].id = i;
        return data[i];
      });
      dispatch({
        type: FETCH_TAXES_SUCCESS,
        payload: arr
      });
    } else {
      dispatch({
        type: FETCH_TAXES_FAILED,
        payload: "No taxes available."
      });
    }
  });
};

export const editTax = (tax, method) => (dispatch) => {
  const { taxesRef, taxesEditRef } = firebase;

  dispatch({
    type: EDIT_TAXES,
    payload: { method, tax }
  });

  if (method === 'Add') {
    push(taxesRef, tax);
  } else if (method === 'Delete') {
    remove(taxesEditRef(tax.id));
  } else {
    set(taxesEditRef(tax.id), tax);
  }
};
