module.exports = {
  name: "Chalmers Course Stats",
  script: "./server.js",
  log_file: "./node.log",
  time: true,
  env: {
    NODE_ENV: "production",
    PORT: "3001"
  }
}