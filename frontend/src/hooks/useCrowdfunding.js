import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';

export function useCrowdfunding(provider, signer) {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Inicializar contrato
  useEffect(() => {
    if (provider) {
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer || provider
      );
      setContract(contractInstance);
    }
  }, [provider, signer]);

  // Crear campaña
  const createCampaign = async (title, description, goalInEth, durationInDays, imageHash) => {
    if (!contract || !signer) {
      throw new Error('Wallet no conectada');
    }

    setLoading(true);
    setError(null);

    try {
      const goalInWei = ethers.parseEther(goalInEth.toString());

      // Si hay imageHash, agregarlo a la descripción (formato JSON)
      let fullDescription = description;
      if (imageHash) {
        fullDescription = JSON.stringify({
          text: description,
          image: imageHash
        });
      }

      const tx = await contract.createCampaign(
        title,
        fullDescription,
        goalInWei,
        durationInDays
      );

      const receipt = await tx.wait();
      setLoading(false);
      return receipt;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  // Contribuir a campaña
  const contribute = async (campaignId, amountInEth) => {
    if (!contract || !signer) {
      throw new Error('Wallet no conectada');
    }

    setLoading(true);
    setError(null);

    try {
      const amountInWei = ethers.parseEther(amountInEth.toString());
      const tx = await contract.contribute(campaignId, { value: amountInWei });
      const receipt = await tx.wait();
      setLoading(false);
      return receipt;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  // Retirar fondos
  const withdrawFunds = async (campaignId) => {
    if (!contract || !signer) {
      throw new Error('Wallet no conectada');
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.withdrawFunds(campaignId);
      const receipt = await tx.wait();
      setLoading(false);
      return receipt;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  // Obtener campaña del contrato
  const getCampaignFromContract = async (campaignId) => {
    if (!contract) return null;

    try {
      const campaign = await contract.campaigns(campaignId);
      return {
        id: Number(campaign.id),
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        goal: ethers.formatEther(campaign.goal),
        funds: ethers.formatEther(campaign.funds),
        deadline: Number(campaign.deadline),
        withdrawn: campaign.withdrawn
      };
    } catch (err) {
      console.error('Error obteniendo campaña:', err);
      return null;
    }
  };

  // Verificar si campaña está activa
  const isActive = async (campaignId) => {
    if (!contract) return false;
    try {
      return await contract.isActive(campaignId);
    } catch {
      return false;
    }
  };

  return {
    contract,
    loading,
    error,
    createCampaign,
    contribute,
    withdrawFunds,
    getCampaignFromContract,
    isActive
  };
}
