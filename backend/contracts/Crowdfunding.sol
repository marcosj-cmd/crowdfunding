/**
 *Submitted for verification at Etherscan.io on 2025-10-04
*/

// SPDX-License-Identifier: MIT
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
    }

    uint public campaignCount;
    mapping(uint => Campaign) public campaigns;
        // Mapping para contribuciones por usuario y campaña
        mapping(uint => mapping(address => uint)) public contributions;

    event CampaignCreated(uint id, address owner, uint goal, uint deadline);
    event Contribution(uint id, address contributor, uint amount);
    event FundsWithdrawn(uint id, uint amount);

    // Crear campaña
    function createCampaign(
        string memory _title,
        string memory _description,
        uint _goal,
        uint _durationInDays
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
            withdrawn: false
        });

        emit CampaignCreated(campaignCount, msg.sender, _goal, block.timestamp + (_durationInDays * 1 days));
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
        require(block.timestamp > c.deadline, "Campaign still active");
        require(c.funds < c.goal, "Goal reached, cannot refund");
        uint amount = contributions[campaignId][msg.sender];
        require(amount > 0, "No contribution to refund");
        contributions[campaignId][msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    // Retirar fondos (solo el creador, si se cumplió el objetivo)
    function withdrawFunds(uint _id) public {
        Campaign storage c = campaigns[_id];
        require(msg.sender == c.owner, "No eres el creador");
        require(c.funds >= c.goal, "Objetivo no alcanzado");
        require(!c.withdrawn, "Fondos ya retirados");

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