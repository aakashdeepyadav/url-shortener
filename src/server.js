const { createApp } = require('./app');

const port = Number(process.env.PORT ?? '5000');
const host = process.env.HOST ?? '0.0.0.0';

const app = createApp();

app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`url-shortener listening on http://${host}:${port}`);
});
