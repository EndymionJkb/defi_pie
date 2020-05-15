pragma solidity ^0.6.6;

// Import section
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@nomiclabs/buidler/console.sol";

// Interface declarations
interface ISyntheticBuilder {
  function build() external returns (bool);
}

interface ITransformationEngine {
  function transform() external returns (bool);
}

interface IPoolManager {
  function update() external returns (bool);
}

// Libraries
// Contracts

/// @author Jeff Bennett
/// @title My Defi Pie project
contract DefiPie is Ownable, Pausable {
    /// @dev Ownable adds modifier: onlyOwner
    /// @dev Pausable adds modifiers: whenPaused, whenNotPaused
    /// @dev          and functions: _pause, _unpause
    using SafeMath for uint256;

    // type declarations
    // state variables
    ISyntheticBuilder syntheticBuilder;
    ITransformationEngine transformationEngine;
    IPoolManager poolManager;

    // Event declarations
    event SyntheticBuilderReplaced(ISyntheticBuilder _newSyntheticBuilder);
    event TransformationEngineReplaced(ITransformationEngine _newTransformationEngine);
    event PoolManagerReplaced(IPoolManager _newPoolManager);

    // Function declarations

    /// @notice Contract initialization.
    /// @param _syntheticBuilder - contract implementing UMA synthetic creation logic
    /// @param _transformationEngine - contract implementing token transformation logic
    /// @param _poolManager - contract implementing Balancer pool management logic
    constructor(
        ISyntheticBuilder _syntheticBuilder,
        ITransformationEngine _transformationEngine,
        IPoolManager _poolManager
    )
        public
    {
        // Synthetic builder is optional (you can have pools without synthetics)
        // Of course, if you the transformation engine will balk if it needs one
        //   and it's not supplied
        require(address(_transformationEngine) != address(0),
                "You must supply a Transformation Engine");
        require(address(_poolManager) != address(0), "You must supply a Pool Manager");

        syntheticBuilder = _syntheticBuilder;
        transformationEngine = _transformationEngine;
        poolManager = _poolManager;
    }

    receive() external payable {

    }


    fallback() external {

    }
    
    // external functions

    // public functions

    /// @notice Replace the current Synthetic Builder implementation
    /// @dev emits an event
    /// @param _newSyntheticBuilder - contract implementing UMA synthetic creation logic
    function replaceSyntheticBuilder(ISyntheticBuilder _newSyntheticBuilder
    )
        public
        onlyOwner
    {
        require(address(_newSyntheticBuilder) != address(0),
                "You must supply a Synthetic Builder");

        syntheticBuilder = _newSyntheticBuilder;

        emit SyntheticBuilderReplaced(_newSyntheticBuilder);
    }

    /// @notice Replace the current Transformation Engine implementation
    /// @dev emits an event
    /// @param _newTransformationEngine - contract implementing token transformation logic
    function replaceTransformationEngine(ITransformationEngine _newTransformationEngine
    )
        public
        onlyOwner
    {
        require(address(_newTransformationEngine) != address(0),
                "You must supply a Transformation Engine");

        transformationEngine = _newTransformationEngine;

        emit TransformationEngineReplaced(_newTransformationEngine);
    }

    /// @notice Replace the current Pool Manager implementation
    /// @dev emits an event
    /// @param _newPoolManager - contract implementing pool management logic
    function replacePoolManager(IPoolManager _newPoolManager
    )
        public
        onlyOwner
    {
        require(address(_newPoolManager) != address(0),
                "You must supply a Pool Manager");

        poolManager = _newPoolManager;

        emit PoolManagerReplaced(_newPoolManager);
    }

    // internal
    // private
}
