"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetFilesForTesting = exports.list = exports.load = exports.save = exports.dummy = void 0;
var files = new Map();
/** Returns a list of all the named save files. */
var dummy = function (req, res) {
    var name = first(req.query.name);
    if (name === undefined) {
        res.status(400).send('missing "name" parameter');
        return;
    }
    res.send({ greeting: "Hi, ".concat(name) });
};
exports.dummy = dummy;
// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
var first = function (param) {
    if (Array.isArray(param)) {
        return first(param[0]);
    }
    else if (typeof param === 'string') {
        return param;
    }
    else {
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
var save = function (req, res) {
    var name = req.body.name;
    if (name === undefined || typeof name !== 'string') {
        res.status(400).send('required argument "name" was missing');
        return;
    }
    var value = req.body.value;
    if (value === undefined) {
        res.status(400).send('required argument "value" was missing');
        return;
    }
    var replaced = files.has(name);
    files.set(name, value);
    res.send({ replaced: replaced });
};
exports.save = save;
/**
 * Handles request for /load by returning the file requested.
 *
 * takes "name" of file from query
 *
 * Responds with 400 if "name" is missing,
 *    404 if there is no "value" corresponding with the given "name",
 *    otherwise with success confirmation and the requested "value"
 */
var load = function (req, res) {
    var name = first(req.query.name);
    if (name === undefined || typeof name !== 'string') {
        res.status(400).send('required argument "name" was missing');
        return;
    }
    if (!files.has(name)) {
        res.status(404).send('file not found');
        return;
    }
    res.send({ value: files.get(name) });
};
exports.load = load;
/**
 * Handles request for /list by returning the list of the names of all files currently saved
 *
 * Does not take any parameters
 *
 * Responds with success confirmation and the list of files
 */
var list = function (_req, res) {
    res.send({ files: Array.from(files.keys()) });
};
exports.list = list;
/** Used in tests to clear the files map */
var resetFilesForTesting = function () {
    files.clear();
};
exports.resetFilesForTesting = resetFilesForTesting;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JvdXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFPQSxJQUFNLEtBQUssR0FBeUIsSUFBSSxHQUFHLEVBQW1CLENBQUM7QUFHL0Qsa0RBQWtEO0FBQzNDLElBQU0sS0FBSyxHQUFHLFVBQUMsR0FBZ0IsRUFBRSxHQUFpQjtJQUN2RCxJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuQyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7UUFDdEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUNqRCxPQUFPO0tBQ1I7SUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUMsUUFBUSxFQUFFLGNBQU8sSUFBSSxDQUFFLEVBQUMsQ0FBQyxDQUFDO0FBQ3RDLENBQUMsQ0FBQztBQVJXLFFBQUEsS0FBSyxTQVFoQjtBQUdGLHdFQUF3RTtBQUN4RSw0RUFBNEU7QUFDNUUsbURBQW1EO0FBQ25ELElBQU0sS0FBSyxHQUFHLFVBQUMsS0FBYztJQUMzQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDeEIsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDeEI7U0FBTSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUNwQyxPQUFPLEtBQUssQ0FBQztLQUNkO1NBQU07UUFDTCxPQUFPLFNBQVMsQ0FBQztLQUNsQjtBQUNILENBQUMsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQUNJLElBQU0sSUFBSSxHQUFHLFVBQUMsR0FBZ0IsRUFBRSxHQUFpQjtJQUN0RCxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUMzQixJQUFJLElBQUksS0FBSyxTQUFTLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO1FBQ2xELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLENBQUM7UUFDN0QsT0FBTztLQUNSO0lBQ0QsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDN0IsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO1FBQ3ZCLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLENBQUM7UUFDOUQsT0FBTztLQUNSO0lBQ0QsSUFBTSxRQUFRLEdBQWEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN2QixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7QUFDakMsQ0FBQyxDQUFBO0FBZFksUUFBQSxJQUFJLFFBY2hCO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSSxJQUFNLElBQUksR0FBRyxVQUFDLEdBQWdCLEVBQUUsR0FBaUI7SUFDdEQsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkMsSUFBSSxJQUFJLEtBQUssU0FBUyxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtRQUNsRCxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBQzdELE9BQU87S0FDUjtJQUVELElBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDO1FBQ2xCLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdkMsT0FBTztLQUNSO0lBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUMsQ0FBQztBQUNyQyxDQUFDLENBQUE7QUFaWSxRQUFBLElBQUksUUFZaEI7QUFFRDs7Ozs7O0dBTUc7QUFDSSxJQUFNLElBQUksR0FBRyxVQUFDLElBQWlCLEVBQUUsR0FBaUI7SUFDdkQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztBQUM5QyxDQUFDLENBQUE7QUFGWSxRQUFBLElBQUksUUFFaEI7QUFFRCwyQ0FBMkM7QUFDcEMsSUFBTSxvQkFBb0IsR0FBRztJQUNsQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDaEIsQ0FBQyxDQUFBO0FBRlksUUFBQSxvQkFBb0Isd0JBRWhDIn0=