pragma solidity =0.6.12;

import './interfaces/IUniswapV2Factory.sol';
import './UniswapV2Pair.sol';

contract UniswapV2Factory is IUniswapV2Factory {
    address public override feeTo;
    address public override withdrawFeeTo;
    
    uint public override swapFee = 3; // 0.3% = 3/1000
    uint public override withdrawFee = 1; // 0.1% = 1/1000

    address public override feeSetter;
    address public override migrator;

    mapping(address => mapping(address => address)) public override getPair;
    address[] public override allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    constructor(address _feeSetter) public {
        feeSetter = _feeSetter;
    }

    function allPairsLength() external override view returns (uint) {
        return allPairs.length;
    }

    function pairCodeHash() external pure returns (bytes32) {
        return keccak256(type(UniswapV2Pair).creationCode);
    }

    function createPair(address tokenA, address tokenB) external override returns (address pair) {
        require(tokenA != tokenB, 'UniswapV2: IDENTICAL_ADDRESSES');
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'UniswapV2: ZERO_ADDRESS');
        require(getPair[token0][token1] == address(0), 'UniswapV2: PAIR_EXISTS'); // single check is sufficient
        bytes memory bytecode = type(UniswapV2Pair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        UniswapV2Pair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // populate mapping in the reverse direction
        allPairs.push(pair);
        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) external override {
        require(msg.sender == feeSetter, 'UniswapV2: FORBIDDEN');
        feeTo = _feeTo;
    }

    function setWithdrawFeeTo(address _withdrawFeeTo) external override {
        require(msg.sender == feeSetter, 'UniswapV2: FORBIDDEN');
        withdrawFeeTo = _withdrawFeeTo;
    }

    function setMigrator(address _migrator) external override {
        require(msg.sender == feeSetter, 'UniswapV2: FORBIDDEN');
        migrator = _migrator;
    }

    function setFeeSetter(address _feeSetter) external override {
        require(msg.sender == feeSetter, 'UniswapV2: FORBIDDEN');
        feeSetter = _feeSetter;
    }

    function setSwapFee(uint _swapFee) external override {
        require(msg.sender == feeSetter, 'UniswapV2: FORBIDDEN');
        require(1 <= _swapFee, "UniswapV2: invalid swap fee"); // 0.1% = 1/1000
        require(6 >= _swapFee, "UniswapV2: invalid swap fee"); // 0.6% = 6/1000
        swapFee = _swapFee;
    }
}
