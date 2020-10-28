pragma solidity 0.6.12;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
// LuaSafe is the coolest warehouse in town. You come in with some Lua, and leave with more! The longer you stay, the more Lua you get.
//
// This contract handles swapping to and from xLua, LuaSwap's staking token.
contract LuaSafe is ERC20("LuaSafe", "xLUA") {
    using SafeMath for uint256;
    IERC20 public lua;
    uint256 public FEE = 5;
    // Define the Lua token contract
    constructor(IERC20 _lua) public {
        lua = _lua;
    }
    
    // Enter the warehouse. store some LUAs. Earn some shares.
    // Locks Lua and mints xLua
    function enter(uint256 _amount) public {
        // Gets the amount of Lua locked in the contract
        uint256 totalLua = lua.balanceOf(address(this));
        // Gets the amount of xLua in existence
        uint256 totalShares = totalSupply();
        // If no xLua exists, mint it 1:1 to the amount put in
        if (totalShares == 0 || totalLua == 0) {
            _mint(msg.sender, _amount);
        } 
        // Calculate and mint the amount of xLua the Lua is worth. The ratio will change overtime, as xLua is burned/minted and Lua deposited + gained from fees / withdrawn.
        else {
            uint256 what = _amount.mul(totalShares).div(totalLua);
            _mint(msg.sender, what);
        }
        // Lock the Lua in the contract
        lua.transferFrom(msg.sender, address(this), _amount);
    }
    // Leave the warehouse. Claim back your LUAs.
    // Unclocks the staked + gained Lua and burns xLua
    function leave(uint256 _share) public {
        uint256 totalShares = totalSupply();
        uint luaBal = lua.balanceOf(address(this));
        uint256 what = _share.mul(luaBal).div(totalShares);
        uint fee = _getWithdrawFee(what);
        _burn(msg.sender, _share);
        lua.transfer(msg.sender, what.sub(fee));
    }
    function _getWithdrawFee(uint liquidity) private view returns (uint withdrawFee) {
        withdrawFee = liquidity.mul(FEE).div(1000);
    }
}