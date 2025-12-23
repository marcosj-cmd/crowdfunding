const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export interface CampaignMetadata {
  name: string;
  description: string;
  image: string;
}

/**
 * Convierte una URI de IPFS al formato HTTP usando gateway de Pinata
 */
export function convertIpfsToHttp(ipfsUri: string): string {
  if (ipfsUri.startsWith('ipfs://')) {
    return ipfsUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  }
  return ipfsUri;
}

/**
 * Sube una imagen a IPFS usando Pinata
 * @returns URI de IPFS (ipfs://...)
 */
export async function uploadImageToIPFS(file: File): Promise<string> {
  console.log("Uploading image to IPFS via Pinata...", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  });

  const formData = new FormData();
  formData.append('file', file);
  
  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append('pinataOptions', options);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PINATA_JWT}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload image to IPFS: ${errorText}`);
  }

  const data = await response.json();
  const ipfsUri = `ipfs://${data.IpfsHash}`;
  
  console.log("Image uploaded to IPFS:", ipfsUri);
  return ipfsUri;
}

/**
 * Sube metadata JSON a IPFS usando Pinata
 * @returns URI de IPFS (ipfs://...)
 */
export async function uploadMetadataToIPFS(metadata: CampaignMetadata): Promise<string> {
  console.log("Uploading metadata to IPFS...", metadata);

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PINATA_JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload metadata to IPFS: ${errorText}`);
  }

  const data = await response.json();
  const metadataUri = `ipfs://${data.IpfsHash}`;
  
  console.log("Metadata uploaded to IPFS:", metadataUri);
  return metadataUri;
}

/**
 * Sube imagen y metadata (título, descripción, imagen) a IPFS
 * Goal, duration y creator ya están en el smart contract
 * @returns URI de metadata (ipfs://...)
 */
export async function uploadCampaignToIPFS(
  imageFile: File,
  title: string,
  description: string
): Promise<string> {
  // 1. Subir imagen
  const imageIpfsUri = await uploadImageToIPFS(imageFile);

  // 2. Crear metadata JSON con solo lo esencial
  const metadata: CampaignMetadata = {
    name: title,
    description: description,
    image: imageIpfsUri
  };

  // 3. Subir metadata
  const metadataUri = await uploadMetadataToIPFS(metadata);

  return metadataUri;
}
