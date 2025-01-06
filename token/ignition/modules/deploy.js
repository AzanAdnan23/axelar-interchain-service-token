const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeployModule", (m) => {
  // Deploy Token contract
  const Token = m.contract("Token", [
    "0xa52482a9eEB7519e309A79D581c40030fb596CeF",
    "0xa52482a9eEB7519e309A79D581c40030fb596CeF",
  ]);

  return {
    Token,
  };
});

// 0xa52482a9eEB7519e309A79D581c40030fb596CeF

// Avalanche: 0xE258Dfc38BB25C8F40b91bfBcf0B47Dd7eED4b19
// Sepolia: 0x4b8e4BAB8671F699036414B09434c3AaeF9CbCee
