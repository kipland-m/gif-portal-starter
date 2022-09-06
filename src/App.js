
import React, {useEffect, useState} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import idl from './idl.json';
import kp from './keypair.json'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3;

// Create a keypair for the account that will hold the GIF data.
// Logic for keypair generation needs to be changed in order for user
// not to be prompted for new account upon refresh
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

// Constants
const TWITTER_HANDLE = 'kiplandvaughn';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;


const App = () => {
  /*
    * This function holds the logic for deciding if a Phantom Wallet is
    * connected or not
    */

  const[walletAddress, setWalletAddress] = useState(null);
  const[inputValue, setInputValue] = useState('');
  const[msgList, setMsgList] = useState([]);

  const checkIfWalletIsConnected = async () => {
    /* try to create solana object from window */
    try {

      const {solana} = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          
         /*
         * The solana object gives us a function that will allow us to connect
         * directly with the user's wallet!
         */
          const response = await solana.connect({ onlyIfTrusted: true });
          
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()
          );

          /* calls setWalletAddress function in the state variable declared above
          * this assigns the walletAddress value to response.publicKey.toString()
          */
          setWalletAddress(response.publicKey.toString());

        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

    /*
   * Let's define this method so our code doesn't break.
   * We will write the logic for this next!
   */
  const connectWallet = async () => {
    const { solana } = window;
  
    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const sendMsg = async () => {
    if (inputValue.length === 0) {
      console.log("No input was given, try again.")
      return
    }
    setInputValue('');
    console.log('MSG Contents: ', inputValue);

    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addMsg(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },  
      });
      console.log('MSG successfully sent to program ', inputValue)
      
      await getMsgList();
    } catch (error) {
      console.log('Error sending gif', error)
    }
    


  };

  /* This function fires off when you submit text on the webpage */
  /* This calls the function setInputValue, which like the walletAddress, is
  a part of a state variable. so setInputValue's only purpose to to assign a value 
  to inputValue */
  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      /* getProvider is a way of creating a secure connection to Solana
      which is why it is utilizing the window.solana object */
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const createMsgAccount = async () => {
    try{
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log('ping')

      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log('Created new BaseAccount with address:', baseAccount.publicKey.toString())
      await getMsgList();
    } catch(error) {
      console.log('Error creating BaseAccount account:', error)
    } 
  }

    /* React function that just returns some HTML.
    * This HTML is the connect to wallet button, that it's onClick effect is to run the connectWallet
    * function above.
    */
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}>
      Connect to Wallet
    </button>
  );

  const renderNotConnectIntoText = () => (
   <div className='intro-text'>
    <p className="header">pz portal</p>
    <p className="sub-text">
    place your mark on the ancient texts of pz industries
    </p>
  </div>
  );


  const renderConnectedContainer = () => {
    if (msgList === null) {
      return (
        <div className='connected-container'>
          <button className='cta-button submit-gif-button' onClick={createMsgAccount}>
            Do One-Time initialization for MSG Program Account
          </button>
        </div>
      )
    }

      else{
    return(
        <div className="connected-container">

        {/* input box goes here! */}
        <form onSubmit={(event) => {
          event.preventDefault();
          sendMsg();
        }}>

        <input 
          type="text" 
          placeholder='enter a message'
          value={inputValue}
          onChange={onInputChange}
        />
        <button type="submit" className='cta-button submit-msg-button'>
          submit
        </button>
        

      </form>
      <div className="msg-grid">
        {msgList.map((item, index ) => (
          <div className="msg-item" key={index}>
            <li>{item.msgContent}</li>
          </div>
        ))}
      </div>
    </div>
    )
  }
}
  

  /*
    * When our component first mounts, let's check to see if we have a connected
    * Phantom Wallet
    */
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  const getMsgList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      console.log("Got the account", account)
      setMsgList(account.msgList)
  
    } catch (error) {
      console.log("Error in getMsgList: ", error)
      setMsgList(null);
    }
  }

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching messages..")
      getMsgList()
    }
  }, [walletAddress]);


  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className='icon'>📜🔮</p>
          {/* This renders the connect to wallet button from a function declared above */}
          {!walletAddress && renderNotConnectedContainer()}
          {!walletAddress && renderNotConnectIntoText()}

          {/* This renders when walletAddress has a value, displaying the message board and 
          input box  */}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
