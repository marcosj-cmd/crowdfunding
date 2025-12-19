import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 en hex

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);

  // Verificar si está en la red correcta
  const checkNetwork = useCallback(async () => {
    if (window.ethereum) {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(currentChainId);

      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        setError('Por favor, cambia a la red Sepolia');
        return false;
      }
      setError(null);
      return true;
    }
    return false;
  }, []);

  // Cambiar a red Sepolia
  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      // Si la red no existe, agregarla
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Testnet',
              nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://gateway.tenderly.co/public/sepolia'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }],
          });
        } catch (addError) {
          setError('Error al agregar la red Sepolia');
        }
      }
    }
  };

  // Conectar wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Por favor, instala MetaMask para usar esta aplicación');
      return;
    }

    try {
      // Solicitar acceso a la cuenta
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Verificar red
      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        await switchToSepolia();
      }

      // Crear provider y signer con ethers v6
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();

      setProvider(browserProvider);
      setSigner(signer);
      setAccount(accounts[0]);
      setError(null);

    } catch (err) {
      console.error('Error conectando wallet:', err);
      setError('Error al conectar MetaMask');
    }
  };

  // Escuchar cambios de cuenta y red
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
          setSigner(null);
        } else {
          setAccount(accounts[0]);
          connectWallet(); // Reconectar para actualizar signer
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        setChainId(chainId);
        window.location.reload();
      });

      // Verificar conexión existente al cargar
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts) => {
          if (accounts.length > 0) {
            connectWallet();
          }
        });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return {
    account,
    provider,
    signer,
    chainId,
    error,
    connectWallet,
    isConnected: !!account,
    switchToSepolia
  };
}
