import * as assert from 'assert';
import { solid, split, toJson, fromJson, findSquare, replaceSquare, getSubsquare } from './square';
import { cons, nil } from './list';


describe('square', function() {

  it('toJson', function() {
    assert.deepEqual(toJson(solid("white")), "white");
    assert.deepEqual(toJson(solid("green")), "green");

    const s1 = split(solid("blue"), solid("orange"), solid("purple"), solid("white"));
    assert.deepEqual(toJson(s1),
      ["blue", "orange", "purple", "white"]);

    const s2 = split(s1, solid("green"), s1, solid("red"));
    assert.deepEqual(toJson(s2),
      [["blue", "orange", "purple", "white"], "green",
       ["blue", "orange", "purple", "white"], "red"]);

    const s3 = split(solid("green"), s1, solid("yellow"), s1);
    assert.deepEqual(toJson(s3),
      ["green", ["blue", "orange", "purple", "white"],
       "yellow", ["blue", "orange", "purple", "white"]]);
  });

  it('fromJson', function() {
    assert.deepEqual(fromJson("white"), solid("white"));
    assert.deepEqual(fromJson("green"), solid("green"));

    const s1 = split(solid("blue"), solid("orange"), solid("purple"), solid("white"));
    assert.deepEqual(fromJson(["blue", "orange", "purple", "white"]), s1);

    assert.deepEqual(
        fromJson([["blue", "orange", "purple", "white"], "green",
                 ["blue", "orange", "purple", "white"], "red"]),
        split(s1, solid("green"), s1, solid("red")));

    assert.deepEqual(
        fromJson(["green", ["blue", "orange", "purple", "white"],
                  "yellow", ["blue", "orange", "purple", "white"]]),
        split(solid("green"), s1, solid("yellow"), s1));
  });

  it('findSquare', function() {
    const s1 = split(solid("blue"), solid("orange"), solid("purple"), solid("white"));
    const s2 = split(s1, solid("red"), solid("green"), s1);
    const s3 = split(solid("green"), s2, solid("yellow"), s2);

    //error case
    assert.throws(() => findSquare(solid("red"), cons("SW", nil)));
    assert.throws(() => findSquare(s3, cons("NW", cons("NW", nil))));

    //0-1-2+ heuristic: base case
    assert.deepEqual(findSquare(s3, nil), s3);
    assert.deepEqual(findSquare(s1, nil), s1);

    //0-1-2+ heuristic: 1 recursive call
    assert.deepEqual(findSquare(s3, cons("NW", nil)), solid("green"));
    assert.deepEqual(findSquare(s2, cons("SE", nil)), s1);

    //0-1-2+ heuristic: 2+ recursive calls
    assert.deepEqual(findSquare(s3, cons("SE", cons("NW", nil))), s1);
    assert.deepEqual(findSquare(s2, cons("SE", cons("NE", nil))), solid("orange"));

  });

  it('getSubsquare', function() {
    const s1 = split(solid("blue"), solid("orange"), solid("purple"), solid("white"));
    const s2 = split(s1, solid("red"), solid("green"), s1);

    //error case
    assert.throws(() => getSubsquare(solid("red"), "NE"));
    assert.throws(() => getSubsquare(solid("green"), "SW"));

    //Conditional branch: NW
    assert.deepEqual(getSubsquare(s1, "NW"), solid("blue"));
    assert.deepEqual(getSubsquare(s2, "NW"), s1);

    //Conditional branch: NE
    assert.deepEqual(getSubsquare(s1, "NE"), solid("orange"));
    assert.deepEqual(getSubsquare(s2, "NE"), solid("red"));

    //Conditional branch: SW
    assert.deepEqual(getSubsquare(s1, "SW"), solid("purple"));
    assert.deepEqual(getSubsquare(s2, "SW"), solid("green"));

    //Conditional branch: SE
    assert.deepEqual(getSubsquare(s1, "SE"), solid("white"));
    assert.deepEqual(getSubsquare(s2, "SE"), s1);
  });

  it('replaceSquare', function() {
    const s1 = split(solid("blue"), solid("orange"), solid("purple"), solid("white"));
    const s2 = split(s1, solid("red"), solid("green"), s1);
    const s3 = split(solid("green"), s2, solid("yellow"), s2);
    const s4 = split(solid("green"), solid("purple"), s2, solid("orange"));
    const s5 = split(s3, s2, s3, s2);

    //error case
    assert.throws(() => replaceSquare(solid("red"), cons("SW", nil), solid("blue")));
    assert.throws(() => replaceSquare(s3, cons("SW", cons("NW", nil)), s4));

    //0-1-2+ heuristic: base case
    assert.deepEqual(replaceSquare(s3, nil, solid("blue")), solid("blue"));
    assert.deepEqual(replaceSquare(s1, nil, s2), s2);

    //0-1-2+ heuristic: 1 recursive call
    //Conditional branch: NW
    assert.deepEqual(replaceSquare(s3, cons("NW", nil), solid("blue")), split(solid("blue"), s2, solid("yellow"), s2));
    assert.deepEqual(replaceSquare(s1, cons("NW", nil), s3), 
        split(s3, solid("orange"), solid("purple"), solid("white")));
    //Conditional branch: NE
    assert.deepEqual(replaceSquare(s2, cons("NE", nil), s5), split(s1, s5, solid("green"), s1));
    assert.deepEqual(replaceSquare(s4, cons("NE", nil), solid("red")), split(solid("green"), solid("red"), s2, solid("orange")));
    //Conditional branch: SW
    assert.deepEqual(replaceSquare(s1, cons("SW", nil), s2), split(solid("blue"), solid("orange"), s2, solid("white")));
    assert.deepEqual(replaceSquare(s5, cons("SW", nil), solid("yellow")), split(s3, s2, solid("yellow"), s2));
    //Conditional branch: SE
    assert.deepEqual(replaceSquare(s2, cons("SE", nil), s4), split(s1, solid("red"), solid("green"), s4));
    assert.deepEqual(replaceSquare(s5, cons("SE", nil), solid("white")), split(s3, s2, s3, solid("white")));

    //0-1-2+ heuristic: 2+ recursive calls
    //Conditional branch: NW-NW
    assert.deepEqual(replaceSquare(s5, cons("NW", cons("NW", nil)), solid("blue")), 
        split(split(solid("blue"), s2, solid("yellow"), s2), s2, s3, s2));
    assert.deepEqual(replaceSquare(s2, cons("NW", cons("NW", nil)), s4),
        split(split(s4, solid("orange"), solid("purple"), solid("white")), solid("red"), solid("green"), s1));
    //Conditional branch: Nw-NE
    assert.deepEqual(replaceSquare(s5, cons("NW", cons("NE", nil)), s1),
        split(split(solid("green"), s1, solid("yellow"), s2), s2, s3, s2));
    assert.deepEqual(replaceSquare(s2, cons("NW", cons("NE", nil)), solid("blue")),
        split(split(solid("blue"), solid("blue"), solid("purple"), solid("white")), solid("red"), solid("green"), s1));
    //Conditional branch: NW-SW
    assert.deepEqual(replaceSquare(s5, cons("NW", cons("SW", nil)), s2),
        split(split(solid("green"), s2, s2, s2), s2, s3, s2));
    assert.deepEqual(replaceSquare(s2, cons("NW", cons("SW", nil)), solid("green")),
        split(split(solid("blue"), solid("orange"), solid("green"), solid("white")), solid("red"), solid("green"), s1));
    //Conditional branch: NW-SE
    assert.deepEqual(replaceSquare(s5, cons("NW", cons("SE", nil)), solid("purple")),
        split(split(solid("green"), s2, solid("yellow"), solid("purple")), s2, s3, s2));
    assert.deepEqual(replaceSquare(s2, cons("NW", cons("SE", nil)), s3),
    split(split(solid("blue"), solid("orange"), solid("purple"), s3), solid("red"), solid("green"), s1));
    //Conditional branch: NE-NW
    assert.deepEqual(replaceSquare(s5, cons("NE", cons("NW", nil)), s2),
        split(s3, split(s2, solid("red"), solid("green"), s1), s3, s2));
    assert.deepEqual(replaceSquare(s3, cons("NE", cons("NW", nil)), solid("yellow")),
        split(solid("green"), split(solid("yellow"), solid("red"), solid("green"), s1), solid("yellow"), s2));
    //Conditional branch: NE-NE
    assert.deepEqual(replaceSquare(s5, cons("NE", cons("NE", nil)), solid("orange")),
        split(s3, split(s1, solid("orange"), solid("green"), s1), s3, s2));
    assert.deepEqual(replaceSquare(s3, cons("NE", cons("NE", nil)), s1),
        split(solid("green"), split(s1, s1, solid("green"), s1), solid("yellow"), s2));
    //Conditional branch: NE-SW
    assert.deepEqual(replaceSquare(s5, cons("NE", cons("SW", nil)), s3),
        split(s3, split(s1, solid("red"), s3, s1), s3, s2));
    assert.deepEqual(replaceSquare(s3, cons("NE", cons("SW", nil)), solid("white")),
        split(solid("green"), split(s1, solid("red"), solid("white"), s1), solid("yellow"), s2));
    //Conditional branch: NE-SE
    assert.deepEqual(replaceSquare(s5, cons("NE", cons("SE", nil)), solid("green")),
        split(s3, split(s1, solid("red"), solid("green"), solid("green")), s3, s2));
    assert.deepEqual(replaceSquare(s3, cons("NE", cons("SE", nil)), s4),
        split(solid("green"), split(s1, solid("red"), solid("green"), s4), solid("yellow"), s2));
    //Conditional branch: SW-NW
    assert.deepEqual(replaceSquare(s5, cons("SW", cons("NW", nil)), s1),
        split(s3, s2, split(s1, s2, solid("yellow"), s2), s2));
    assert.deepEqual(replaceSquare(s4, cons("SW", cons("NW", nil)), solid("blue")),
        split(solid("green"), solid("purple"), split(solid("blue"), solid("red"), solid("green"), s1), solid("orange")));
    //Conditional branch: SW-NE
    assert.deepEqual(replaceSquare(s5, cons("SW", cons("NE", nil)), s4),
        split(s3, s2, split(solid("green"), s4, solid("yellow"), s2), s2));
    assert.deepEqual(replaceSquare(s4, cons("SW", cons("NE", nil)), solid("white")),
        split(solid("green"), solid("purple"), split(s1, solid("white"), solid("green"), s1), solid("orange")));
    //Conditional branch: SW-SW
    assert.deepEqual(replaceSquare(s5, cons("SW", cons("SW", nil)), s3),
        split(s3, s2, split(solid("green"), s2, s3, s2), s2));
    assert.deepEqual(replaceSquare(s4, cons("SW", cons("SW", nil)), solid("red")),
        split(solid("green"), solid("purple"), split(s1, solid("red"), solid("red"), s1), solid("orange")));
    //Conditional branch: SW-SE
    assert.deepEqual(replaceSquare(s5, cons("SW", cons("SE", nil)), solid("yellow")),
        split(s3, s2, split(solid("green"), s2, solid("yellow"), solid("yellow")), s2));
    assert.deepEqual(replaceSquare(s4, cons("SW", cons("SE", nil)), s5),
        split(solid("green"), solid("purple"), split(s1, solid("red"), solid("green"), s5), solid("orange")));
    //Conditional branch: SE-NW
    assert.deepEqual(replaceSquare(s5, cons("SE", cons("NW", nil)), solid("orange")),
        split(s3, s2, s3, split(solid("orange"), solid("red"), solid("green"), s1)));
    assert.deepEqual(replaceSquare(s3, cons("SE", cons("NW", nil)), s4),
        split(solid("green"), s2, solid("yellow"), split(s4, solid("red"), solid("green"), s1)));
    //Conditional branch: SE-NE
    assert.deepEqual(replaceSquare(s2, cons("SE", cons("NE", nil)), s1),
        split(s1, solid("red"), solid("green"), split(solid("blue"), s1, solid("purple"), solid("white"))));
    assert.deepEqual(replaceSquare(s3, cons("SE", cons("NE", nil)), solid("purple")),
        split(solid("green"), s2, solid("yellow"), split(s1, solid("purple"), solid("green"), s1)));
    //Conditional branch: SE-SW
    assert.deepEqual(replaceSquare(s5, cons("SE", cons("SW", nil)), s3),
        split(s3, s2, s3, split(s1, solid("red"), s3, s1)));
    assert.deepEqual(replaceSquare(s3, cons("SE", cons("SW", nil)), solid("red")),
        split(solid("green"), s2, solid("yellow"), split(s1, solid("red"), solid("red"), s1)));
    //Conditional branch: SE-SE
    assert.deepEqual(replaceSquare(s2, cons("SE", cons("SE", nil)), s4),
        split(s1, solid("red"), solid("green"), split(solid("blue"), solid("orange"), solid("purple"), s4)));
    assert.deepEqual(replaceSquare(s3, cons("SE", cons("SE", nil)), s5),
        split(solid("green"), s2, solid("yellow"), split(s1, solid("red"), solid("green"), s5)));
  });
});
