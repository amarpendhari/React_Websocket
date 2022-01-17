import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';

import BitcoinSvg from '../assets/svgs/btc.svg'
import ArrowUpSvg from '../assets/svgs/arrow-up.svg'
import ArrowDownSvg from '../assets/svgs/arrow-down.svg'

const Ticker = (props) => {

    const { connect, disconnect } = props
    const dispatch = useDispatch();
    
    let tickerData = useSelector(state => state.ticker);

    const values = [ 'BID', 'BID_SIZE', 'ASK', 'ASK_SIZE', 'DAILY_CHANGE', 'DAILY_CHANGE_RELATIVE', 'LAST_PRICE', 'VOLUME', 'HIGH', 'LOW' ]

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

    const connectToWSS = () => {
        const ws = new WebSocket("wss://api-pub.bitfinex.com/ws/2");
        setSocket(ws)
        const apiCall = { 
            event: 'subscribe', 
            channel: 'ticker', 
            symbol: 'tBTCUSD' 
        };
        ws.onopen = (event) => {
            setConnected(true)
            clearInterval(retryConnection)
            ws.send(JSON.stringify(apiCall));
        };
        ws.onmessage = function (event) {
            const json = JSON.parse(event.data);
            clearTimeout(checkConnection)
            if ((json.event = "data") && Array.isArray(json[1])) {
                const result = json[1].reduce((obj, cur, i) => ({...obj, [values[i]]: cur}), {})
                dispatch({
                    type: 'set_ticker_data',
                    ticker: result
                });
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
        if(disconnect && connected) {
            closeConnection()
        }
    },[connect, disconnect])

    return (
        <>
            <div className='ticker-container'>
                <img className='bit-img' src={BitcoinSvg} alt={`BitcoinSvg`} />
                <div className='volume-low-div'>
                    <h4 className=''><u>BTC/USD</u></h4>
                    <p className=''><span>VOL </span> 
                        {tickerData?.VOLUME.toLocaleString() || 'NA'} <u><span> BTC</span></u>
                    </p>
                    <p><span>LOW </span> {tickerData?.LOW.toLocaleString() || 'NA'}</p>
                </div>
                <div className='ml-auto percent-high-div'>
                    <h4 className=''>
                        {tickerData?.LAST_PRICE.toLocaleString() || 'NA'}
                    </h4>
                    {Number(tickerData?.LAST_PRICE) > Number(tickerData?.HIGH) 
                    ? <p className='percent green-text'>
                        {Math.abs(tickerData?.DAILY_CHANGE.toFixed(2)) || 'NA'}
                        <img src={ArrowUpSvg} alt={`ArrowUpSvg`} />
                        ({(tickerData?.DAILY_CHANGE_RELATIVE*100).toFixed(2)}%)
                    </p>
                    : <p className='percent red-text'>
                        {Math.abs(tickerData?.DAILY_CHANGE.toFixed(2)) || 'NA'}
                        <img src={ArrowDownSvg} alt={`ArrowDownSvg`} />
                        ({(tickerData?.DAILY_CHANGE_RELATIVE*100).toFixed(2)}%)
                    </p>}
                    <p><span>HIGH </span> {tickerData?.HIGH.toLocaleString() || 'NA'}</p>
                </div>
            </div>
        </>
        
    )
}

export default Ticker