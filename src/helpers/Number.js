
const parseInt = (input, biggerZero = false) => {
    try {
        const parse = Number(input);
      if (isNaN(parse)) {
        return false;
      }else {
        if (!!biggerZero) {
          if (parse <= 0) {
            return false;
          }else {
            return parse;
          }
        }else {
          return parse;
        }
      }
    }catch(e) {
        return false;
    }
}

module.exports = {
    parseInt
}