const hre = require("hardhat");

async function main() {
  console.log("Desplegando contrato Crowdfunding...");

  const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy();

  await crowdfunding.waitForDeployment();
  const address = await crowdfunding.getAddress();

  console.log(`Crowdfunding desplegado en: ${address}`);
  console.log(`Red: ${hre.network.name}`);
  console.log(`Block: ${await hre.ethers.provider.getBlockNumber()}`);

  // Guardar la dirección para verificación
  console.log("\n--- Para verificar en Etherscan ---");
  console.log(`npx hardhat verify --network ${hre.network.name} ${address}`);

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
