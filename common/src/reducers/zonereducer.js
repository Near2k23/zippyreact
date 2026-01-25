import {
  FETCH_ZONES,
  FETCH_ZONES_SUCCESS,
  FETCH_ZONES_FAILED,
  EDIT_ZONE,
  SET_CURRENT_ZONE
} from "../store/types";

const initialState = {
  loading: false,
  zones: [],
  currentZone: null,
  error: null
};

export const zonereducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ZONES:
      return {
        ...state,
        loading: true,
        error: null
      };
    case FETCH_ZONES_SUCCESS:
      return {
        ...state,
        loading: false,
        zones: action.payload,
        error: null
      };
    case FETCH_ZONES_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
        zones: []
      };
    case EDIT_ZONE:
      return {
        ...state,
        loading: true
      };
    case SET_CURRENT_ZONE:
      return {
        ...state,
        currentZone: action.payload
      };
    default:
      return state;
  }
};
