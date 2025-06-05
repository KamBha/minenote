import Board from './board/Board';
import Header from './Header';
import store from "./board/workspace/workspaceStore.ts";
import { Provider } from 'react-redux';

function App() {

  return (
    <Provider store={store}>
      <div className="app">
        <Header />
        <Board />
      </div>
    </Provider>
  );
}

export default App;
