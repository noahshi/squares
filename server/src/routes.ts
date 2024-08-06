import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";


// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;  // only writing, so no need to check
const files: Map<string, unknown> = new Map<string, unknown>();


/** Returns a list of all the named save files. */
export const dummy = (req: SafeRequest, res: SafeResponse): void => {
  const name = first(req.query.name);
  if (name === undefined) {
    res.status(400).send('missing "name" parameter');
    return;
  }

  res.send({greeting: `Hi, ${name}`});
};


// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
const first = (param: unknown): string|undefined => {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
};

/** 
 * Handles request for /save by storing the given file. 
 * 
 * Takes "name" of the file and the "value" to store from body
 * 
 * Responds with 400 if "name" or "value" is missing, otherwise with success confirmation
 */
export const save = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.body.name;
  if (name === undefined || typeof name !== 'string') {
    res.status(400).send('required argument "name" was missing');
    return;
  }
  const value = req.body.value;
  if (value === undefined) {
    res.status(400).send('required argument "value" was missing');
    return;
  }
  const replaced : boolean = files.has(name);
  files.set(name, value);
  res.send({replaced: replaced});
}

/** 
 * Handles request for /load by returning the file requested. 
 * 
 * takes "name" of file from query
 * 
 * Responds with 400 if "name" is missing, 
 *    404 if there is no "value" corresponding with the given "name",
 *    otherwise with success confirmation and the requested "value"
 */
export const load = (req: SafeRequest, res: SafeResponse): void => {
  const name = first(req.query.name);
  if (name === undefined || typeof name !== 'string') {
    res.status(400).send('required argument "name" was missing');
    return;
  }

  if(!files.has(name)){
    res.status(404).send('file not found');
    return;
  }
  res.send({value: files.get(name)});
}

/** 
 * Handles request for /list by returning the list of the names of all files currently saved
 * 
 * Does not take any parameters
 * 
 * Responds with success confirmation and the list of files
 */
export const list = (_req: SafeRequest, res: SafeResponse): void => {
  res.send({files: Array.from(files.keys())});
}

/** Used in tests to clear the files map */
export const resetFilesForTesting = (): void => {
  files.clear();
}
