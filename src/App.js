import logo from './logo.svg';
import './App.scss';
import { Header } from './components/header/header';
import { Face } from './components/face/face';

function App() {
  return (
    <div className="App">
      <Header name="fuck"/>
      <Face />
    </div>
  );
}

export default App;
