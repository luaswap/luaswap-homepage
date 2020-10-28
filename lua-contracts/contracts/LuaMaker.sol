pragma solidity 0.6.12;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./uniswapv2/interfaces/IUniswapV2ERC20.sol";
import "./uniswapv2/interfaces/IUniswapV2Pair.sol";
import "./uniswapv2/interfaces/IUniswapV2Factory.sol";
import "./uniswapv2/interfaces/IUniswapV2Router02.sol";

// This contract handles "serving up" rewards for xLua holders by trading tokens collected from fees for Lua.
contract LuaMaker  is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    IUniswapV2Router02 public routerv2;
    IUniswapV2Factory public factory;
    address public luaSafe;
    address public lua;
    mapping(address => bool) public acceptTokens;
    constructor(
      IUniswapV2Factory _factory, 
      IUniswapV2Router02 _routerv2, 
      address[] memory _tokens, 
      address _luaSafe, 
      address _lua
    ) public {
        factory = _factory;
        routerv2 = _routerv2;
        lua = _lua;
        luaSafe = _luaSafe;
        for (uint i = 0; i < _tokens.length; i++) {
          acceptTokens[_tokens[i]] = true;
        }
    }

    function setAccpetToken(address _token, bool _accept) public onlyOwner {
      acceptTokens[_token] = _accept;
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
      require(path[path.length - 1] == lua, 'LuaMaker: wrong path');
      for (uint i = 1; i < path.length - 1; i++) {
        require(acceptTokens[path[i]], 'LuaMaker: wrong path');
      }
      
      routerv2.swapExactETHForTokens{value: address(this).balance}(
        0,
        path,
        luaSafe,
        deadline
      );
    }
    
    function marketBuyLuaWithToken(address[] calldata path, uint deadline) public {
      address token = path[0];
      if (token == lua) {
          uint amount = IERC20(token).balanceOf(address(this));
          _safeTransfer(token, luaSafe, amount);
      } else  {
        require(path[path.length - 1] == lua, 'LuaMaker: wrong path');
        for (uint i = 1; i < path.length - 1; i++) {
          require(acceptTokens[path[i]], 'LuaMaker: wrong path');
        }
        routerv2.swapExactTokensForTokens(
          IERC20(token).balanceOf(address(this)),
          0,
          path,
          luaSafe,
          deadline
        );
      }
    }
    
    function _safeTransfer(address token, address to, uint256 amount) internal {
        IERC20(token).safeTransfer(to, amount);
    }
}
