/**
 * Konfigurasi PM2 untuk menjalankan tiga instance backend.
 * Setiap instance memakai source code yang sama namun PORT dan INSTANCE_NAME
 * berbeda, sehingga load balancer (Nginx) dapat mendistribusikan request.
 */
module.exports = {
  apps: [
    {
      name: "app1",
      script: "./server.js",
      env: { PORT: 3001, INSTANCE_NAME: "app1" },
    },
    {
      name: "app2",
      script: "./server.js",
      env: { PORT: 3002, INSTANCE_NAME: "app2" },
    },
    {
      name: "app3",
      script: "./server.js",
      env: { PORT: 3003, INSTANCE_NAME: "app3" },
    },
  ],
};
