import {
  FETCH_BANNERS,
  FETCH_BANNERS_SUCCESS,
  FETCH_BANNERS_FAILED,
  EDIT_BANNERS
} from "../store/types";
import { firebase } from '../config/configureFirebase';
import { onValue, push, set, remove } from "firebase/database";

export const fetchBanners = () => (dispatch) => {
  const {
    bannerRef
  } = firebase;

  dispatch({
    type: FETCH_BANNERS,
    payload: null
  });

  onValue(bannerRef, snapshot => {
    if (snapshot.val()) {
      const data = snapshot.val();
      const arr = Object.keys(data).map(i => {
        data[i].id = i;
        return data[i];
      });

      dispatch({
        type: FETCH_BANNERS_SUCCESS,
        payload: arr
      });
    } else {
      dispatch({
        type: FETCH_BANNERS_SUCCESS,
        payload: []
      });
    }
  }, error => {
    dispatch({
      type: FETCH_BANNERS_FAILED,
      payload: error?.message || "No banners available."
    });
  });
};

export const editBanner = (banner, method) => (dispatch) => {
  const {
    bannerRef,
    bannerEditRef
  } = firebase;

  dispatch({
    type: EDIT_BANNERS,
    payload: { method, banner }
  });

  if (method === 'Add') {
    push(bannerRef, banner);
  } else if (method === 'Delete') {
    remove(bannerEditRef(banner.id));
  } else {
    set(bannerEditRef(banner.id), banner);
  }
};
