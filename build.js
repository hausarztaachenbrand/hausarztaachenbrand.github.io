const Handlebars = require('handlebars');
const postcssConfig = require('./postcss.config.js');
const tailwindConfig = require('tailwindcss');
const compileCss = require('tailwindcss/lib/cli/compile.js').default;
const fs = require('fs');
const schema = require('./data/schema.json');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const hashFiles = require('hash-files');
const minify = require('html-minifier').minify;

async function css() {
  const plugins = tailwindConfig('./tailwind.config.js').plugins;
  plugins.push(...postcssConfig.plugins);
  const result = await compileCss({
    inputFile: './src/style.css',
    plugins,
  });
  return result.css;
}

const DAYS = {
  Mo: 'Montag',
  Tu: 'Dienstag',
  We: 'Mittwoch',
  Th: 'Donnerstag',
  Fr: 'Freitag',
  Sa: 'Samstag',
  Su: 'Sonntag',
};

async function getData() {
  const info = md.render(fs.readFileSync('./data/info.md', 'utf8'));
  fs.writeFileSync('./src/info.html', info);
  const about = md.render(fs.readFileSync('./data/about.md', 'utf8'));
  fs.writeFileSync('./src/about.html', about);
  const openingHours = schema.openingHours.map(([title, hours]) => {
    hours = hours.map(x => {
      let [days, hours] = x.split(' ', 2);
      if (days.includes(',')) {
        days = days.split(',').map(day => DAYS[day]);
        if (days.length > 2) {
          days = days.map(day => day.substr(0, 2));
        }
        days = days.join(', ');
      } else {
        days = days.split('-').map(day => DAYS[day]).join(' - ');
      }
      return {
        days,
        hours,
      };
    });
    return {
      hours,
      title,
    };
  });
  const data = {
    ...schema,
    openingHours,
    info,
    about,
    style: await css(),
  };
  schema.openingHours = schema.openingHours.map(([title, hours]) => {
    return hours;
  }).flat();
  schema.logo = schema.url + schema.contentUrl;
  schema.image = schema.url + schema.image;
  data.schema = JSON.stringify(schema);
  return data;
}

function compile(source, destination, data) {
  const html = fs.readFileSync(source, 'utf8');
  const template = Handlebars.compile(html);
  let result = template(data);
  result = minify(result, {
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    caseSensitive: true,
    decodeEntities: true,
    minifyCSS: true,
    removeComments: true,
    removeAttributeQuotes: true,
    quoteCharacter: '"',
    useShortDoctype: true,
    removeOptionalTags: true,
  });
  fs.writeFileSync(destination, result);
}

async function main() {
  const data = await getData();
  compile('./src/index.html', './public/index.html', data);
  if (!fs.existsSync('./public/impressum')) {
    fs.mkdirSync('./public/impressum');
  }
  compile('./src/impressum.html', './public/impressum/index.html', data);
  let files = fs.readdirSync('./public');
  files = files.filter(filename => filename !== 'manifest.appcache' && filename !== 'impressum');
  files.sort();
  const hash = hashFiles.sync({
    files: files.map(file => './public/' + file),
    noGlob: true,
  });
  const manifest = `CACHE MANIFEST\n# ${hash}\n` + files.join('\n');
  fs.writeFileSync('./public/manifest.appcache', manifest);
  console.log(new Date());
}

main();
