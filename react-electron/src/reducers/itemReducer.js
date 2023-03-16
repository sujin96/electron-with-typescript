import { REMOVE_FROM_CART, ADD_TO_CART, SET_QUANTITY } from "../actions/index";
import { initialState } from "./initialState";

const itemReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      //TODO
      return Object.assign({}, state, {
        cartItems: [...state.cartItems, action.payload],
      });

      break;
    case REMOVE_FROM_CART:
      //TODO
      let data = state.cartItems.filter(
        (item) => item.itemId !== action.payload.itemId
      );
      return Object.assign({}, state, {
        cartItems: data,
      });

      break;
    case SET_QUANTITY:
      let idx = state.cartItems.findIndex(
        (el) => el.itemId === action.payload.itemId
      );
      let cartData = state.cartItems.slice();
      //TODO
      cartData[idx].quantity = action.payload.quantity;
      return Object.assign({}, state, {
        cartItems: cartData,
      });

      break;
    default:
      return state;
  }
};

export default itemReducer;
