import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  Account,
  getMint,
  getAccount,
} from "@solana/spl-token";

window.Buffer = window.Buffer || require("buffer").Buffer;

function MintToken() {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const fromWallet = Keypair.generate();
  let mint: PublicKey;
  let tokenAccount: Account;
  let toWalletAddress = Keypair.generate().publicKey;
  //   let toWalletAddress = new PublicKey(
  //     "8JWB8CJ9G4Lh8PwbjnjPEGYFiQP6au3sXW7a8wi2SUU6"
  //   );

  async function createToken() {
    const airdropSignature = await connection.requestAirdrop(
      fromWallet.publicKey,
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
    let newBalance = await connection.getBalance(fromWallet.publicKey);
    console.log(`Account Funded,new Balance is : ${newBalance} SOL`);

    mint = await createMint(
      connection,
      fromWallet,
      fromWallet.publicKey,
      fromWallet.publicKey,
      9
    );
    console.log(`Token Created Successfully at address: ${mint.toBase58()}`);

    tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      fromWallet.publicKey
    );
    console.log(
      `Tokens Stored Successfully at address: ${tokenAccount.address.toBase58()}`
    );
  }

  async function mintToken() {
    // Mint 1 new token to the "fromTokenAccount" account we just created
    const mintTransactionSignature = await mintTo(
      connection,
      fromWallet,
      mint,
      tokenAccount.address,
      fromWallet.publicKey,
      100000 // 10 billion
    );
    console.log(`Mint signature: ${mintTransactionSignature}`);
  }

  async function getTotalSupply() {
    // get the supply of tokens we have minted into existance
    const mintInfo = await getMint(connection, mint);
    console.log(`Current Total supply is ${mintInfo.supply}`);
  }
  
  // get the amount of tokens left in the account
  async function getBalance() {
    const tokenAccountInfo = await getAccount(connection, tokenAccount.address);
    console.log(tokenAccountInfo.amount);
  }

  async function sendTokens() {
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      toWalletAddress
    );
    console.log(
      `Token Account for receiver created at address:${toTokenAccount.address} `
    );
    //validate both Balances Before
    const senderBalBefore = await getAccount(connection, tokenAccount.address);
    const receiverBalBefore = await getAccount(
      connection,
      toTokenAccount.address
    );

    // Transfer Tokens
    const sendTransactionSign = await transfer(
      connection,
      fromWallet,
      tokenAccount.address,
      toTokenAccount.address,
      fromWallet.publicKey,
      50
    );
    await connection.confirmTransaction(sendTransactionSign);
    console.log(
      ` Tokens Transfered, Please check the Details with Transaction ID: ${sendTransactionSign}`
    );

    const senderBalAfter = await getAccount(connection, tokenAccount.address);
    const receiverBalAfter = await getAccount(
      connection,
      toTokenAccount.address
    );

    console.log(
      `Sender Balance Before: ${senderBalBefore.amount} and Sender balance after: ${senderBalAfter.amount}`
    );
    console.log(
      `Receiver Balance Before: ${receiverBalBefore.amount} and Sender balance after: ${receiverBalAfter.amount}`
    );
  }

  return (
    <div>
      <div>
        Mint New Token
        <div>
          <button onClick={createToken}>Create Token</button>
          <button onClick={mintToken}>Mint Token</button>
          <button onClick={getTotalSupply}>Get Total Supply</button>
          <button onClick={getBalance}>Check Balance</button>
          <button onClick={sendTokens}>Send Tokens</button>
        </div>
      </div>
      
    </div>
  );
}

export default MintToken;
