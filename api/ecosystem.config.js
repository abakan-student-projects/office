module.exports = {
  apps : [{
    name: 'Office API',
    script: 'dist/api/src/server.js',

    // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
    //args: 'one two',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 5000,
      OFFICE_DATA_PATH: "/Users/ngrebenshikov/repositories/my/office/data",
      OFFICE_TOOLS_PATH: "/Users/ngrebenshikov/repositories/my/office/tools",
      OFFICE_JWT_SECRET: "office-sercret",
      OFFICE_DB_URL: "mariadb://office:office@localhost:3306/office"
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080,
      OFFICE_DATA_PATH: "/var/www/office/data",
      OFFICE_TOOLS_PATH: "/var/www/office/tools",
      OFFICE_JWT_SECRET: "office-sercret",
      OFFICE_DB_URL: "mariadb://office:office@10.133.232.27:3306/office"
    }
  }]
};
