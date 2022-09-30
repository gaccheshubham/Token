import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
  mintTo,
  transfer,
  Account,
  getMint,
  getAccount,
  createAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { useState } from "react";

window.Buffer = window.Buffer || require("buffer").Buffer;
let mint: PublicKey;
let tokenAccount: Account;
function MintToken() {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const fromWallet = Keypair.generate();

  const toWalletAddress = Keypair.generate().publicKey;

  let [balUser, setBalUser] = useState("");
  let [receiver, setReceiver] = useState("");
  let [amount, setAmount] = useState(0);

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
    console.log(`Token created by: ${fromWallet.publicKey}`);
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
  async function getTokenBalance() {
    const tokenAccountInfo = await getAccount(connection, tokenAccount.address);
    console.log(tokenAccountInfo.amount);
  }

  async function getUserBalanceManual() {
    const tokenAccountInfo = await getAccount(
      connection,
      new PublicKey(balUser)
    );
    console.log(`Balance is: ${tokenAccountInfo.amount}`);

    // const tokenAccount = await getAssociatedTokenAddress(mint,new PublicKey(balUser) );
    // console.log(tokenAccount);

    // const tokenAccount2 = await createAssociatedTokenAccount(
    //   connection,
    //   fromWallet,
    //   mint,
    //   new PublicKey(balUser)
    // );

    // console.log(tokenAccount2)
    // const tokenAccount3 = await getOrCreateAssociatedTokenAccount(
    //   connection,
    //   fromWallet,
    //   mint,
    //   new PublicKey(balUser)
    // );
    // console.log(tokenAccount3);
  }

  async function sendTokensManual() {
    const tokens = amount;

    const fromTokenAccount = await getAccount(connection, tokenAccount.address);
    const toTokenAccount = await getAccount(
      connection,
      new PublicKey(receiver)
    );
    
    //validate both Balances Before
    const senderBefore = await getAccount(connection, fromTokenAccount.address);
    const receiverBefore = await getAccount(connection, toTokenAccount.address);

    // Transfer Tokens
    const sendTransactionSign = await transfer(
      connection,
      fromWallet,
      senderBefore.address,
      receiverBefore.address,
      tokenAccount.address,
      tokens
    );
    await connection.confirmTransaction(sendTransactionSign);
    console.log(
      ` Tokens Transfered, Please check the Details with Transaction ID: ${sendTransactionSign}`
    );

    const senderAfter = await getAccount(connection, tokenAccount.address);
    const receiverAfter = await getAccount(connection, toTokenAccount.address);

    console.log(
      `Sender Balance Before: ${senderBefore.amount} and Sender balance after: ${senderAfter.amount}`
    );
    console.log(
      `Receiver Balance Before: ${receiverBefore.amount} and Sender balance after: ${receiverAfter.amount}`
    );
  }

  const handleReceiver = (event: any) => {
    setReceiver(event.target.value);
    receiver = event.target.value;

    console.log("value is:", event.target.value);
  };

  const handleAmount = (event: any) => {
    setAmount(event.target.value);
    amount = event.target.value;
    console.log("value is:", event.target.value);
  };

  const handleSetBalUser = (event: any) => {
    setBalUser(event.target.value);
    balUser = event.target.value;
    console.log("value is:", event.target.value);
  };

  async function sendTokens() {
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      toWalletAddress
    );
    console.log(`Receiver is: ${toWalletAddress}`);
    console.log(
      `Token Account for receiver created at address:${toTokenAccount.address.toBase58()} `
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
      `Tokens Transfered, Please check the Details with Transaction ID: ${sendTransactionSign}`
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
          <button onClick={getTokenBalance}>Get Token Balance</button>
          <button onClick={sendTokens}>SendTokens</button>
          <p id="output"></p>
        </div>
        <div>
          <div>
            {" "}
            Check Balance
            <div>
              <input
                type="text"
                id="address"
                placeholder="Token Account Address"
                onChange={handleSetBalUser}
              ></input>
              <button onClick={getUserBalanceManual}>Check Balance</button>{" "}
              <br></br>
              <p id="output"></p>
            </div>
          </div>
          <div>
            {" "}
            Transfer
            <div>
              <input
                type="text"
                id="Address"
                placeholder="Receiver Address"
                onChange={handleReceiver}
              />
              <input
                type="number"
                id="Address"
                placeholder="Amount"
                onChange={handleAmount}
              />
              <button onClick={sendTokensManual}>Send Tokens</button>
              <p id="output"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MintToken;
