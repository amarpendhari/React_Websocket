import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';

const OrderBook = (props) => {

    const { connect, disconnect } = props

    const dispatch = useDispatch();
    const bidsData = useSelector(state => state.orderBookBids);
    const asksData = useSelector(state => state.orderBookAsks);

    const [connected, setConnected] = useState(false)
    const [socket, setSocket] = useState(null)

    let checkConnection = null;
    let retryConnection = null;

    const closeConnection = () => {
        socket.close()
        clearTimeout(checkConnection)
        checkConnection = null
    }

    const tryToReconnect = () => {
        connectToWSS()
    }

    const fnCheckConnection = () => {
        setConnected(false)
        retryConnection = setInterval(tryToReconnect, 15000)
    }

    const formatData = (arr) => {
        if(arr?.length === 3) {
            if(arr[1] !== 0 && arr[1] > 0) {
                let obj = {
                    PREV_TOTAL: 0,
                    TOTAL: Math.abs(arr[2]).toFixed(4),
                    // TOTAL: Math.abs((arr[1] * arr[2])).toFixed(4),
                    PRICE: arr[0].toLocaleString(),
                    COUNT: arr[1],
                    AMOUNT: Math.abs(arr[2]).toFixed(4),
                }
                if(arr[2] > 0) {
                    dispatch({
                        type: 'set_bids_order_book_data',
                        orderBook: obj
                    });
                } else {
                    dispatch({
                        type: 'set_asks_order_book_data',
                        orderBook: obj
                    });
                }
            }
        }
    }

    const connectToWSS = () => {
        const ws = new WebSocket("wss://api-pub.bitfinex.com/ws/2");
        setSocket(ws)
        const apiCall = { 
            event: 'subscribe', 
            channel: 'book',
            // prec: 'R0',
            freq: 'F1',
            // len: '1',
            symbol: 'fUSD',
            pair: 'BTCUSD'
        };
        ws.onopen = (event) => {
            setConnected(true)
            clearInterval(retryConnection)
            ws.send(JSON.stringify(apiCall));
        };
        ws.onmessage = function (event) {
            const json = JSON.parse(event.data);
            clearTimeout(checkConnection)
            if ((json.event = "data") && Array.isArray(json[1]) && json[1]?.length === 3) {
                formatData(json[1])
            } else if(json[1]?.length > 3) {
                json[1].forEach(el => {
                    formatData(el)
                })
            }
            checkConnection = setTimeout(() => fnCheckConnection(), 20000);
        };
        ws.onerror = (event) => {
            clearTimeout(checkConnection)
            console.log('WebSocket error: ', event);
        }
        ws.onclose = (event) => {
            setConnected(false)
            clearTimeout(checkConnection)
            console.log('The connection has been closed successfully.', event);
        }
    }

    useEffect(() => {
        connectToWSS()
    },[])

    useEffect(() => {
        if(connect && !connected) {
            connectToWSS()
        }
        if(disconnect) {
            closeConnection()
        }
    },[connect, disconnect])

    return (
        <div className='order-book-container'>
            {bidsData?.length === 0 || asksData?.length === 0 ? <div className='order-book-loader'>Loading Data...</div> : null}
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Count</th>
                        <th>Amount</th>
                        <th>Total</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {bidsData?.length
                    ? bidsData.map((bids,i) => {
                        let total;
                        if(i !== 0) {
                            total = (Number(bids.AMOUNT)+Number(bids.PREV_TOTAL)).toFixed(4)
                            if(i !== bidsData?.length-1) {
                                bidsData[i+1].PREV_TOTAL = total  
                            }
                        } else {
                            total = bids?.TOTAL
                            if(bidsData[i+1]) bidsData[i+1].PREV_TOTAL = bids?.TOTAL
                        }
                        let finalTotal = (Number(bidsData[bidsData.length-1].PREV_TOTAL)+Number(bidsData[bidsData.length-1].AMOUNT)).toFixed(2)
                        let width = i === bidsData.length-1 ? '100' : (Math.round((total / finalTotal) * 100))
                        // console.log('bids calac', total, finalTotal, width)
                        return (
                            <tr key={i} className='bids-row'>
                                <td><span style={{ 'width': `${Number(width) >= 100 ? '100' : width}%`}}></span></td>
                                <td>{bids?.COUNT}</td>
                                <td>{bids?.AMOUNT}</td>
                                <td>{total}</td>
                                {/* <td>{total +'  '+ finalTotal +' '+ Math.round((total / finalTotal) * 100) + '   ' + width}</td> */}
                                <td>{bids?.PRICE}</td>
                            </tr>
                        )
                    })
                    : null}
                </tbody>
            </table>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Amount</th>
                        <th>Count</th>                        
                    </tr>
                </thead>
                <tbody>
                    {asksData?.length
                    ? asksData.map((asks,i) => {
                        let total;
                        if(i !== 0) {
                            total = (Number(asks.AMOUNT)+Number(asks.PREV_TOTAL)).toFixed(4)
                            if(i !== asksData?.length-1) {
                                asksData[i+1].PREV_TOTAL = total  
                            }
                        } else {
                            total = asks?.TOTAL
                            if(asksData[i+1]) asksData[i+1].PREV_TOTAL = asks?.TOTAL
                        }
                        let finalTotal = (Number(asksData[asksData.length-1].PREV_TOTAL)+Number(asksData[asksData.length-1].AMOUNT))
                        let width = i === asksData.length-1 ? '100' : (Math.round((total / finalTotal) * 100)).toString().slice(0,2)
                        // console.log('asks calac', total, finalTotal, width)
                        return (
                            <tr key={i} className='asks-row'>
                                <td><span style={{ 'width': `${Number(width) >= 100 ? '100' : width}%`}}></span></td>
                                <td>{asks?.PRICE}</td>
                                <td>{total}</td>
                                {/* <td>{total +'  '+ finalTotal +' '+ Math.round((total / finalTotal) * 100) + '   ' + width}</td> */}
                                <td>{asks?.AMOUNT}</td>
                                <td>{asks?.COUNT}</td>
                            </tr>
                        )
                    })
                    : null}
                </tbody>
            </table>
        </div>
    )
}

export default OrderBook