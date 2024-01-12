import readline from 'node:readline/promises';
import puppeteer from 'puppeteer';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const urlString = await rl.question('Inserisci il collegamento alla pagina del concorso: ');

const browser = await puppeteer.launch({ headless: 'new' });

const page = await browser.newPage();
await page.goto(urlString);
await page.setViewport({ width: 1920, height: 1080 });

/**
 * @type [ { type: string; title: string; downloadUrl: string } ]
 */
const documents = [];

const collapsibles = await page.$$('#accordion .collapse');

for (const collapsible of collapsibles) {
  const labelledBy = await page.evaluate(e => e.getAttribute('aria-labelledby'), collapsible);

  const type = await page.$eval(`#${labelledBy}`, e => e.textContent.trim());

  const documentRows = await collapsible.$$('.row');

  for (const documentRow of documentRows) {
    const name = await documentRow.$eval(`.titolo_file > span`, e => e.textContent.trim());
    const downloadUrl = await documentRow.$eval(`.container_button_download > a`, e => e.href);

    documents.push({ type, name, downloadUrl });
  }
}

console.log(documents);

await browser.close();
rl.close();
