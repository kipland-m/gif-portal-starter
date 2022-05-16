
import React, {useEffect, useState} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import idl from './idl.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
let baseAccount = Keypair.generate();

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


const TEST_MSGs = [
  'Hey this is a test',
  'Test number 2',
  'eat your toothpaste',
  'also meat too'
]

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
    if (inputValue.length > 0) {
      console.log("Given message:", inputValue)
      setMsgList([...msgList, inputValue])
      setInputValue('')
    } else {
      console.log("No input was given, try again.")
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
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
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


  const renderConnectedContainer = () => (
    <div className="connected-container">
      {/* input box goes here! */}
      <form onSubmit={(event) => {
        event.preventDefault();
        sendMsg();
      }}>
        <input type="text" 
        placeholder='enter a message'
        value={inputValue}
        onChange={onInputChange}
        />
        <button type="submit" className='cta-button submit-msg-button'>submit</button>

      </form>
      <div className="msg-grid">
        {msgList.map(msg => (
          <div className="msg-item" key={msg}>
            <li>{msg}</li>
          </div>
        ))}
      </div>
    </div>
  );
  

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

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching messages..")

      setMsgList(TEST_MSGs);
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
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
