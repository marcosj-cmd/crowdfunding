import { ethers } from "ethers";
import { getContractWithSigner } from "@/lib/contract";

export interface CreateCampaignParams {
  title: string;
  description: string;
  goal: string; // en ETH
  days: string;
  metadataUri: string;
}

/**
 * Crea una nueva campaña en el smart contract
 */
export async function createCampaign(params: CreateCampaignParams): Promise<ethers.ContractTransactionResponse> {
  const { title, description, goal, days, metadataUri } = params;

  const contract = await getContractWithSigner();

  // Convertir goal de ETH a Wei
  const goalInWei = ethers.parseEther(goal);
  const daysNum = parseInt(days);

  console.log("Creating campaign on blockchain...", {
    title,
    description,
    goal: goalInWei.toString(),
    days: daysNum,
    // metadataUri // Comentado hasta que actualices el contrato
  });

  // Llamar al contrato SIN metadataUri (tu contrato actual no lo soporta)
  const tx = await contract.createCampaign(
    title,
    description,
    goalInWei,
    daysNum
    // metadataUri // TODO: Descomentar cuando actualices el contrato y ABI
  );

  console.log("Transaction sent:", tx.hash);
  return tx;
}

/**
 * Contribuye ETH a una campaña
 */
export async function contributeToCampaign(
  campaignId: number,
  amount: string // en ETH
): Promise<ethers.ContractTransactionResponse> {
  const contract = await getContractWithSigner();

  const amountInWei = ethers.parseEther(amount);

  console.log(`Contributing ${amount} ETH to campaign ${campaignId}`);

  const tx = await contract.contribute(campaignId, {
    value: amountInWei
  });

  console.log("Transaction sent:", tx.hash);
  return tx;
}

/**
 * Retira fondos de una campaña (solo owner)
 */
export async function withdrawFunds(campaignId: number): Promise<ethers.ContractTransactionResponse> {
  const contract = await getContractWithSigner();

  console.log(`Withdrawing funds from campaign ${campaignId}`);

  const tx = await contract.withdrawFunds(campaignId);

  console.log("Transaction sent:", tx.hash);
  return tx;
}

/**
 * Solicita reembolso de una campaña fallida
 */
export async function refundContribution(campaignId: number): Promise<ethers.ContractTransactionResponse> {
  const contract = await getContractWithSigner();

  console.log(`Requesting refund from campaign ${campaignId}`);

  const tx = await contract.refund(campaignId);

  console.log("Transaction sent:", tx.hash);
  return tx;
}
