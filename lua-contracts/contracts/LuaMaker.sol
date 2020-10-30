pragma solidity 0.6.12;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./uniswapv2/interfaces/IUniswapV2Pair.sol";
import "./uniswapv2/interfaces/IUniswapV2Factory.sol";
import "./uniswapv2/interfaces/IUniswapV2Router02.sol";

// This contract handles "serving up" rewards for xLua holders by trading tokens collected from fees for Lua.
contract LuaMaker  is Ownable {
    using SafeMath for uint;
    using SafeERC20 for IERC20;
    IUniswapV2Router02 public routerv2;
    IUniswapV2Factory public factory;
    address public luaSafe;
    address public lua;
    address public weth;
    mapping(address => bool) public operators;
    mapping(address => bool) public acceptTokens;
    constructor(
      IUniswapV2Factory _factory, 
      IUniswapV2Router02 _routerv2, 
      address[] memory _tokens, 
      address _luaSafe, 
      address _lua,
      address _weth
    ) public {
        factory = _factory;
        routerv2 = _routerv2;
        lua = _lua;
        luaSafe = _luaSafe;
        weth = _weth;
        operators[msg.sender] = true;
        for (uint i = 0; i < _tokens.length; i++) {
          acceptTokens[_tokens[i]] = true;
        }
    }

    function setAcceptToken(address _token, bool _accept) public onlyOwner {
      acceptTokens[_token] = _accept;
    }

    function setOperator(address _operator, bool on) public onlyOwner {
      operators[_operator] = on;
    }

    function removeLiqidity(address token0, address token1, uint amount) public {
        require(operators[msg.sender], 'LuaMaker: no permistion');
        IUniswapV2Pair pair = IUniswapV2Pair(factory.getPair(token0, token1));
        pair.transfer(address(pair), amount);
        pair.burn(address(this));
        _safeApproveForRouterV2(token0);
        _safeApproveForRouterV2(token1);
    }

    function marketBuyLuaWithETH(address[] calldata path, uint amount, uint deadline) public {
      require(operators[msg.sender], 'LuaMaker: no permistion');
      require(path[path.length - 1] == lua, 'LuaMaker: wrong path');
      for (uint i = 1; i < path.length - 1; i++) {
        require(acceptTokens[path[i]], 'LuaMaker: wrong path');
      }
      
      routerv2.swapExactETHForTokens{value: amount}(
        0,
        path,
        luaSafe,
        deadline
      );
    }
    
    function marketBuyLuaWithToken(address[] calldata path, uint amount, uint deadline) public {
      require(operators[msg.sender], 'LuaMaker: no permistion');
      address token = path[0];
      if (token == lua) {
          IERC20(token).safeTransfer(luaSafe, amount);
      } else  {
        require(path[path.length - 1] == lua, 'LuaMaker: wrong path');
        for (uint i = 1; i < path.length - 1; i++) {
          require(acceptTokens[path[i]], 'LuaMaker: wrong path');
        }
        routerv2.swapExactTokensForTokens(
          amount,
          0,
          path,
          luaSafe,
          deadline
        );
      }
    }

    function convert(address token0, address token1) public {
        // At least we try to make front-running harder to do.
        require(msg.sender == tx.origin, "do not convert from contract");
        
        IUniswapV2Pair pair = IUniswapV2Pair(factory.getPair(token0, token1));
        pair.transfer(address(pair), pair.balanceOf(address(this)));
        pair.burn(address(this));
        _safeApproveForRouterV2(token0);
        _safeApproveForRouterV2(token1);

        _toBaseToken(token0);
        _toBaseToken(token1);

        if (IERC20(weth).balanceOf(address(this)) > 0) {
          _safeApproveForRouterV2(weth);
          _swap(weth, lua);
        }

        if (IERC20(lua).balanceOf(address(this)) > 0) {
          IERC20(lua).safeTransfer(luaSafe, IERC20(lua).balanceOf(address(this)));
        }
    }

    function _swap(address token0, address token1) internal {
      if (factory.getPair(token0, token1) != address(0)) {
        address[] memory path = new address[](2);
        path[0] = token0;
        path[1] = token1;
        routerv2.swapExactTokensForTokens(
          IERC20(token0).balanceOf(address(this)), 
          0, 
          path, 
          address(this), 
          block.timestamp + 1000);
      }
    }

    function _canSwap(address token0, address token1) internal view returns (bool) {
      return factory.getPair(token0, token1) != address(0);
    }

    function _toBaseToken(address token) internal {
      if (token == lua) return;

      if (_canSwap(token, lua)) {
        _swap(token, lua);
      }
      else if (_canSwap(token, weth)) {
        _swap(token, weth);
      }
    }

    function _safeApproveForRouterV2(address token) internal {
      IERC20(token).safeApprove(address(routerv2), 0);
      IERC20(token).safeApprove(address(routerv2), uint256(-1));
    }
}
