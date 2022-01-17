import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';

import OrderBook from './orderBook';
import Ticker from './ticker';

const TraderWrapper = () => {

    const [connect, setConnect] = useState(false)
    const [disconnect, setDisconnect] = useState(false)

    const closeConnection = () => {
        alert('close connection')
        setDisconnect(true)
        setTimeout(() => { setDisconnect(false) }, 5000)
        
    }

    const connectToWSS = () => {
        alert('connect')
        setConnect(true)
        setTimeout(() => { setConnect(false) }, 5000)
    }

    return (
        <main className='app-main'>
            <div className='app-header'>
                <h1 className='title'>Welcome to Bitfinex</h1>
                <div className='ml-auto'>
                    <a className='btn' onClick={() => closeConnection()}>Disconnect</a>
                    <a className='btn' onClick={() => connectToWSS()}>Connect</a>
                </div>
            </div>
            <div className='app-body'>
                <Ticker connect={connect} disconnect={disconnect} />
                <OrderBook connect={connect} disconnect={disconnect}  />
            </div>
        </main>
    )
}

export default TraderWrapper