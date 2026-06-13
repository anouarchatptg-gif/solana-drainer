const web3 = require('@solana/web3.js');
const bs58 = require('bs58');
const dotenv = require('dotenv');

dotenv.config();

const connection = new web3.Connection(
  web3.clusterApiUrl('mainnet-beta'),  // Verander devnet naar mainnet-beta
  'confirmed'
);

const privateKey = process.env.PRIVATE_KEY;
const recipientAddress = process.env.RECIPIENT_ADDRESS;

if (!privateKey || !recipientAddress) {
  console.error('Missing PRIVATE_KEY or RECIPIENT_ADDRESS in the .env file');
  process.exit(1);
}

const recipientPubkey = new web3.PublicKey(recipientAddress);

const getBalance = async (publicKey) => {
  const balance = await connection.getBalance(publicKey);
  return balance;
};

const transfer = async (fromKeypair, toPublicKey, lamports) => {
  const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: lamports,
    })
  );

  const signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [fromKeypair]
  );
  return signature;
};

const clearConsole = () => {
  console.clear();
};

const printInfo = (message) => {
  clearConsole();
  console.log(message);
};

const transferAllFund = async () => {
  try {
    const secretKey = bs58.decode(privateKey);
    const fromKeypair = web3.Keypair.fromSecretKey(secretKey);

    const balance = await getBalance(fromKeypair.publicKey);
    console.log(`Balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

    if (balance > 5000) {  // kleine fee overhouden
      const amountToSend = balance - 5000;
      const signature = await transfer(fromKeypair, recipientPubkey, amountToSend);
      console.log(`Drained! Signature: ${signature}`);
      console.log(`Sent to: ${recipientAddress}`);
    } else {
      console.log("Niet genoeg SOL om te drainen");
    }
  } catch (error) {
    console.error("Error during drain:", error);
  }
};

transferAllFund();
