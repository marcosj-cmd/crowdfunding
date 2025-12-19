// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Crowdfunding
 * @dev Contrato de crowdfunding descentralizado en Ethereum
 * @author PEC3 - Blockchain Development
 * @notice Permite crear campañas, contribuir y retirar fondos
 *
 * Dirección en Sepolia: 0x3cebA30E37c91E6CD74d84d5Ce0d18c8248aaF59
 * Verificado en Etherscan: https://sepolia.etherscan.io/address/0x3cebA30E37c91E6CD74d84d5Ce0d18c8248aaF59#code
 */
contract Crowdfunding {
    // ============ Estructuras ============

    struct Campaign {
        uint256 id;
        address payable owner;
        string title;
        string description;
        uint256 goal;        // Objetivo en wei
        uint256 funds;       // Fondos recaudados en wei
        uint256 deadline;    // Timestamp de finalización
        bool withdrawn;      // Si los fondos han sido retirados
    }

    // ============ Variables de Estado ============

    /// @notice Contador de campañas (auto-incremental)
    uint256 public campaignCount;

    /// @notice Mapping de ID a Campaign
    mapping(uint256 => Campaign) public campaigns;

    // ============ Eventos ============

    /// @notice Emitido cuando se crea una nueva campaña
    event CampaignCreated(
        uint256 id,
        address owner,
        uint256 goal,
        uint256 deadline
    );

    /// @notice Emitido cuando alguien contribuye a una campaña
    event Contribution(
        uint256 id,
        address contributor,
        uint256 amount
    );

    /// @notice Emitido cuando el owner retira los fondos
    event FundsWithdrawn(
        uint256 id,
        uint256 amount
    );

    // ============ Modificadores ============

    modifier campaignExists(uint256 _id) {
        require(_id > 0 && _id <= campaignCount, "Campaign does not exist");
        _;
    }

    modifier onlyCampaignOwner(uint256 _id) {
        require(msg.sender == campaigns[_id].owner, "Only campaign owner can call this");
        _;
    }

    // ============ Funciones Principales ============

    /**
     * @notice Crea una nueva campaña de crowdfunding
     * @param _title Título de la campaña
     * @param _description Descripción de la campaña
     * @param _goal Objetivo de recaudación en wei
     * @param _durationInDays Duración de la campaña en días
     */
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _durationInDays
    ) external {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_goal > 0, "Goal must be greater than 0");
        require(_durationInDays > 0, "Duration must be at least 1 day");

        campaignCount++;
        uint256 deadline = block.timestamp + (_durationInDays * 1 days);

        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            owner: payable(msg.sender),
            title: _title,
            description: _description,
            goal: _goal,
            funds: 0,
            deadline: deadline,
            withdrawn: false
        });

        emit CampaignCreated(campaignCount, msg.sender, _goal, deadline);
    }

    /**
     * @notice Contribuye a una campaña existente
     * @param _id ID de la campaña
     */
    function contribute(uint256 _id) external payable campaignExists(_id) {
        Campaign storage campaign = campaigns[_id];

        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Contribution must be greater than 0");
        require(!campaign.withdrawn, "Funds already withdrawn");

        campaign.funds += msg.value;

        emit Contribution(_id, msg.sender, msg.value);
    }

    /**
     * @notice Retira los fondos de una campaña completada
     * @param _id ID de la campaña
     */
    function withdrawFunds(uint256 _id) external campaignExists(_id) onlyCampaignOwner(_id) {
        Campaign storage campaign = campaigns[_id];

        require(block.timestamp >= campaign.deadline, "Campaign is still active");
        require(campaign.funds >= campaign.goal, "Goal not reached");
        require(!campaign.withdrawn, "Funds already withdrawn");

        campaign.withdrawn = true;
        uint256 amount = campaign.funds;

        (bool success, ) = campaign.owner.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(_id, amount);
    }

    /**
     * @notice Verifica si una campaña está activa
     * @param _id ID de la campaña
     * @return bool true si la campaña está activa
     */
    function isActive(uint256 _id) external view campaignExists(_id) returns (bool) {
        return block.timestamp < campaigns[_id].deadline && !campaigns[_id].withdrawn;
    }

    /**
     * @notice Obtiene los detalles de una campaña
     * @param _id ID de la campaña
     * @return Campaign struct con todos los detalles
     */
    function getCampaign(uint256 _id) external view campaignExists(_id) returns (Campaign memory) {
        return campaigns[_id];
    }

    /**
     * @notice Obtiene el balance del contrato
     * @return uint256 balance en wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
