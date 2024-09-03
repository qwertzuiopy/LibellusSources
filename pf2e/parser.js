let manifest = ["spells"];
let data = {};

const fs = require('fs');

const parse_html_for_pango = (html) => {
  let markup = html.replaceAll("<p>", "")
    .replaceAll("</p>", "")
    .replaceAll("<strong>", " <b>")
    .replaceAll("</strong>", "</b> ")
    .replaceAll("<ul>", "")
    .replaceAll("</ul>\n", "")
    .replaceAll("<li>", "‣")
    .replaceAll("</li>", "")
    .replaceAll("<em>", "<i>")
    .replaceAll("</em>", "</i>")
    .replaceAll('<span class="action-glyph">', '<span background="purple">')
    .replaceAll("\n<hr />\n", "")
    .replaceAll("<hr />", "\n");
  let data = markup.split("\n");
  for (let i in data) {
    data[i] = {
      type: "text",
      text: data[i],
    };
  }
  return data;
}

for (let i in manifest) {
  data[manifest[i]] = {};
  fs.readdir("./packs/" + manifest[i], (err, files) => {
    if (err) {
      console.log(err);
      return;
    }
    files.forEach(file => {
      let path = "./packs/" + manifest[i] + "/" + file;
      let content = require(path);
      content.system.description.value = parse_html_for_pango(content.system.description.value);
      content.url = "Compendium.pf2e." + manifest[i] + ".Item." + content.name;
      console.log(content._id + ":" + path);
      data[manifest[i]][content.name.replace(" ", "-").toLowerCase()] = content;
    });

    fs.writeFile('./api_pf2e.js', "export const API = " + JSON.stringify(data), err => {
      if (err) {
        console.error(err);
      } else {
        console.log("done");
      }
    });
  });
}




