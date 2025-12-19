import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import CampaignList from './components/CampaignList';
import CreateCampaign from './components/CreateCampaign';
import CampaignDetail from './components/CampaignDetail';
import { useWallet } from './hooks/useWallet';
import './styles/App.css';

function App() {
  const { account, provider, signer, connectWallet, isConnected, chainId, error } = useWallet();

  return (
    <Router>
      <div className="app">
        <Header
          account={account}
          connectWallet={connectWallet}
          isConnected={isConnected}
          chainId={chainId}
        />

        {error && <div className="error-banner">{error}</div>}

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <CampaignList
                provider={provider}
                signer={signer}
                account={account}
              />
            } />
            <Route path="/create" element={
              <CreateCampaign
                signer={signer}
                account={account}
                isConnected={isConnected}
              />
            } />
            <Route path="/campaign/:id" element={
              <CampaignDetail
                provider={provider}
                signer={signer}
                account={account}
              />
            } />
          </Routes>
        </main>

        <footer className="footer">
          <p>CrowdFund DApp - Plataforma de Crowdfunding Descentralizada en Sepolia</p>
          <p>Contrato: <a href="https://sepolia.etherscan.io/address/0x3cebA30E37c91E6CD74d84d5Ce0d18c8248aaF59" target="_blank" rel="noreferrer">
            0x3cebA30E37c91E6CD74d84d5Ce0d18c8248aaF59
          </a></p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
