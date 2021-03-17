"use strict";

const FabricCAServices = require("fabric-ca-client");
const { Wallets, Gateway } = require("fabric-network");
const fs = require("fs");
const path = require("path");

const connectToNetwork = async () => {
  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(__dirname, "wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  const ccpPath = path.resolve(__dirname, "connection-org2.json");
  const fileExists = fs.existsSync(ccpPath);
  if (!fileExists) {
    throw new Error(`no such file or directory: ${ccpPath}`);
  }
  const contents = fs.readFileSync(ccpPath, "utf8");
  const ccp = JSON.parse(contents);

  let connectionOptions = {
    wallet,
    identity: "gov1app",
    discovery: { enabled: true, asLocalhost: true },
  };
  await gateway.connect(ccp, connectionOptions);

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork("mychannel");
  return network;
};

exports.enrollAdmin = async (req, res, next) => {
  try {
    // load the network configuration
    const ccpPath = path.resolve(__dirname, "connection-org2.json");
    const fileExists = fs.existsSync(ccpPath);
    if (!fileExists) {
      throw new Error(`no such file or directory: ${ccpPath}`);
    }
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities["ca.org2.example.com"];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(
      caInfo.url,
      { trustedRoots: caTLSCACerts, verify: false },
      caInfo.caName
    );

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(__dirname, "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the admin user.
    const identity = await wallet.get("admin");
    if (identity) {
      console.log(
        'An identity for the admin user "admin" already exists in the wallet'
      );
      return res.status(401).send("duplicate");
    }

    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({
      enrollmentID: "admin",
      enrollmentSecret: "adminpw",
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: "Org2MSP",
      type: "X.509",
    };
    await wallet.put("admin", x509Identity);
    console.log(
      'Successfully enrolled admin user "admin" and imported it into the wallet'
    );
    return res
      .status(200)
      .send(
        'Successfully enrolled admin user "admin" and imported it into the wallet'
      );
  } catch (error) {
    console.error(`Failed to enroll admin user "admin": ${error}`);
    next(error);
  }
};

exports.registerEnrollUser = async (req, res, next) => {
  try {
    // load the network configuration
    const ccpPath = path.resolve(__dirname, "connection-org2.json");
    const fileExists = fs.existsSync(ccpPath);
    if (!fileExists) {
      throw new Error(`no such file or directory: ${ccpPath}`);
    }
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new CA client for interacting with the CA.
    const caURL = ccp.certificateAuthorities["ca.org2.example.com"].url;
    const ca = new FabricCAServices(caURL);

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(__dirname, "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userIdentity = await wallet.get("gov1app");
    if (userIdentity) {
      console.log(
        'An identity for the user "gov1app" already exists in the wallet'
      );
      return res.status(401).send("duplicate");
    }

    // Check to see if we've already enrolled the admin user.
    const adminIdentity = await wallet.get("admin");
    if (!adminIdentity) {
      console.log(
        'An identity for the admin user "admin" does not exist in the wallet'
      );
      console.log("Run the enrollAdmin.js application before retrying");
      return;
    }

    // build a user object for authenticating with the CA
    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, "admin");

    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register(
      {
        affiliation: "org2.department1",
        enrollmentID: "gov1app",
        role: "client",
        attrs: [
          {
            name: "role",
            value: "Goverment",
            ecert: true,
          },
        ],
      },
      adminUser
    );
    const enrollment = await ca.enroll({
      enrollmentID: "gov1app",
      enrollmentSecret: secret,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: "Org2MSP",
      type: "X.509",
    };
    await wallet.put("gov1app", x509Identity);
    console.log(
      'Successfully registered and enrolled user "gov1app" and imported it into the wallet'
    );
    return res
      .status(200)
      .send(
        'Successfully registered and enrolled user "gov1app" and imported it into the wallet'
      );
  } catch (error) {
    console.error(`Failed to register user "gov1app": ${error}`);
    next(error);
  }
};

exports.updateCar = async (req, res, next) => {
  try {
    // connect to network
    const network = await connectToNetwork();

    // Get the contract from the network.
    const contract = network.getContract("gphouse-contract");

    // Submit the specified transaction.
    const data = req.body;
    await contract.submitTransaction(
      "updateGphouseAsset",
      data.id,
      data.location,
      data.nocerti,
      data.price
    );
    console.log(`Transaction has been submitted`);

    return res.status(200).send("success");
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    next(error);
  }
};

exports.getByID = async (req, res, next) => {
  try {
    // connect to network
    const network = await connectToNetwork();

    // Get the contract from the network.
    const contract = network.getContract("gphouse-contract");

    // Submit the specified transaction.
    const result = await contract.evaluateTransaction(
      "readGphouseAsset",
      req.query.key
    );
    console.log(`Transaction has been submitted`);

    res.status(200).send(JSON.parse(result));
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    process.exit(1);
  }
};

exports.deleteByID = async (req, res, next) => {
  try {
    // connect to network
    const network = await connectToNetwork();

    // Get the contract from the network.
    const contract = network.getContract("gphouse-contract");

    // Submit the specified transaction.
    await contract.submitTransaction("deleteGphouseAsset", req.query.key);
    console.log(`Data has been deleted`);
  } catch (error) {
    console.error(`Failed to delete data: ${error}`);
    process.exit(1);
  }
};

exports.getHistoryForKey = async (req, res, next) => {
  try {
    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(__dirname, "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    const ccpPath = path.resolve(__dirname, "connection-org2.json");
    const fileExists = fs.existsSync(ccpPath);
    if (!fileExists) {
      throw new Error(`no such file or directory: ${ccpPath}`);
    }
    const contents = fs.readFileSync(ccpPath, "utf8");
    const ccp = JSON.parse(contents);

    let connectionOptions = {
      wallet,
      identity: "gov1app",
      discovery: { enabled: true, asLocalhost: true },
    };
    await gateway.connect(ccp, connectionOptions);

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork("mychannel");

    // Get the contract from the network.
    const contract = network.getContract("gphouse-contract");

    // Submit the specified transaction.
    const result = await contract.evaluateTransaction(
      "getHistoryByKey",
      req.query.key
    );
    console.log(`Transaction has been evaluated. Result: ${result}`);

    res.status(200).send(JSON.parse(result));
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    process.exit(1);
  }
};