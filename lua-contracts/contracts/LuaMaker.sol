pragma solidity 0.6.12;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./uniswapv2/interfaces/IUniswapV2ERC20.sol";
import "./uniswapv2/interfaces/IUniswapV2Pair.sol";
import "./uniswapv2/interfaces/IUniswapV2Factory.sol";
import "./uniswapv2/interfaces/IUniswapV2Router02.sol";
// LuaMaker is LuaMasterFarmer's left hand and kinda a wizard. He can cook up Lua from pretty much anything!
//
// This contract handles "serving up" rewards for xLua holders by trading tokens collected from fees for Lua.
contract LuaMaker  is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    IUniswapV2Router02 public routerv2;
    IUniswapV2Factory public factory;
    address public safe;
    address public lua;
    address public weth;
    constructor(IUniswapV2Factory _factory, IUniswapV2Router02 _routerv2, address _safe, address _lua, address _weth) public {
        factory = _factory;
        routerv2 = _routerv2;
        lua = _lua;
        safe = _safe;
        weth = _weth;
    }

    function emergencyWithdraw(address token, uint256 amount, address payable to) public onlyOwner {
      if (token != address(0)) {
        IERC20(token).transfer(to, amount);
      }
      else {
        to.transfer(amount);
      }
    }

    function removeLiqidity(address token0, address token1) public {
        require(msg.sender == tx.origin, "do not convert from contract");
        IUniswapV2Pair pair = IUniswapV2Pair(factory.getPair(token0, token1));
        pair.transfer(address(pair), pair.balanceOf(address(this)));
        pair.burn(address(this));

        IERC20(token0).approve(address(routerv2), uint256(-1));
        IERC20(token1).approve(address(routerv2), uint256(-1));
    }

    function marketBuyLuaWithETH(address[] calldata path, uint deadline) public {
      routerv2.swapExactETHForTokens{value: address(this).balance}(
        0,
        path,
        address(this),
        deadline
      );
    }

    function marketBuyLuaWithToken(address[] calldata path, uint deadline) public {
      routerv2.swapExactTokensForTokens(
        IERC20(path[0]).balanceOf(address(this)),
        0,
        path,
        address(this),
        deadline
      );
    }
}