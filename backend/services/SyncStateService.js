import SyncState from "../models/SyncState.js";

/**
 * Servicio para gestionar el estado de sincronización de blockchain
 */
class SyncStateService {
  constructor() {
    this.stateId = "latest";
  }

  /**
   * Obtiene el último bloque sincronizado
   * @returns {Promise<number>} Número del último bloque o 0 si no existe
   */
  async getLastBlock() {
    const state = await SyncState.findById(this.stateId);
    return state?.lastBlock ?? 0;
  }

  /**
   * Guarda el último bloque sincronizado
   * @param {number} blockNumber - Número de bloque a guardar
   */
  async saveLastBlock(blockNumber) {
    if (blockNumber != null) {
      await SyncState.findByIdAndUpdate(
        this.stateId,
        { lastBlock: blockNumber },
        { upsert: true }
      );
      console.log(`💾 Guardado último bloque ${blockNumber}`);
    }
  }

  /**
   * Verifica si la sincronización está actualizada
   * @param {number} currentBlock - Bloque actual de la blockchain
   * @returns {Promise<boolean>}
   */
  async isUpToDate(currentBlock) {
    const lastBlock = await this.getLastBlock();
    return lastBlock >= currentBlock;
  }

  /**
   * Obtiene información del estado de sincronización
   * @param {number} currentBlock - Bloque actual de la blockchain
   * @returns {Promise<Object>}
   */
  async getStatus(currentBlock) {
    const lastBlock = await this.getLastBlock();
    const blocksRemaining = Math.max(0, currentBlock - lastBlock);
    
    return {
      lastBlock,
      currentBlock,
      blocksRemaining,
      isUpToDate: blocksRemaining === 0,
      progress: currentBlock > 0 ? ((lastBlock / currentBlock) * 100).toFixed(2) + '%' : '0%'
    };
  }
}

export default new SyncStateService();
