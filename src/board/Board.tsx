import Palette from "./palette/Palette";
import Workspace from "./workspace/Workspace";
import "./Board.css";

const Board = () => {
  return (
    <main>
      <Palette />
      <Workspace />
    </main>
  );
};

export default Board;