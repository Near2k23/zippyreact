import {
  FETCH_BANNERS,
  FETCH_BANNERS_SUCCESS,
  FETCH_BANNERS_FAILED,
  EDIT_BANNERS
} from "../store/types";

const INITIAL_STATE = {
  banners: null,
  loading: false,
  error: {
    flag: false,
    msg: null
  }
};

export const bannerreducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_BANNERS:
      return {
        ...state,
        loading: true
      };
    case FETCH_BANNERS_SUCCESS:
      return {
        ...state,
        banners: action.payload,
        loading: false,
        error: {
          flag: false,
          msg: null
        }
      };
    case FETCH_BANNERS_FAILED:
      return {
        ...state,
        banners: [],
        loading: false,
        error: {
          flag: true,
          msg: action.payload
        }
      };
    case EDIT_BANNERS:
      return state;
    default:
      return state;
  }
};
