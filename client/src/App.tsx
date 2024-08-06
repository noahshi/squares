import React, { Component, MouseEvent } from "react";
import { Square, fromJson, solid, split } from './square';
//import { SquareElem } from './square_draw';
import { Editor } from "./Editor";
import { isRecord } from "./record";
import "./Editor.css";


type AppState = {
  // will probably need something here
  /** Whether the user is in the start menu or not */
  inStartMenu: boolean;
  /** Name of the file being created/loaded */
  fileName?: string;
  /** Root square of the file */
  sq: Square;
  /** List of files */
  files?: string[];
};


export class App extends Component<{}, AppState> {

  constructor(props: {}) {
    super(props);

    this.state = {inStartMenu: true, sq: split(solid("blue"), solid("orange"), solid("purple"), solid("red"))};
  }

  render = (): JSX.Element => {
    if (this.state.inStartMenu) {
      return <div className="start"><p className='input'>File name: <input type="text" name="fileName" id="fileName"/></p>
              <input type="button" onClick={this.setFileName} value="Create New File" className="newFileButton"></input>
              <fieldset><legend>Saved Files</legend>{this.renderFiles()}</fieldset>
              </div>
              
    }
    return <Editor initialState={this.state.sq} initalName={this.state.fileName ?? "New Project" /** this part should never happen */} 
        onSave={this.doSaveClick} back={this.doResetClick}/>
  };

  /** Sets the file name. Does not allow empty or undefined strings as a name */
  setFileName = (_event: MouseEvent<HTMLInputElement>): void => {
    const name = document.querySelector<HTMLInputElement>('#fileName')?.value;
    if (name === undefined || name === null || name === '') {
      alert("Invalid Name");
      return;
    }
    
    this.setState({inStartMenu: false, fileName: name});
  }

  // TODO: add some functions to access routes and handle state changes probably

  /** Saves file to the server */
  doSaveClick = (name: string, value: unknown) : void => {
    fetch('/api/save', {method: 'POST', body: JSON.stringify({name: name, value: value}), 
        headers: {'Content-Type': 'application/json'}})
        .then(this.doSaveResp)
        .catch(() => this.doFetchError("save", "failed to connect to server"));
  }
  /** Checks if the save request was valid and sends a file saved notification if it is */
  doSaveResp = (res: Response) : void => {
    if (res.status !== 200) {
      this.doFetchError("save", `status code ${res.status}: ${res.statusText}`);
      return;
    }
    alert("File Saved");
  }

  /** Logs fetch errors to the console */
  doFetchError = (call: String, msg: String) : void => {
    console.error(`Error fetching /${call}: ${msg}`);
  }

  /** Resets the menu options and reloads the list of saved files when returning to the start menu */
  doResetClick = () : void => {
    fetch('/api/list')
      .then(this.doListResp)
      .catch(() => this.doFetchError("list", "failed to connect to server"));
    this.setState({inStartMenu: true, fileName: undefined, sq: split(solid("blue"), solid("orange"), solid("purple"), solid("red"))});
  }

  /** Loads the list of saved files when the website gets loaded for the first time */
  componentDidMount = (): void => {
    fetch('/api/list')
      .then(this.doListResp)
      .catch(() => this.doFetchError("list", "failed to connect to server"));
  }

  /** Checks if the list request was valid, will attempt to parse the list if it is */
  doListResp = (res: Response) : void => {
    if (res.status !== 200) {
      this.doFetchError("list", `status code ${res.status}: ${res.statusText}`);
      return;
    }
    res.json().then(this.doListJson);
  }

  /** Attempts to parse the json as a list, will log an error if the input is not json */
  doListJson = (json: unknown) : void => {
    if(!isRecord(json)){
      this.doFetchError("list", "response is not json");
      return;
    }
    this.setState({files: fileNamesFromJson(json.files)});
  }

  /** Turns the array of file names into HTML components */
  renderFiles = (): JSX.Element => {
    if (this.state.files === undefined) {
      return <p>Loading files...</p>;
    } else {
      const items : JSX.Element[] = [];
      for (const [index, item] of this.state.files.entries()) {
        items.push(
          <li className="file" key={index}>
            <a href="#" onClick={this.doLoadClick}>{item}</a>
          </li>);
      }
      return <ul>{items}</ul>;
    }
  };

  /** loads the file with the clicked name */
  doLoadClick = (event: MouseEvent<HTMLAnchorElement>) : void => {
    this.setState({fileName: event.currentTarget.text});
    fetch('/api/load?' + new URLSearchParams({name: event.currentTarget.text}))
        .then(this.doLoadResp)
        .catch(() => this.doFetchError("load", "failed to connect to server"));
  }

  /** checks if the load request was valid, will attempt to load the editor with the requested file if it is */
  doLoadResp = (res: Response) : void => {
    if (res.status !== 200) {
      this.doFetchError("load", `status code ${res.status}: ${res.statusText}`);
      return;
    }
    res.json().then(this.doLoadJson);
  }

  /** Sends the user to the editor menu with the loaded square, logs an error if the input is not json */
  doLoadJson = (json: unknown) : void => {
    if(!isRecord(json)){
      this.doFetchError("load", "response is not json");
      return;
    }
    this.setState({inStartMenu: false, sq: squareFromJson(json.value)});
  }

}

/** Parses the json into an array, will throw an error if the 
 * json is not an array or if an element of the array is not a string */
const fileNamesFromJson = (val: unknown): string[] => {
  if (!Array.isArray(val)) {
    throw new Error(`value is not an array: ${typeof val}`);
  }

  const fileNames: string[] = [];
  for (const fileName of val) {
    if (typeof fileName !== 'string') {
      throw new Error(`File Name is not a string: ${typeof fileName}`);
    } else {
      fileNames.push(fileName);
    }
  }
  return fileNames;
};

/** Parses the json into a square, will throw an error if input is not in json */
const squareFromJson = (val: unknown): Square => {
  if (!isRecord(val)) {
    throw new Error(`value is not a record: ${typeof val}`);
  }
  return fromJson(val);
}

