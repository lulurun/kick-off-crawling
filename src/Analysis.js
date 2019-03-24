/* eslint-disable no-console */
/* Example of the calculation

update(/a/b/)
update(/a/b/c/d/e)
update(/a/b/c/d/f)
update(/a/b/c)
update(/a/g)
update(/a/g/h/i)
update(/a/g/h/i/k/l)
update(/a/g/h/i/k)
update(/a/g/h/j)

=> calculate score for each element
 (using ACCUMULATED_PRIMES)

/a/b
  cnt = 4
  depth = *2*
  weight = (2 + 3) sum of first *2* primes
  score = cnt * weight               = 20
/a/b/c cnt=3 * weight=(2 + 3 + 5)    = 30
/a/b/c/d 2 * (2 + 3 + 5 + 7)         = 34
/a/b/c/d/e 1 * (2 + 3 + 5 + 7 + 11)  = 28
/a/b/c/d/f 1 * (2 + 3 + 5 + 7 + 11)  = 28
/a/g 5 * (2 + 3)                           = 25
/a/g/h 4 * (2 + 3 + 5)                     = 40
/a/g/h/i 3 * (2 + 3 + 5 + 7)               = 51
/a/g/h/i/k 2 * (2 + 3 + 5 + 7 + 11)        = 56
/a/g/h/i/k/l 1 * (2 + 3 + 5 + 7 + 11 + 13) = 41
/a/g/h/j 1 * (2 + 3 + 5 + 7)               = 17

*/
const WEIGHTS = {
  FIBONACCI: [
    1, 1, 2, 3, 5, 8,
    13, 21, 34, 55, 89,
    144, 233, 377, 610,
    987,
  ],
  ACCUMULATED_PRIMES: [
    2, 5, 10, 17, 28,
    41, 58, 77, 98, 121,
    150, 181, 218, 259, 306,
    359,
  ],
};

function getAttrClass($) {
  if (!$.attribs || !$.attribs.class) return '';
  return `.${$.attribs.class}`;
}

function getAttrId($) {
  if (!$.attribs || !$.attribs.id) return '';
  return `#${$.attribs.id}`;
}

function getPathStr($array) {
  return $array.map(el => `/${el.name}${getAttrClass(el)}`).join('');
}

function getDisplayStr($array) {
  return $array.map(el => `/${el.name}${getAttrId(el)}${getAttrClass(el)}`).join('');
}

class Analysis {
  constructor($, maxDepth = 15) {
    this.maxDepth = maxDepth;
    this.stack = [];
    this.histogram = {};
    this.build($);
  }

  update($array) {
    for (let i = 1; i <= $array.length; i += 1) {
      const $prefixArray = $array.slice(0, i);
      const str = getPathStr($prefixArray);
      if (!(str in this.histogram)) {
        this.histogram[str] = {
          cnt: 0,
          len: i,
          display: getDisplayStr($prefixArray),
          els: [],
        };
      }
      this.histogram[str].cnt += 1;

      if (i === $array.length) {
        this.histogram[str].els.push($array[$array.length - 1]);
      }
    }
  }

  build($, depth = 0) {
    this.update(this.stack);

    if (!$.children || $.children.length === 0) return;
    if (depth === this.maxDepth) return;
    $.children.forEach((x) => {
      if (x.type === 'text') return;
      this.stack.push(x);
      this.build(x, depth + 1);
      this.stack.pop();
    });
  }

  suggest(top = 10) {
    const results = Object.values(this.histogram).map(v => ({
      path: v.display,
      score: v.cnt * WEIGHTS.ACCUMULATED_PRIMES[v.len - 1],
      els: v.els,
    }));

    return results.sort((a, b) => {
      if (a.score < b.score) return 1;
      if (a.score > b.score) return -1;
      return 0;
    }).slice(0, top);
  }

  scrape(index = 0) {
    const results = this.suggest(index + 1);
    console.log(results);
    results[0].els.forEach((x) => {
      console.log(x);
    });
  }

  dump() {
    Object.keys(this.histogram).sort().forEach((k) => {
      const v = this.histogram[k];
      console.log(k, v);
    });
  }
}

module.exports = {
  Analysis,
};