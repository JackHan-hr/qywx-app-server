const Store = {
  save: function(key, value) {
    this[key] = value;
  },

  read: function(key) {
    return this[key] || '';
  }
};

module.exports = Store;
