// These are important and needed before anything else
import * as express from 'express';
import { join } from 'path';
import 'reflect-metadata';
import 'zone.js/dist/zone-node';

// spike todo remove:
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Express server
const app = express();

const PORT = process.env.PORT || 4200;
const DIST_FOLDER = join(process.cwd(), 'dist/storefrontapp');

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {
  AppServerModuleNgFactory,

  ngExpressEngine,
  OccBaseSitesConfig,
  getOccBaseUrlFromMetaTagSSR,
  fetchOccBaseSitesConfigSSR,
} = require('../../dist/storefrontapp-server/main');

const fs = require('fs');
const https = require('https');

const occBaseUrl = getOccBaseUrlFromMetaTagSSR(
  fs.readFileSync(join(DIST_FOLDER, 'index.html')).toString()
);

app.engine(
  'html',
  ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
  })
);

app.set('view engine', 'html');
app.set('views', DIST_FOLDER);

// Server static files from /browser
app.get('*.*', express.static(DIST_FOLDER));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  fetchOccBaseSitesConfigSSR(
    { baseUrl: occBaseUrl },
    req.protocol + '://' + req.get('host') + req.originalUrl,
    https
  ).then(config => {
    res.render('index', {
      req,
      providers: [{ provide: OccBaseSitesConfig, useValue: config }],
    });
  });
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});
