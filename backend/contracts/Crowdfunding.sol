/**
 *Submitted for verification at Etherscan.io on 2025-11-14
*/

// SPDX-License-Identifier: MIT
//marcos crowdfunding TFG
pragma solidity ^0.8.17;

contract Crowdfunding {
    struct Campaign {
        uint id;
        address payable owner;
        string title;
        string description;
        uint goal;
        uint funds;
        uint deadline;
        bool withdrawn;
        string metadataUri;
    }

    uint public campaignCount;
    mapping(uint => Campaign) public campaigns;
        // Mapping para contribuciones por usuario y campaña
        mapping(uint => mapping(address => uint)) public contributions;

    event CampaignCreated(uint id, address owner, string title, string description, uint goal, uint deadline, string metadataUri);
    event Contribution(uint id, address contributor, uint amount);
    event FundsWithdrawn(uint id, uint amount);

    // Crear campaña
    function createCampaign(
        string memory _title,
        string memory _description,
        uint _goal,
        uint _durationInDays,
        string memory _metadataUri
    ) public {
        require(_goal > 0, "El objetivo debe ser mayor a 0");

        campaignCount++;
        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            owner: payable(msg.sender),
            title: _title,
            description: _description,
            goal: _goal,
            funds: 0,
            deadline: block.timestamp + (_durationInDays * 1 days),
            withdrawn: false,
            metadataUri: _metadataUri
        });

        emit CampaignCreated(
            campaignCount, 
            msg.sender, 
            _title,
            _description,
            _goal, 
            block.timestamp + (_durationInDays * 1 days),
            _metadataUri
        );
    }

    // Aportar fondos en ETH
    function contribute(uint _id) public payable {
        Campaign storage c = campaigns[_id];
        require(block.timestamp < c.deadline, "Campana expirada");
        require(msg.value > 0, "Debes enviar ETH");

        c.funds += msg.value;
           // Registrar la contribución del usuario
           contributions[_id][msg.sender] += msg.value;

        emit Contribution(_id, msg.sender, msg.value);
    }
    // Permitir refund si la campaña no alcanzó el objetivo tras el deadline
    function refund(uint campaignId) external {
        Campaign storage c = campaigns[campaignId];
        require(block.timestamp > c.deadline, "Campana activa");
        require(c.funds < c.goal, "Objetivo cumplido, no refund");
        uint amount = contributions[campaignId][msg.sender];
        require(amount > 0, "No hay contribuciones para reembolsar");
        contributions[campaignId][msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    // Retirar fondos (solo el creador, si se cumplió el objetivo)
    function withdrawFunds(uint _id) public {
        Campaign storage c = campaigns[_id];
        require(msg.sender == c.owner, "No eres el creador");
        require(c.funds >= c.goal, "Objetivo no alcanzado");
        require(!c.withdrawn, "Fondos ya retirados");  
        
        // Si la campaña sigue activa, permitir retiro anticipado si ya se alcanzó el goal
        // Si ya expiró, verificar que se haya alcanzado el objetivo
        if (block.timestamp >= c.deadline) {
            require(c.funds >= c.goal, "Campana fallida, no se alcanzo el objetivo");
        }

        c.withdrawn = true;
        uint amount = c.funds;
        c.owner.transfer(amount);

        emit FundsWithdrawn(_id, amount);
    }

    // Consultar si la campaña está activa
    function isActive(uint _id) public view returns (bool) {
        return block.timestamp < campaigns[_id].deadline;
    }

}