import { ethers } from "ethers";
import CrowdfundingABI from "../../../abis/Crowdfunding.json";

// Configuración del contrato
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export const ABI = CrowdfundingABI;

// Signer (conectado a wallet del usuario)
export async function getSigner(): Promise<ethers.Signer> {
  if (!(window as any).ethereum) {
    throw new Error("No se detectó MetaMask");
  }
  
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  return await provider.getSigner();
}

// Instancia del contrato (con wallet conectada para escribir)
export async function getContractWithSigner(): Promise<ethers.Contract> {
  console.log("CONTRACT_ADDRESS:", CONTRACT_ADDRESS);
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}

/**
 * Obtiene la cuenta conectada de MetaMask
 * @returns La dirección de la cuenta o null si no hay cuenta conectada
 */
export async function getConnectedAccount(): Promise<string | null> {
  const eth = (window as any).ethereum;
  if (!eth) return null;
  
  try {
    const accounts = await eth.request({ method: "eth_accounts" });
    return accounts && accounts.length > 0 ? accounts[0] : null;
  } catch (err) {
    console.error("Error obteniendo cuenta:", err);
    return null;
  }
}

/**
 * Escucha cambios en la cuenta de MetaMask
 * @param callback Función que se ejecuta cuando cambia la cuenta
 * @returns Función de limpieza para remover el listener
 */
export function onAccountsChanged(callback: (account: string | null) => void): () => void {
  const eth = (window as any).ethereum;
  if (!eth) return () => {};

  const handleAccountsChanged = (accounts: string[]) => {
    const account = accounts && accounts.length > 0 ? accounts[0] : null;
    callback(account);
  };

  eth.on?.("accountsChanged", handleAccountsChanged);

  // Retornar función de limpieza
  return () => {
    eth.removeListener?.("accountsChanged", handleAccountsChanged);
  };
}
