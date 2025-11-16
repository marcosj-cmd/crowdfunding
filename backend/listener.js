import { ethers } from "ethers";
import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";

import Campaign from "./models/Campaign.js";
import SyncState from "./models/SyncState.js";
import CrowdfundingJson from "../abis/Crowdfunding.json" with { type: "json" };
import Contribution from "./models/Contribution.js";

// ──────────────────────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────────────────────
dotenv.config();
console.log("CONTRACT_ADDRESS:", process.env.CONTRACT_ADDRESS);

// ABI robusto: soporta que el JSON sea { abi: [...] } o [...] directamente
const ABI = Array.isArray(CrowdfundingJson) ? CrowdfundingJson : CrowdfundingJson.abi;

// Provider (recomendado: RPC público o tu Infura/Alchemy)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Silenciar "filter not found" ruidoso interno de ethers
const DEPLOY = Number(process.env.DEPLOY_BLOCK)

// Función para detectar mensajes de "filter not found"
function hasFilterNotFound(msg) {
  return typeof msg === 'string' && msg.toLowerCase().includes('filter not found');
}

// su logger interno
provider._log = (level, args) => {
  if (Array.isArray(args) && args.some(hasFilterNotFound)) return;
  console.log(`[${level}]`, ...args);
};




// Contrato e interfaz
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, provider);
const iface = new ethers.Interface(ABI);

// Utilidades
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Función para obtener metadatos de IPFS
async function fetchMetadataFromIPFS(ipfsUri) {
  const startTime = Date.now();
  try {
    // Convertir ipfs:// a HTTP gateway
    const httpUrl = ipfsUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
    
    console.log(`⏳ Fetching metadata from: ${httpUrl}`);
    
    const response = await axios.get(httpUrl, { timeout: 30000 }); // 30 segundos
    const metadata = response.data;
    
    const elapsedTime = Date.now() - startTime;
    console.log(`✅ Metadata fetched in ${elapsedTime}ms`);
    
    return {
      title: metadata.name || 'Sin título',
      description: metadata.description || '',
      image: metadata.image ? metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : ''
    };
  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    console.error(`❌ Error fetching IPFS metadata after ${elapsedTime}ms:`, error.message);
    return { title: 'Error loading metadata', description: '', image: '' };
  }
}

// ──────────────────────────────────────────────────────────────
// Listener tiempo real (con dedupe + guardado de lastBlock)
// ──────────────────────────────────────────────────────────────
export const startListener = async () => {
  console.log("👂 Escuchando eventos del contrato...");

  const handleBlockPersist = async (ev) => {
    const bn = ev?.blockNumber ?? ev?.log?.blockNumber;
    if (bn != null) {
      await SyncState.findByIdAndUpdate("latest", { lastBlock: bn }, { upsert: true });
      console.log(`💾 Guardado último bloque ${bn}`);
    }
  };

  // CampaignCreated - Evento actualizado con 7 parámetros
  contract.on("CampaignCreated", async (id, owner, title, description, goal, deadline, metadataUri, ev) => {
    try {
      console.log(`🔔 Evento CampaignCreated recibido - ID: ${id}`);
      
      // Formatear goal y deadline
      const goalEth = ethers.formatEther(goal);
      const deadlineMs = Number(deadline) * 1000;
      const daysLeft = Math.max(0, Math.floor((deadlineMs - Date.now()) / (1000 * 60 * 60 * 24)));

      // Datos del evento con todos los parámetros
      const campaignData = {
        id: Number(id),
        owner,
        title,
        description,
        goal: goalEth,
        deadline: deadlineMs,
        daysLeft: daysLeft,
        funds: "0.0",
        withdrawn: false,
        metadataUri,
      };

      // Si hay metadataUri, obtener la imagen de IPFS
      if (metadataUri && metadataUri.startsWith('ipfs://')) {
        try {
          const metadata = await fetchMetadataFromIPFS(metadataUri);
          campaignData.image = metadata.image;
        } catch (err) {
          console.error('Error parsing IPFS metadata:', err);
        }
      }

      console.log(`💾 Guardando campaña ${id} en MongoDB...`);
      await Campaign.updateOne(
        { id: Number(id) },
        campaignData,
        { upsert: true }
      );

      await handleBlockPersist(ev);
      console.log(`📢 Nueva campaña creada: ID ${id}, owner ${owner}`);
    } catch (err) {
      console.error("❌ Error en CampaignCreated:", err.message);
    }
  });

  // Contribution
  contract.on("Contribution", async (id, contributor, amount, ev) => {
    try {
      const campaign = await Campaign.findOne({ id: Number(id) });
      if (campaign) {
        // funds y amount ya están en ETH string decimal
        const prevFunds = parseFloat(campaign.funds ?? "0");
        const amountEth = parseFloat(ethers.formatEther(amount));
        const newFunds = (prevFunds + amountEth).toFixed(6); // 6 decimales
        campaign.funds = newFunds;
        await campaign.save();
        console.log(`✅ Fondos actualizados en campaña ${id}: ${campaign.funds} ETH`);
        
        // Guardar la contribución en la base de datos
        await Contribution.create({
          owner: contributor,
          campaignId: Number(id),
          amount: amountEth,
          timestamp: new Date(),
        });
      } else {
        console.warn(`⚠️ Campaña ${id} no encontrada en la base de datos`);
      }

      await handleBlockPersist(ev);
      console.log(`💰 Contribución: campaña ${id}, ${amount} wei, de ${contributor}`);
    } catch (err) {
      console.error("❌ Error en Contribution:", err.message);
    }
  });

  // FundsWithdrawn
  contract.on("FundsWithdrawn", async (id, amount, ev) => {
    try {
      const campaign = await Campaign.findOne({ id: Number(id) });
      if (campaign) {
        campaign.funds = "0.0";
        campaign.withdrawn = true;
        await campaign.save();
      }

      await handleBlockPersist(ev);
      console.log(`🏦 Retiro: campaña ${id}, ${amount} wei`);
    } catch (err) {
      console.error("❌ Error en FundsWithdrawn:", err.message);
    }
  });
};

