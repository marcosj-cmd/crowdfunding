import { ethers } from "ethers";
import dotenv from "dotenv";
import axios from "axios";

import Campaign from "../models/Campaign.js";
import Contribution from "../models/Contribution.js";
import SyncStateService from "./SyncStateService.js";
import CrowdfundingJson from "../../abis/Crowdfunding.json" with { type: "json" };

dotenv.config();

// ──────────────────────────────────────────────────────────────
// Configuración
// ──────────────────────────────────────────────────────────────
const CONFIG = {
  contractAddress: process.env.CONTRACT_ADDRESS,
  rpcUrl: process.env.RPC_URL,
  deployBlock: Number(process.env.DEPLOY_BLOCK),
  syncStep: Number(process.env.SYNC_STEP ?? 1000),
  syncDelay: Number(process.env.SYNC_DELAY_MS ?? 300),
  ipfsGateway: 'https://gateway.pinata.cloud/ipfs/',
  ipfsTimeout: 30000,
};

console.log("📝 CONTRACT_ADDRESS:", CONFIG.contractAddress);

// ──────────────────────────────────────────────────────────────
// Setup del contrato
// ──────────────────────────────────────────────────────────────
const ABI = Array.isArray(CrowdfundingJson) ? CrowdfundingJson : CrowdfundingJson.abi;
const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
const contract = new ethers.Contract(CONFIG.contractAddress, ABI, provider);
const iface = new ethers.Interface(ABI);

// Silenciar logs de "filter not found"
provider._log = (level, args) => {
  const hasFilterNotFound = Array.isArray(args) && 
    args.some(msg => typeof msg === 'string' && msg.toLowerCase().includes('filter not found'));
  if (!hasFilterNotFound) {
    console.log(`[${level}]`, ...args);
  }
};

// ──────────────────────────────────────────────────────────────
// Utilidades
// ──────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchMetadataFromIPFS(ipfsUri) {
  const startTime = Date.now();
  try {
    const httpUrl = ipfsUri.replace('ipfs://', CONFIG.ipfsGateway);
    console.log(`⏳ Fetching metadata from: ${httpUrl}`);
    
    const response = await axios.get(httpUrl, { timeout: CONFIG.ipfsTimeout });
    const metadata = response.data;
    
    const elapsedTime = Date.now() - startTime;
    console.log(`✅ Metadata fetched in ${elapsedTime}ms`);
    
    return {
      title: metadata.name || 'Sin título',
      description: metadata.description || '',
      image: metadata.image ? metadata.image.replace('ipfs://', CONFIG.ipfsGateway) : ''
    };
  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    console.error(`❌ Error fetching IPFS metadata after ${elapsedTime}ms:`, error.message);
    return { title: 'Error loading metadata', description: '', image: '' };
  }
}

function calculateDaysLeft(deadlineTimestamp) {
  const deadlineMs = Number(deadlineTimestamp) * 1000;
  return {
    deadlineMs,
    daysLeft: Math.max(0, Math.floor((deadlineMs - Date.now()) / (1000 * 60 * 60 * 24)))
  };
}

// ──────────────────────────────────────────────────────────────
// Handlers de eventos
// ──────────────────────────────────────────────────────────────
async function handleCampaignCreated(id, owner, title, description, goal, deadline, metadataUri) {
  const goalEth = ethers.formatEther(goal);
  const { deadlineMs, daysLeft } = calculateDaysLeft(deadline);

  const campaignData = {
    id: Number(id),
    owner,
    title,
    description,
    goal: goalEth,
    deadline: deadlineMs,
    daysLeft,
    funds: "0.0",
    withdrawn: false,
    metadataUri,
  };

  // Descargar metadata de IPFS si existe
  if (metadataUri && metadataUri.startsWith('ipfs://')) {
    try {
      const metadata = await fetchMetadataFromIPFS(metadataUri);
      campaignData.image = metadata.image;
    } catch (err) {
      console.error('❌ Error parsing IPFS metadata:', err);
    }
  }

  await Campaign.updateOne({ id: Number(id) }, campaignData, { upsert: true });
  console.log(`📢 Nueva campaña creada: ID ${id}, owner ${owner}`);
}

async function handleContribution(id, contributor, amount) {
  const campaign = await Campaign.findOne({ id: Number(id) });
  if (!campaign) {
    console.warn(`⚠️ Campaña ${id} no encontrada en la base de datos`);
    return;
  }

  const prevFunds = parseFloat(campaign.funds ?? "0");
  const amountEth = parseFloat(ethers.formatEther(amount));
  const newFunds = (prevFunds + amountEth).toFixed(6);
  
  campaign.funds = newFunds;
  await campaign.save();

  await Contribution.create({
    owner: contributor,
    campaignId: Number(id),
    amount: amountEth,
    timestamp: new Date(),
  });

  console.log(`💰 Contribución: campaña ${id}, ${amountEth} ETH, de ${contributor}`);
}

async function handleFundsWithdrawn(id) {
  const campaign = await Campaign.findOne({ id: Number(id) });
  if (campaign) {
    campaign.funds = "0.0";
    campaign.withdrawn = true;
    await campaign.save();
    console.log(`🏦 Retiro: campaña ${id}`);
  }
}

// ──────────────────────────────────────────────────────────────
// Listener en tiempo real
// ──────────────────────────────────────────────────────────────
export async function startListener() {
  console.log("👂 Escuchando eventos del contrato...");

  const handleBlockPersist = async (ev) => {
    const bn = ev?.blockNumber ?? ev?.log?.blockNumber;
    await SyncStateService.saveLastBlock(bn);
  };

  contract.on("CampaignCreated", async (id, owner, title, description, goal, deadline, metadataUri, ev) => {
    try {
      console.log(`🔔 Evento CampaignCreated recibido - ID: ${id}`);
      await handleCampaignCreated(id, owner, title, description, goal, deadline, metadataUri);
      await handleBlockPersist(ev);
    } catch (err) {
      console.error("❌ Error en CampaignCreated:", err.message);
    }
  });

  contract.on("Contribution", async (id, contributor, amount, ev) => {
    try {
      await handleContribution(id, contributor, amount);
      await handleBlockPersist(ev);
    } catch (err) {
      console.error("❌ Error en Contribution:", err.message);
    }
  });

  contract.on("FundsWithdrawn", async (id, amount, ev) => {
    try {
      await handleFundsWithdrawn(id);
      await handleBlockPersist(ev);
    } catch (err) {
      console.error("❌ Error en FundsWithdrawn:", err.message);
    }
  });
}


// ──────────────────────────────────────────────────────────────
// Guardado al salir
// ──────────────────────────────────────────────────────────────
process.on("SIGINT", async () => {
  try {
    const now = await provider.getBlockNumber();
    await SyncStateService.saveLastBlock(now);
    console.log(`👋 Saliendo...`);
  } finally {
    process.exit(0);
  }
});
