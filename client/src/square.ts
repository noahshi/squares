import { List } from './list';


export type Color = "white" | "red" | "orange" | "yellow" | "green" | "blue" | "purple";

/** Converts a string to a color (or throws an exception if not a color). */
export const toColor = (s: string): Color => {
  switch (s) {
    case "white": case "red": case "orange": case "yellow":
    case "green": case "blue": case "purple":
      return s;

    default:
      throw new Error(`unknown color "${s}"`);
  }
};

export type Square =
    | {readonly kind: "solid", readonly color: Color}
    | {readonly kind: "split", readonly nw: Square, readonly ne: Square,
       readonly sw: Square, readonly se: Square};

/** Returns a solid square of the given color. */
export const solid = (color: Color): Square => {
  return {kind: "solid", color: color};
};

/** Returns a square that splits into the four given parts. */
export const split =
    (nw: Square, ne: Square, sw: Square, se: Square): Square => {
  return {kind: "split", nw: nw, ne: ne, sw: sw, se: se};
};


export type Dir = "NW" | "NE" | "SE" | "SW";

/** Describes how to get to a square from the root of the tree. */
export type Path = List<Dir>;


/** Returns JSON describing the given Square. */
export const toJson = (sq: Square): unknown => {
  if (sq.kind === "solid") {
    return sq.color;
  } else {
    return [toJson(sq.nw), toJson(sq.ne), toJson(sq.sw), toJson(sq.se)];
  }
};

/** Converts a JSON description to the Square it describes. */
export const fromJson = (data: unknown): Square => {
  if (typeof data === 'string') {
    return solid(toColor(data))
  } else if (Array.isArray(data)) {
    if (data.length === 4) {
      return split(fromJson(data[0]), fromJson(data[1]),
                   fromJson(data[2]), fromJson(data[3]));
    } else {
      throw new Error('split must have 4 parts');
    }
  } else {
    throw new Error(`type ${typeof data} is not a valid square`);
  }
}

/**
 * Finds the square at the end of the given path starting from the given square.
 * @param sq the square to start from
 * @param path the path to follow
 * @returns the square at the end of the given path starting from the given square
 */
export const findSquare = (sq: Square, path: Path): Square => {
  if(path.kind === "nil"){
    return sq;
  }
  return findSquare(getSubsquare(sq, path.hd), path.tl);
}

/**
 * Helper function for findSquare. Returns the subsquare in the given direction from the given square.
 * @param sq the square to get the subsquare from
 * @param dir direction to get the subsquare from
 * @returns the subsquare in the given direction from the given square
 * @throws Error if the given square is solid
 */
export const getSubsquare = (sq: Square, dir: Dir): Square => {
  if(sq.kind === "solid"){
    throw new Error("Invalid Path");
  }
  if(dir === "NW"){
    return sq.nw;
  } else if(dir === "NE"){
    return sq.ne;
  } else if(dir === "SW"){
    return sq.sw;
  } else {
    return sq.se;
  }
}

/**
 * Replaces the square at the end of the given path starting from the given start square with the given new square.
 * @param sq The square to start from
 * @param path The path to follow to the square to replace
 * @param newSq The new square to replace the old square with
 * @returns The start square with the square at the end of the given path replaced with the given new square
 * @throws Error if the given path attempts to go through a solid square
 */
export const replaceSquare = (sq: Square, path: Path, newSq: Square): Square => {
  if(path.kind === "nil"){
    return newSq;
  }
  if(sq.kind === "solid"){
    throw new Error("Invalid Path");
  }

  if(path.hd === "NW"){
    return split(replaceSquare(sq.nw, path.tl, newSq), sq.ne, sq.sw, sq.se);
  } else if(path.hd === "NE"){
    return split(sq.nw, replaceSquare(sq.ne, path.tl, newSq), sq.sw, sq.se);
  } else if(path.hd === "SW"){
    return split(sq.nw, sq.ne, replaceSquare(sq.sw, path.tl, newSq), sq.se);
  } else {
    return split(sq.nw, sq.ne, sq.sw, replaceSquare(sq.se, path.tl, newSq));
  }
}
