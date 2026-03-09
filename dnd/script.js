(async () => {

  function obj_to_str(obj) {
    if (typeof(obj) == "number") {
      return ""+obj;
    } else if (typeof(obj) == "string") {
      return "\""+obj.replaceAll("\"", "'")+"\"";
    } else if (Array.isArray(obj)) {
      res = "[";
      for (let i = 0; i < obj.length; i++) {
        res = res + obj_to_str(obj[i]);
        if (i < obj.length - 1) {
          res += ",";
        }
      }
      res += "]";
      return res;
    } else {
      res = "{";
      for (var key in obj) {
        if (res != "{") {
          res += ",";
        }
        res += key + ":" + obj_to_str(obj[key]);
      }
      res += "}";
      return res;
    }
  }


const score_to_modifier = (score) => {
  let table = {"1": "-5",
    "2": "-4", "3": "-4",
    "4": "-3", "5": "-3",
    "6": "-2", "7": "-2",
    "8": "-1", "9": "-1",
    "10": "0", "11": "0",
    "12": "+1", "13": "+1",
    "14": "+2", "15": "+2",
    "16": "+3", "17": "+3",
    "18": "+4", "19": "+4",
    "20": "+5", "21": "+5",
    "22": "+6", "23": "+6",
    "24": "+7", "25": "+7",
    "26": "+8", "27": "+8",
    "28": "+9", "29": "+9",
    "30": "+10"};
  return table[score];
}

  var dir = [];

  const fs = require('node:fs/promises');

  let spells = await fs.readFile('./src/5e-SRD-Spells.json', { encoding: 'utf8' });
  spells = JSON.parse(spells);
  for (let i = 0; i < spells.length; i++) {
    let item = spells[i];
    let index = {
      id: item.index,
      name: item.name,
      school: item.school.index,
      level: item.level,
      class: item.classes.map((i) => i.index),
      category: "spell",
    };
    dir.push(index);
    let page = {
      id: item.index,
      name: item.name,
      content: [],
    };
    page.content.push({id: "Title", content: item.name});
    let statgrid = [];
    statgrid.push({title: "Level", content: item.level.toString()});
    statgrid.push({title: "Casting Time", content: item.casting_time});
    if (item.area_of_effect) {
      statgrid.push({title: "Range", content: item.range+" ("+item.area_of_effect.size.toString()+"ft "+item.area_of_effect.type+")"});
    } else {
      statgrid.push({title: "Range", content: item.range});
    }
    statgrid.push({title: "Components", content: item.components.join(", ")});
    statgrid.push({title: "Duration", content: item.duration});
    statgrid.push({title: "School", content: item.school.name});
    if (item.attack_type) {
      statgrid.push({title: "Attack", content: item.attack_type});
    } else if (item.dc) {
      statgrid.push({title: "Save", content: item.dc.dc_type.name + " Save"});
    }
    if (item.damage && item.damage.damage_type) {
      statgrid.push({title: "Damage", content: item.damage.damage_type.name});
    }
    page.content.push({id: "StatGrid", content: statgrid});
    page.content.push({id: "Subtitle", content: "Effect"});
    page.content.push({id: "MultiText", content: item.desc});
    if (item.higher_level && item.higher_level.length > 0) {
      page.content.push({id: "Subtitle", content: "At higher levels"});
      page.content.push({id: "MultiText", content: item.higher_level});
    }
    if (item.damage && item.damage.damage_at_character_level) {
      page.content.push({
        id: "Table",
        content: [
          ["character level"].concat(Object.keys(item.damage.damage_at_character_level)),
          ["damage"].concat(Object.keys(item.damage.damage_at_character_level).map((i) => item.damage.damage_at_character_level[i]))
        ]
      });
    }
    if (item.damage && item.damage.damage_at_slot_level) {
      page.content.push({
        id: "Table",
        content: [
          ["slot level"].concat(Object.keys(item.damage.damage_at_slot_level)),
          ["damage"].concat(Object.keys(item.damage.damage_at_slot_level).map((i) => item.damage.damage_at_slot_level[i]))
        ]
      });
    }
    if (item.heal_at_slot_level) {
      page.content.push({
        id: "Table",
        content: [
          ["slot level"].concat(Object.keys(item.heal_at_slot_level)),
          ["heal"].concat(Object.keys(item.heal_at_slot_level).map((i) => item.heal_at_slot_level[i]))
        ]
      });
    }
    await fs.writeFile("./dst/data/"+item.index, obj_to_str(page));
  }

  let monsters = await fs.readFile('./src/5e-SRD-Monsters.json', { encoding: 'utf8' });
  monsters = JSON.parse(monsters);
  for (let i = 0; i < monsters.length; i++) {
    let item = monsters[i];
    let index = {
      id: item.index,
      name: item.name,
    }
    dir.push(index);
    let page = {
      id: item.index,
      name: item.name,
      content: [],
    };
    page.content.push({id: "Title", content: item.name});
    page.content.push({id: "Image", url: "https://www.dnd5eapi.co"+item.image});
    let statgrid = [];
    statgrid.push({title: "Strength", content: item.strength.toString()+" / "+score_to_modifier(item.strength.toString())})
    statgrid.push({title: "Dexterity", content: item.dexterity.toString()+" / "+score_to_modifier(item.dexterity.toString())})
    statgrid.push({title: "Constitution", content: item.constitution.toString()+" / "+score_to_modifier(item.constitution.toString())})
    statgrid.push({title: "Intelligence", content: item.intelligence.toString()+" / "+score_to_modifier(item.intelligence.toString())})
    statgrid.push({title: "Wisdom", content: item.wisdom.toString()+" / "+score_to_modifier(item.wisdom.toString())})
    statgrid.push({title: "Charisma", content: item.charisma.toString()+" / "+score_to_modifier(item.charisma.toString())})
    statgrid.push({title: "Alignment", content: item.alignment})
    statgrid.push({title: "Armor Class", content: item.armor_class[0].value.toString()});
    if (item.hit_dice) {
      statgrid.push({title: "Hit Dice", content: item.hit_dice.toString()});
    }
    statgrid.push({title: "Type", content: item.type});
    if (item.subtype) {
      statgrid.push({title: "Subtype", content: item.subtype});
    }
    statgrid.push({title: "Challenge Rating", content: item.challenge_rating.toString()});
    statgrid.push({title: "Size", content: item.size});
    statgrid.push({title: "Hit Points", content: item.hit_points.toString() + " / "+item.hit_points_roll});
    page.content.push({id: "StatGrid", content: statgrid});

    let statrows = [];
    let s = [];
    if (item.speed.walk) s.push(item.speed.walk +" walk");
    if (item.speed.swim) s.push(item.speed.swim+" swim");
    if (item.speed.fly) s.push(item.speed.fly+" fly");
    if (item.speed.burrow) s.push(item.speed.burrow+" burrow");
    if (item.speed.climb) s.push(item.speed.climb+" climb");
    statrows.push({title: "Speed", content: s});
    statrows.push({title: "Languages", content: item.languages.split(",")});
    s = [];
    if (item.senses.blindsight  != undefined) s.push("blindsight "+item.senses.blindsight);
    if (item.senses.darkvision  != undefined) s.push("darkvision"+item.senses.darkvision);
    if (item.senses.tremorsense != undefined) s.push("tremorsense"+item.senses.tremorsense);
    if (item.senses.truesight   != undefined) s.push("truesight"+item.senses.truesight);
    statrows.push({title: "Senses", content: s});
    statrows.push({title: "Saving Throws", content: item.proficiencies.filter((i) => {
      return i.proficiency.name.includes("Saving Throw");
    }).map((i) => {
      return "+"
        + i.value.toString() + " "
        + i.proficiency.index.slice(i.proficiency.index.lastIndexOf("-") + 1, i.proficiency.index.length)
    })});
    statrows.push({title: "Skills", content: item.proficiencies.filter((i) => {
      return i.proficiency.name.includes("Skill");
    }).map((i) => {
      return "+"
        + i.value.toString() + " "
        + i.proficiency.index.slice(i.proficiency.index.lastIndexOf("-") + 1, i.proficiency.index.length)
    })});
    page.content.push({id: "StatList", content: statrows});

    if (item.desc) {
      page.content.push({id: "MultiText", content: [item.desc.replaceAll("**", "")]});
    }

    if (item.special_abilities && item.special_abilities.length > 0) {
      page.content.push({id: "Subtitle", content: "Abilities"});
      page.content.push({id: "TitledText", content: item.special_abilities.map((i) => { return {title: i.name, content: i.desc}})});
    }
    if (item.actions && item.actions.length > 0) {
      page.content.push({id: "Subtitle", content: "Actions"});
      page.content.push({id: "TitledText", content: item.actions.map((i) => { return {title: i.name, content: i.desc}})});
    }
    if (item.legendary_actions && item.legendary_actions.length > 0) {
      page.content.push({id: "Subtitle", content: "Legendary Actions"});
      page.content.push({id: "TitledText", content: item.legendary_actions.map((i) => { return {title: i.name, content: i.desc}})});
    }

    await fs.writeFile("./dst/data/"+item.index, obj_to_str(page));
  }

  await fs.writeFile("./dst/dir", obj_to_str(dir));

})();
