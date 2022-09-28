import {
    clusterApiUrl,
    Connection,
    PublicKey,
    Keypair,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    Transaction,  
  } from "@solana/web3.js";
  import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    transfer,
    Account,
    getAccount,
    createSetAuthorityInstruction, 
    AuthorityType
  } from "@solana/spl-token";

  window.Buffer = window.Buffer || require("buffer").Buffer;
  
  function MintNFT() {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const fromWallet = Keypair.generate();
    let mint: PublicKey;
    let tokenAccount: Account;
    let toWalletAddress = Keypair.generate().publicKey;
  
    async function createNft() {
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
        0 //As it's a NFT
      );
      console.log(`Nft Created Successfully at address: ${mint.toBase58()}`);
  
      tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey
      );
      console.log(
        `Token Stored Successfully at address: ${tokenAccount.address.toBase58()}`
      );
    }
  
    async function mintNft() {
      // Mint 1 new token to the "fromTokenAccount" account we just created
      const mintTransactionSignature = await mintTo(
        connection,
        fromWallet,
        mint,
        tokenAccount.address,
        fromWallet.publicKey,
        1 // single NFT
      );
      console.log(`Mint Transaction Signature: ${mintTransactionSignature}`);
    }
    
    async function transferOwnership() {
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
        1
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

    async function lockNft() {
        let transaction = new Transaction()
        .add(createSetAuthorityInstruction(
          mint,
          fromWallet.publicKey,
          AuthorityType.MintTokens,
          null
        ));
      
      const lockSign = await sendAndConfirmTransaction(connection, transaction, [fromWallet]);        
      console.log(`Further Minting Disabled.Transaction Sign: ${lockSign}`)
    }
  
    return (
      <div>
        <div>
          Mint NFT's
          <div>
            <button onClick={createNft}>Create NFT</button>
            <button onClick={mintNft}>Mint NFT</button>
            <button onClick={lockNft}>Disable Mint</button>
            <button onClick={transferOwnership}>Transfer NFT</button>
          </div>
        </div>
      </div>
    );
  }
  
  export default MintNFT;
  