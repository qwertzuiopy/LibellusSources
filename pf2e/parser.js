let manifest = ["spells", "actions", "deities"];
// action-macros
// ancestries
// ancestryfeatures
// backgrounds
// boons-and-curses
// campaign-effects
// classes
// classfeatures
// conditions
// criticaldeck
// deities
// equipment
// equipment-effects
// fall-of-plaguestone
// familiar-abilities
// feat-effects
// feats
// gmg-srd
// hazards
// heritages
// iconics
// journals
// macros
// npc-gallery
// other-effects
// rollable-tables
// spell-effects
// vehicles

const fs = require('fs');

const parse_tag = (tag, string) => {
  return string.slice(string.indexOf("<" + tag + ">"), string.indexOf("</" + tag + ">")).replace("<" + tag + ">", "");
}
const parse_all_tags = (tag, string) => {
  let tags = [];
  while (string != "") {
    let i = string.slice(tag.length + 2, string.indexOf("</" + tag + ">"));
    tags.push(i);
    string = string.slice(string.indexOf("</" + tag + ">") + 5, string.length);
  }
  return tags;
}

const parse_table = (string) => {
  string = string.replaceAll("\n", "");
  let thead = parse_tag("thead", string);
  let tbody = parse_tag("tbody", string);
  let cells = parse_all_tags("tr", thead).map((i) => parse_all_tags("th", i)).concat(parse_all_tags("tr", tbody).map((i) => parse_all_tags("td", i)));
  return cells;
}

const parse_html_for_pango = (html) => {
  let data = [];
  let markup = html.replaceAll("<p>", "")
    .replaceAll("</p>", "")
    .replaceAll("<strong>", " <b>")
    .replaceAll("</strong>", "</b> ")
    .replaceAll("<h2>", " <b>")
    .replaceAll("</h2>", "</b> ")
    .replaceAll("<ul>", "")
    .replaceAll("</ul>\n", "")
    .replaceAll("</ul>", "")
    .replaceAll("<li>", "‣")
    .replaceAll("</li>", "")
    .replaceAll("<em>", "<i>")
    .replaceAll("</em>", "</i>")
    .replaceAll('<span class="action-glyph">', '<span background="purple">')
    .replaceAll("\n<hr />\n", "")
    .replaceAll("<hr />", "\n");
  // while (markup.includes("@UUID")) {
  //   markup = markup.slice(0, markup.indexOf("@UUID")) + markup.slice(markup.indexOf(": ", markup.indexOf("@UUID")), markup.indexOf("]")) + markup.slice(markup.indexOf("]") + 1, markup.length);
  // }
  if (markup.includes("<table")) {
    let before = markup.slice(0, markup.indexOf("<table")).split("\n");
    let table = markup.slice(markup.indexOf("<table"), markup.indexOf("</table>"));
    let after = markup.slice(markup.indexOf("</table>") + 9, markup.length).split("\n");
    table = table.replace('<table class="pf2e">', "");
    let cells = parse_table(table);
    for (let i in before) {
      data.push({
        type: "text",
        text: before[i],
      });
    }
    data.push({
      type: "table",
      cells: cells,
    });
    for (let i in after) {
      data.push({
        type: "text",
        text: after[i],
      });
    }
  } else {
    data = markup.split("\n");
    for (let i in data) {
      data[i] = {
        type: "text",
        text: data[i],
      };
    }
  }

  return data.filter((i) => {
    return i.text != "";
  })
}


let done = false;
for (let i in manifest) {
  console.log("starting manifest "+manifest[i]);
  fs.readdir("./packs/" + manifest[i], (err, files) => {
    console.log("read dir for "+manifest[i]);
    let data = {};
    if (err) {
      console.log(err);
      return;
    }
    files.forEach(file => {
      let path = "./packs/" + manifest[i] + "/" + file;
      let content = require(path);
      content.system.description.value = parse_html_for_pango(content.system.description.value);
      content.url = "Compendium.pf2e." + manifest[i] + ".Item." + content.name;
      // console.log(content._id + ":" + path);
      data[content.name.replace(" ", "-").toLowerCase()] = content;
    });
    fs.writeFile('./api_'+manifest[i]+'.json', JSON.stringify(data), (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("done for "+manifest[i]);
        console.log(Object.keys(data).length);
      }
    });
  });
}
