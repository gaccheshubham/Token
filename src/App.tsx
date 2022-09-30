
import MintToken from './mintToken';
import './App.css';
import MintNFT from './MintNFT';
import { Wallet } from './wallet';
import {MintTokenWallet} from './minTokenWallet'



function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div>
          <Wallet/>
          <MintToken/>
          <MintNFT/>
        </div>
      </header>
    </div>
  );
}

export default App;
