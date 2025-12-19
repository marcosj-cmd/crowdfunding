import { useState, useEffect } from "react";

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    // Cargar cuenta actual si ya está conectada
    const loadAccount = async () => {
      try {
        const accounts = await eth.request({ method: "eth_accounts" });
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error loading account:", error);
      }
    };

    loadAccount();

    // Escuchar cambios de cuenta
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
      }
    };

    eth.on && eth.on("accountsChanged", handleAccountsChanged);

    return () => {
      eth.removeListener && eth.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  const connectWallet = async () => {
    const eth = (window as any).ethereum;
    
    if (!eth) {
      alert("Please install MetaMask to use this app");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet: " + (error?.message || "Unknown error"));
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  return {
    account,
    isConnected: !!account,
    isConnecting,
    connectWallet,
    disconnectWallet
  };
}
