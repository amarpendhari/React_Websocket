import React from 'react'
import './App.css';
import './styles/index.scss'

import AppStore from './AppStore';

import TraderWrapper from './components/traderWrapper';

function App() {

    return (
        <AppStore>
            <div className="App">
                <TraderWrapper />
            </div>
        </AppStore>
    );
}

export default App;
