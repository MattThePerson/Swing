//functions that I "borrowed" from other people (hehe)



//javascript inheritance
function inherits(child, parent) {
  child.super_ = parent;
  child.prototype = Object.create(parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};