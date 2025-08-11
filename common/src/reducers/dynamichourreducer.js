import { 
  FETCH_DYNAMIC_HOURS,
  FETCH_DYNAMIC_HOURS_SUCCESS,
  FETCH_DYNAMIC_HOURS_FAILED,
  EDIT_DYNAMIC_HOUR
} from "../store/types";

export const INITIAL_STATE = {
  items: null,
  loading: false,
  error: {
    flag: false,
    msg: null
  }
}

export const dynamichourreducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_DYNAMIC_HOURS:
      return {
        ...state,
        loading: true
      }
    case FETCH_DYNAMIC_HOURS_SUCCESS:
      return {
        ...state,
        items: action.payload,
        loading: false
      }
    case FETCH_DYNAMIC_HOURS_FAILED:
      return {
        ...state,
        items: null,
        loading: false,
        error: {
          flag: true,
          msg: action.payload
        }
      }
    case EDIT_DYNAMIC_HOUR:
      return state;
    default:
      return state;
  }
}


