pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

// Import section
import "./DefiPie.sol";
import "../uma/ExpiringMultiPartyCreator.sol";
import "../uma/oracle/IdentifierWhitelist.sol";
import "../uma/oracle/Registry.sol";

/// @author Jeff Bennett
/// @title UMA synthetic creation implementation
contract SyntheticBuilder is ISyntheticBuilder {
    using SafeMath for uint256;
    using FixedPoint for FixedPoint.Unsigned;

    // User to ExpiringMultiParty contract
    mapping(address => ExpiringMultiParty) public userContracts;

    FixedPoint.Unsigned public fixedDisputeBondPct;
    FixedPoint.Unsigned public fixedSponsorDisputeRewardPct;
    FixedPoint.Unsigned public fixedDisputerDisputeRewardPct;
    FixedPoint.Unsigned public fixedMinSponsorTokens;
    FixedPoint.Unsigned public minCollateralization;

    /// @notice initialize constants
    constructor() public {
        fixedDisputeBondPct.rawValue = 10**17;
        fixedSponsorDisputeRewardPct.rawValue = 10**17;
        fixedDisputerDisputeRewardPct.rawValue = 10**17;
        fixedMinSponsorTokens.rawValue = 10**14;
        minCollateralization.rawValue = 175 * 10**16;
    }

    /// @notice Build a new synthetic token contract
    /// @param _client - Account that will be funding the synthetic
    /// @param _expiringMultiPartyCreator - The ExpiringMultiPartyCreator contract instance
    /// @param _collateral - Token being used for collateral (may be interest-bearing)
    /// @param _priceFeedIdentifier - contract implementing token transformation logic
    /// @param _syntheticName - contract implementing Balancer pool management logic
    /// @param _syntheticSymbol - contract implementing Balancer pool management logic
    /// @param _expirationTimestamp - expiration date (one of a fixed list)
    /// @dev Creates the synthetic, transfers collateral from the creator
    function build(
        address _client,
        address _expiringMultiPartyCreator,
        address _collateral,
        bytes32 _priceFeedIdentifier,
        string calldata _syntheticName,
        string calldata _syntheticSymbol,
        uint256 _expirationTimestamp
    )
        external
        override
        returns (address)
    {
        require(_client != address(0), "Must provide a client address");

        ExpiringMultiPartyCreator empCreator = ExpiringMultiPartyCreator(_expiringMultiPartyCreator);
        ExpiringMultiPartyCreator.Params memory constructorParams;

        constructorParams.expirationTimestamp = _expirationTimestamp;
        constructorParams.collateralAddress = _collateral;
        constructorParams.priceFeedIdentifier = _priceFeedIdentifier;
        constructorParams.syntheticName = _syntheticName;
        constructorParams.syntheticSymbol = _syntheticSymbol;
        constructorParams.collateralRequirement = minCollateralization;
        constructorParams.disputeBondPct = fixedDisputeBondPct;
        constructorParams.sponsorDisputeRewardPct = fixedSponsorDisputeRewardPct;
        constructorParams.disputerDisputeRewardPct = fixedDisputerDisputeRewardPct;
        constructorParams.minSponsorTokens = fixedMinSponsorTokens;
        constructorParams.timerAddress = address(0);

        address emp = empCreator.createExpiringMultiParty(constructorParams);
        userContracts[_client] = ExpiringMultiParty(emp);
    }

    /// @notice Open a position in the contract
    /// @param collateralAmount - raw number of collateral tokens
    function createPosition(uint256 collateralAmount) external {
        require(collateralAmount != 0, "Must provide a valid collateral amount");

        ExpiringMultiParty emp = userContracts[msg.sender];
        require(emp != ExpiringMultiParty(0), "No contract found");

        FixedPoint.Unsigned memory rawAmount = FixedPoint.fromUnscaledUint(collateralAmount);
        emp.create(rawAmount, rawAmount.mul(minCollateralization));
    }

    /// @notice Add collateral, to keep it above the minimum collateralization
    /// @param numTokens - raw number of collateral tokens
    function depositCollateral(uint256 numTokens) external {
        require(numTokens != 0, "Must provide a valid collateral amount");

        ExpiringMultiParty emp = userContracts[msg.sender];
        require(emp != ExpiringMultiParty(0), "No contract found");

        FixedPoint.Unsigned memory collateralTokens = FixedPoint.fromUnscaledUint(numTokens);
        emp.deposit(collateralTokens);
    }

    /// @notice Remove collateral from the position (request - can be disputed for 2 hours)
    /// @param numTokens - raw number of collateral tokens
    function requestCollateralWithdrawal(uint256 numTokens) external {
        require(numTokens != 0, "Must provide a valid collateral amount");

        ExpiringMultiParty emp = userContracts[msg.sender];
        require(emp != ExpiringMultiParty(0), "No contract found");

        FixedPoint.Unsigned memory collateralTokens = FixedPoint.fromUnscaledUint(numTokens);
        emp.requestWithdrawal(collateralTokens);
    }

    /// @notice Remove collateral, after the approval period has passed
    /// @return amountWithdrawn - The amount of collateral tokens withdrawn
    function withdrawCollateral() external returns (FixedPoint.Unsigned memory amountWithdrawn) {
        ExpiringMultiParty emp = userContracts[msg.sender];
        require(emp != ExpiringMultiParty(0), "No contract found");
        
        return emp.withdrawPassedRequest();
    }

    /// @notice Cancel a pending withdrawal
    function cancelWithdrawal() external {
        ExpiringMultiParty emp = userContracts[msg.sender];
        require(emp != ExpiringMultiParty(0), "No contract found");
        
        emp.cancelWithdrawal();
    }

    /// @notice Redeem synthetic tokens (increases collateral)
    /// @param numTokens - raw number of synthetic tokens
    /// @return amountWithdrawn - The amount of collateral recovered
    function redeemTokens(uint256 numTokens) external returns (FixedPoint.Unsigned memory amountWithdrawn) {
        require(numTokens != 0, "Must provide a valid synthetic token amount");

        ExpiringMultiParty emp = userContracts[msg.sender];
        require(emp != ExpiringMultiParty(0), "No contract found");

        FixedPoint.Unsigned memory syntheticTokens = FixedPoint.fromUnscaledUint(numTokens);

        return emp.redeem(syntheticTokens);
    }
}
