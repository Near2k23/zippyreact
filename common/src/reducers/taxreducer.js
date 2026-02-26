import {
  FETCH_TAXES,
  FETCH_TAXES_SUCCESS,
  FETCH_TAXES_FAILED,
  EDIT_TAXES
} from "../store/types";

export const INITIAL_STATE = {
  taxes: null,
  loading: false,
  error: {
    flag: false,
    msg: null
  }
};

export const taxreducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_TAXES:
      return {
        ...state,
        loading: true
      };
    case FETCH_TAXES_SUCCESS:
      return {
        ...state,
        taxes: action.payload,
        loading: false
      };
    case FETCH_TAXES_FAILED:
      return {
        ...state,
        taxes: null,
        loading: false,
        error: {
          flag: true,
          msg: action.payload
        }
      };
    case EDIT_TAXES:
      return state;
    default:
      return state;
  }
};
