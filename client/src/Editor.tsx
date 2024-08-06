import React, { ChangeEvent, Component, MouseEvent } from "react";
import { Square, Path, findSquare, replaceSquare, split, Color, solid, toColor, toJson } from './square';
import { SquareElem } from "./square_draw";
import { List, cons, nil, rev } from "./list";
import "./Editor.css";

/** 
 * EC Features:
 * - Undo/Redo Buttons
 */

type EditorProps = {
  /** Initial state of the file. */
  initialState: Square;
  /** Initial name of the file */
  initalName: string;

  /** Function for saving files */
  onSave: (name: string, value: unknown) => void;

  /** Function for returning to the start menu */
  back: () => void;
};


type EditorState = {
  /** The root square of all squares in the design */
  root: Square;

  /** Path to the square that is currently clicked on, if any */
  selected?: Path;

  /** Selected operation and color, color defaulted to "white" */
  operation?: Operation;
  color: Color;

  /** Name of the file */
  name: string;

  /** stores past and future squares for undo/redo */
  undo: List<Square>;
  redo: List<Square>;
};

/** Operation type to make storing the type of operation easier */
type Operation = "split" | "merge" | "color";

/** converts a string to an Operation when valid, throws error otherwise */
const toOp = (s: string): Operation => {
  switch (s) {
    case "split": case "merge": case "color":
      return s;

    default:
      throw new Error(`unknown operation "${s}"`);
  }
};


/** UI for editing the image. */
export class Editor extends Component<EditorProps, EditorState> {

  constructor(props: EditorProps) {
    super(props);

    this.state = { root: props.initialState, color: "white", name: props.initalName, undo: nil, redo: nil };
  }

  /** Renders the editor */
  render = (): JSX.Element => {
    // TODO: add some editing tools here
    return  <div>
              <h1>{this.state.name}</h1>
              <div className="container">
                <div className="tools">
                  <fieldset className="operations">
                    <legend>Select an operation:</legend>
                    <label htmlFor="split" className="op"><input type="radio" id="split" name="op" value="split" onChange={this.setOperation}/>Split</label>
                    <label htmlFor="merge" className="op"><input type="radio" id="merge" name="op" value="merge" onChange={this.setOperation}/>Merge</label>
                    <label htmlFor="color" className="op"><input type="radio" id="color" name="op" value="color" onChange={this.setOperation}/>Color</label>
                      <select id="color" name="color" className="op" onChange={this.setColor}>
                        <option value="white">White</option>
                        <option value="red">Red</option>
                        <option value="orange">Orange</option>
                        <option value="yellow">Yellow</option>
                        <option value="green">Green</option>
                        <option value="blue">Blue</option>
                        <option value="purple">Purple</option>
                    </select>
                    <div className="opButtons">
                      <input type="button" onClick={this.doUndoClick} value="Undo" className="button"></input>
                      <input type="button" onClick={this.doRedoClick} value="Redo" className="button"></input>
                    </div>
                  </fieldset>
                  <div className="buttons">
                    <input type="button" onClick={this.doSaveClick} value="Save" className="button"></input>
                    <input type="button" onClick={this.doBackClick} value="Back" className="button"></input>
                  </div>
                </div>
                <div className="display">
                  <SquareElem width={600n} height={600n}
                      square={this.state.root} selected={this.state.selected}
                      onClick={this.doSquareClick}></SquareElem>
                </div>
              </div>
            </div>;
  };

  /** Changes the color used by the editor to the selected color */
  setColor = (event: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ color: toColor(event.target.value) });
  }

  /** Changes the operation used by the editor to the seleced operation */
  setOperation = (event: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ operation: toOp(event.target.value) });
  }

  /** Saves the file to the server */
  doSaveClick = (_event: MouseEvent<HTMLInputElement>): void => {
    this.props.onSave(this.state.name, toJson(this.state.root));
  }

  /** Returns to the start menu */
  doBackClick = (_event: MouseEvent<HTMLInputElement>): void => {
    this.props.back();
  }

  /** Undos the most recent action (if there is any) */
  doUndoClick = (_event: MouseEvent<HTMLInputElement>): void => {
    if(this.state.undo.kind === "nil"){
      alert("Nothing to undo");
      return;
    }
    this.setState({ redo : cons(this.state.root, this.state.redo) });
    this.setState({ root: this.state.undo.hd, undo : this.state.undo.tl });
  }

  /** Redos the most recent action (if there is any)*/
  doRedoClick = (_event: MouseEvent<HTMLInputElement>): void => {
    if(this.state.redo.kind === "nil"){
      alert("Nothing to redo");
      return;
    }
    this.setState({ undo : cons(this.state.root, this.state.undo) });
    this.setState({ root: this.state.redo.hd, redo : this.state.redo.tl });
  }

  /** Determines what to do with a clicked square depending on the selected operation and color */
  doSquareClick = (path: Path): void => {
    // TODO: remove this code, do something with the path to the selected square
    console.log(path);
    switch(this.state.operation){
      case "split":
        this.doSplitClick(path);
        return;
      case "merge":
        this.doMergeClick(path);
        return;
      case "color":
        this.doColorChange(path);
        return;
      default:
        alert("Select an operation");
    }
  }

  /** Splits the clicked square into 4 smaller squares of the same color */
  doSplitClick = (path : Path): void => {
    // TODO: implement
    if(path === undefined){
      throw new Error("Should not happen");
    }

    const square: Square = findSquare(this.state.root, path);
    if(square.kind === "split"){
      alert("Square already split");
      return;
    }
    const newRoot : Square = replaceSquare(this.state.root, path, split(square, square, square, square));
    this.setState({ undo : cons(this.state.root, this.state.undo), redo : nil });
    this.setState({ root: newRoot });
  };

  /** Merges the clicked square with all other squares that share the same parent square. 
   * Resulting square will be the same color as the clicked square. */
  doMergeClick = (path: Path): void => {
    // TODO: implement
    if(path === undefined){
      throw new Error("Should not happen");
    }

    if(path.kind === "nil"){
      alert("Root square cannot be merged");
      return;
    }
    const square: Square = findSquare(this.state.root, path);

    const revNewPath : Path = rev(path);
    if(revNewPath.kind === "nil"){
      throw new Error("Should not happen");
    }
    const newPath : Path = rev(revNewPath.tl);
    const newRoot : Square = replaceSquare(this.state.root, newPath, square);
    this.setState({ undo : cons(this.state.root, this.state.undo), redo : nil });
    this.setState({ root: newRoot });
  };

  /** Changes color of the clicked square to the color selected by the editor */
  doColorChange = (path: Path): void => {
    // TODO: implement
    if(path === undefined){
      throw new Error("Should not happen");
    }

    if(this.state.color === undefined){
      alert("No color selected");
      return;
    }

    const newRoot : Square = replaceSquare(this.state.root, path, solid(this.state.color));
    this.setState({ undo : cons(this.state.root, this.state.undo), redo : nil });
    this.setState({ root: newRoot });
  };
}
