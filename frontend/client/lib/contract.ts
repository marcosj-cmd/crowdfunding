import { ethers } from "ethers";
import CrowdfundingABI from "../../../abis/Crowdfunding.json";

// Configuración del contrato
export const CONTRACT_ADDRESS = "0x8e3CFa483b0749086217574deBD1c89EA93DA84f";

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
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}
