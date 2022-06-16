const anchor = require("@project-serum/anchor");

const { SystemProgram } = anchor.web3;

const main = async() => {
  console.log("🚀 Starting test...")

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Pzportal;

  const baseAccount = anchor.web3.Keypair.generate();
  let tx = await program.rpc.startStuffOff({
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [baseAccount],
  });
  console.log("📝 Your transaction signature", tx);

  let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 Message Count', account.totalMsgs.toString())

  await program.rpc.addMsg("This is sample txt!", {
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
    },
  });

  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 Message Count', account.totalMsgs.toString())

  console.log('👀 Message List', account.msgList)
}


const runMain = async () => {
  try{
    await main();
    process.exit(0);
  } catch (error){
    console.error(error);
    process.exit(1);
  }
};


runMain();