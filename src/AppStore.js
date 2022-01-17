import React from 'react';
import { createStore } from 'redux';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { composeWithDevTools } from "redux-devtools-extension";

const initialState = {
    socket: null,
    ticker: null,
    orderBookBids: [],
    orderBookAsks: [],
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'set_socket_data':
            return {
                ...state,
                socket: action.socket,
            };
        case 'set_ticker_data':
            return {
                ...state,
                ticker: action.ticker,
            };
        case 'set_bids_order_book_data':
            return {
                ...state,
                orderBookBids: [...state.orderBookBids.slice(-24), action.orderBook]
            };
        case 'set_asks_order_book_data':
            return {
                ...state,
                orderBookAsks:  [...state.orderBookAsks.slice(-24), action.orderBook]
            };
        default:
            return state
    }
};

const Store = createStore(
  reducer,
  composeWithDevTools()
);

function AppStore(props) {
    return (<Provider store={Store}>{props.children}</Provider>);
}

export default AppStore;