// ──────────────────────────────────────────────────────────────
// Sincronización histórica (hasta head) con dedupe
// ──────────────────────────────────────────────────────────────
export async function syncPastEvents() {
  console.log("📦 Buscando eventos anteriores...");

  const head = await provider.getBlockNumber(); // sincroniza hasta head real
  let lastBlock = 0;

  const savedState = await SyncState.findById("latest");
  if (savedState) {
    lastBlock = savedState.lastBlock;
    console.log(`🔁 Reanudando desde el bloque ${lastBlock} (head=${head})`);
  } else {
    console.log(`🆕 No hay estado previo (head=${head})`);
  }

  if (lastBlock>= head) {
    console.log(`✅ Up-to-date (lastBlock=${lastBlock}, head=${head})`);
    return;
  }

  const STEP = Number(process.env.SYNC_STEP ?? 1000);
  const DELAY = Number(process.env.SYNC_DELAY_MS ?? 300);

  for (let from = DEPLOY + 1; from <= head; from += STEP) {
    const to = Math.min(from + STEP - 1, head);
    console.log(`🔎 Leyendo eventos entre bloques ${from} → ${to}`);

    try {
      const logs = await provider.getLogs({
        address: process.env.CONTRACT_ADDRESS,
        fromBlock: from,
        toBlock: to,
      });

      for (const log of logs) {
        let parsed;
        try {
          parsed = iface.parseLog(log); // decodifica por ABI
        } catch {
          continue; // no es uno de tus eventos
        }

        const { name, args } = parsed;

        if (name === "CampaignCreated") {
          const [id, owner, title, description, goal, deadline, metadataUri] = args;
          
          const goalEth = ethers.formatEther(goal);
          const deadlineMs = Number(deadline) * 1000;
          const daysLeft = Math.max(0, Math.floor((deadlineMs - Date.now()) / (1000 * 60 * 60 * 24)));
          
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

          // Si hay metadataUri, obtener la imagen de IPFS
          if (metadataUri && metadataUri.startsWith('ipfs://')) {
            try {
              const metadata = await fetchMetadataFromIPFS(metadataUri);
              campaignData.image = metadata.image;
            } catch (err) {
              console.error('Error parsing IPFS metadata:', err);
            }
          }

          await Campaign.updateOne(
            { id: Number(id) },
            campaignData,
            { upsert: true }
          );
          
          console.log(`📢 Nueva campaña creada: ID ${id}, owner ${owner}`);
        } else if (name === "Contribution") {
          const [id, contributor, amount] = args;
          const campaign = await Campaign.findOne({ id: Number(id) });
          if (campaign) {
            const prevFunds = parseFloat(campaign.funds ?? "0");
            const amountEth = parseFloat(ethers.formatEther(amount));
            const newFunds = (prevFunds + amountEth).toFixed(6);
            campaign.funds = newFunds;
            await campaign.save();
            console.log(`💰 Contribución: campaña ${id}, ${amountEth} ETH, de ${contributor}`);
              // Guardar la contribución en la base de datos
              await Contribution.create({
                owner: contributor,
                campaignId: Number(id),
                amount: amountEth,
                timestamp: new Date(),
              });
          }
        } else if (name === "FundsWithdrawn") {
          const [id, amount] = args;
          const campaign = await Campaign.findOne({ id: Number(id) });
          if (campaign) {
            campaign.funds = "0.0";
            campaign.withdrawn = true;
            await campaign.save();
          }
        }
      }

      // Guardar avance SIEMPRE, haya o no eventos
      await SyncState.findByIdAndUpdate("latest", { lastBlock: to }, { upsert: true });
      console.log(`✅ Sincronización completada hasta el bloque ${to}`);
      await sleep(DELAY);
    } catch (err) {
      console.error(`🚨 Error procesando bloques ${from}-${to}:`, err.message);
      await sleep(3000);
    }
  }

  console.log(`🏁 Sincronización finalizada hasta head=${head}`);
}

// Guardado de seguridad al cerrar (CTRL+C)
process.on("SIGINT", async () => {
  try {
    const now = await provider.getBlockNumber();
    await SyncState.findByIdAndUpdate("latest", { lastBlock: now }, { upsert: true });
    console.log(`💾 Guardado último bloque ${now} antes de salir`);
  } finally {
    process.exit(0);
  }
});

