  module.exports = () => {
    const MIN = 1000;
    const MAX = 9999;
    const num = Math.floor(Math.random() * ((MAX + 1) - MIN)) + MIN;
    return `${num}`;
  };
  