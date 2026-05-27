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

  let folders = await fs.readdir('./src');
  let api = [];
  for (let i = 0; i < folders.length; i++) {
    api = api.concat(JSON.parse(await fs.readFile("./src/"+folders[i])));

  }
  async function get_sync(url) {
    index = url.split("/")[url.split("/").length-1];
    if (url.split("/")[4]) { // catches urls of type "/api/classes/levels" which need to go to API["levels"]
      section = JSON.parse(await fs.readFile("./src/5e-SRD-Levels.json"));
      return Object.values(section).filter((i) => i.url.includes(url));
    }
    for (let i = 0; i < api.length; i++) {
      if (api[i].index == index) {
        return api[i];
      }
    }
  }
  function utoi(url) {
    return url.split("/").join("-").substring(1);
  }

  let proficiencies = await fs.readFile('./src/5e-SRD-Proficiencies.json', { encoding: 'utf8' });
  proficiencies = JSON.parse(proficiencies);
  let proficiency_lookup = proficiencies.map((i) => {return {index: i.index, next: utoi(i.reference.url)}; });

  let spells = await fs.readFile('./src/5e-SRD-Spells.json', { encoding: 'utf8' });
  spells = JSON.parse(spells);
  for (let i = 0; i < spells.length; i++) {
    let item = spells[i];
    let index = {
      id: utoi(item.url),
      name: item.name,
      school: utoi(item.school.url),
      level: item.level,
      class: item.classes.map((i) => utoi(i.url)),
      category: "spell",
    };
    dir.push(index);
    let page = {
      id: utoi(item.url),
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
    await fs.writeFile("./dst/data/"+utoi(item.url), obj_to_str(page));
  }

  let monsters = await fs.readFile('./src/5e-SRD-Monsters.json', { encoding: 'utf8' });
  monsters = JSON.parse(monsters);
  for (let i = 0; i < monsters.length; i++) {
    let item = monsters[i];
    let index = {
      id: utoi(item.url),
      name: item.name,
      category: "monster",
      cr: item.challenge_rating,
    }
    dir.push(index);
    let page = {
      id: utoi(item.url),
      name: item.name,
      category: "monster",
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

    await fs.writeFile("./dst/data/"+utoi(item.url), obj_to_str(page));
  }

  let traits = await fs.readFile('./src/5e-SRD-Traits.json', { encoding: 'utf8' });
  traits = JSON.parse(traits);
  for (let i = 0; i < traits.length; i++) {
    let item = traits[i];
    let index = {
      id: utoi(item.url),
      name: item.name,
      category: "trait",
    }
    dir.push(index);
    let page = {
      id: utoi(item.url),
      name: item.name,
      content: [],
    };
    page.content.push({id: "Title", content: item.name});
    page.content.push({id: "MultiText", content: item.desc});
    let statrows = [];
    if (item.proficiency_choices) {
      let s = "Choose " + item.proficiency_choices.choose + ":";
      let arr = item.proficiency_choices.from.options.map((i) => {
        return "@"+proficiency_lookup.find((j) => j.index == i.item.index).next;
      });
      statrows.push({title: s, content: arr});
    }
    if (item.proficiencies && item.proficiencies.length > 0) {
      statrows.push({title: "Proficiencies", content: item.proficiencies.filter((i) => {
        return !i.url.includes("saving-throw")
      }).map((i) => {
        return "@"+proficiency_lookup.find((j) => j.index == i.index).next;
      })});
    }
    if (item.trait_specific) {
      if (item.trait_specific) {
        statrows.push({title: "TODO trait specific", content: []});
      } else if (item.trait_specific.subtrait_options) {
        statrows.push({
          title: "choose " + item.trait_specific.subtrait_options.choose,
          content: item.trait_specific.subtrait_options.from.options.map((i) => {
            return "@"+utoi(i.item.url);
          })});
      } else if (item.trait_specific.spell_options) {
        statrows.push({
          title: "choose " + item.trait_specific.spell_options.choose,
          content: item.trait_specific.spell_options.from.options.map((i) => {
            return "@"+utoi(i.item.url);
          }),
        });
      } else {
        if (item.trait_scpecific.desc == undefined) {
          console.log(item);
          return;
        }
        page.content.push({id: "MultiText", content: [item.trait_scpecific.desc]});
      }
    }
    if (statrows.length > 0) {
      page.content.push({id: "StatList", content: statrows});
    }
    await fs.writeFile("./dst/data/"+utoi(item.url), obj_to_str(page));
  }

  let equipment = await fs.readFile('./src/5e-SRD-Equipment.json', { encoding: 'utf8' });
  equipment = JSON.parse(equipment );

  let magic_items = await fs.readFile('./src/5e-SRD-Magic-Items.json', { encoding: 'utf8' });
  magic_items = JSON.parse(magic_items);
  equipment = equipment.concat(magic_items);
  for (let i = 0; i < equipment.length; i++) {
    let item = equipment[i];
    let index = {
      id: utoi(item.url),
      name: item.name,
      category: "equipment",
      equipment_category: [],
    }
    if (item.properties) {
      index.properties = item.properties.map((i) => i.index);
    }
    if (item.equipment_category) index.equipment_category.push(item.equipment_category.index);
    if (item.gear_category) index.equipment_category.push(item.gear_category.index);
    if (item.vehicle_category) index.equipment_category.push(item.vehicle_category.replaceAll(",", "").replaceAll(" ", "-").replaceAll("'", "").toLowerCase());
    if (item.tool_category) index.equipment_category.push(item.tool_category.replaceAll(",", "").replaceAll(" ", "-").replaceAll("'", "").toLowerCase());
    if (item.armor_category) index.equipment_category.push(item.armor_category.replaceAll(",", "").replaceAll(" ", "-").replaceAll("'", "").toLowerCase());
    if (item.weapon_category) {
      index.equipment_category.push("weapon");
      if (item.weapon_category)index.equipment_category.push(item.weapon_category.replaceAll(",", "").replaceAll(" ", "-").replaceAll("'", "").toLowerCase()); 
      if (item.weapon_range)index.equipment_category.push(item.weapon_range.replaceAll(",", "").replaceAll(" ", "-").replaceAll("'", "").toLowerCase()); 
      if (item.category_range)index.equipment_category.push(item.category_range.replaceAll(",", "").replaceAll(" ", "-").replaceAll("'", "").toLowerCase()); 
    }

    dir.push(index);
    let page = {
      id: utoi(item.url),
      name: item.name,
      content: [],
    };
    page.content.push({id: "Title", content: item.name});

    if (item.image) {
      page.content.push({id: "Image", url: "https://www.dnd5eapi.co"+item.image});
    }

    let statgrid = [];
    if (item.equipment_category) {
      statgrid.push({title: "Category", content: item.equipment_category.name});
    }
    if (item.cost) {
      if (!item.quantity) {
        statgrid.push({title: "Cost", content: item.cost.quantity.toString() + item.cost.unit});
      } else {
      statgrid.push({title: "Cost", content: item.cost.quantity.toString()
        + item.cost.unit
        + " per "
        + item.quantity.toString()});
      }
    }
    if (item.rarity) {
      statgrid.push({title: "Rarity", content: item.rarity.name});
    }
    if (item.weight) {
      if (!item.quantity) {
        statgrid.push({title: "Weight", content: item.weight.toString() + "lb"});
      } else {
        statgrid.push({title: "Weight", content: item.weight.toString()
          + "lb per "
          + item.quantity.toString()});
      }
    }

    if (item.gear_category) statgrid.push({ title: "Type", content: item.gear_category.name});
    else if (item.vehicle_category) statgrid.push({title: "Type", content: item.vehicle_category});
    else if (item.tool_category) statgrid.push({title: "Type", content: item.tool_category});
    else if (item.weapon_category) statgrid.push({title: "Type", content: item.weapon_category});
    else if (item.armor_category) statgrid.push({title: "Type", content: item.armor_category});
    if (item.weapon_range) {
      statgrid.push({title: "Range", content: item.weapon_range});
    }
    if (item.armor_class) {
      statgrid.push({title: "Armor Class", content: item.armor_class.base.toString()
      + (item.armor_class.dex_bonus ? " + Dex"
        + (item.armor_class.max_bonus ? " (max "
          + item.armor_class.max_bonus.toString()
          + ")" : "") : "")})
    }
    if (item.str_minimum !== undefined && item.str_minimum != 0) {
      statgrid.push({title: "Strength", content: "min "+item.str_minimum.toString()});
    }
    if (statgrid.length > 0) {
      page.content.push({id: "StatGrid", content: statgrid});
    }

    let statlist = [];
    if (item.range) {
      if (item.range.long) {
        statlist.push({title: "Range", content: [item.range.normal.toString() +"ft normal", item.range.long.toString()+"ft long"]});
      } else {
        statlist.push({title: "Range", content: [item.range.normal.toString() +"ft"]});
      }
    }
    if (item.damage) {
      statlist.push({title: "Damage", content: [item.damage.damage_dice+" "+item.damage.damage_type.name]});
    }
    if (item.properties) {
      statlist.push({title: "Properties", content: item.properties.map((i) => i.name)});
    }
    if (item.stealth_disadvantage !== undefined && item.stealth_disadvantage != 0) {
      statlist.push({title: "Stealth", content: "disadvantage"});
    }
    if (statlist.length > 0) {
      page.content.push({id: "StatList", content: statlist});
    }

    if (item.desc && item.desc.length > 0) {
      page.content.push({id: "MultiText", content: item.desc});
    }

    if (item.contents && item.contents.length > 0) {
      page.content.push({id: "Subtitle", content: "Contents"});
      page.content.push({
        id: "LinkList",
        content: item.contents.map((i) =>
        { return {
          id: "@"+utoi(i.item.url),
          content: i.quantity == 1 ? "once" : (i.quantity.toString()+" times"),
        } })});
    }

    if (item.variants && item.variants.length > 0) {
      page.content.push({id: "Subtitle", content: "Variants"});
      page.content.push({
        id: "LinkList",
        content: item.variants.map((i) =>
        { return {
          id: "@"+utoi(i.url),
          content: "",
        } })});
    }

    await fs.writeFile("./dst/data/"+utoi(item.url), obj_to_str(page));
  }

  let skills = await fs.readFile('./src/5e-SRD-Skills.json', { encoding: 'utf8' });
  skills = JSON.parse(skills);
  for (let i = 0; i < skills.length; i++) {
    let item = skills[i];
    let index = {
      id: utoi(item.url),
      name: item.name,
      category: "skill",
    }
    dir.push(index);
    let page = {
      id: utoi(item.url),
      name: item.name,
      content: [],
    };
    page.content.push({id: "Title", content: item.name});
    let statgrid = [];
    if (item.ability_score != undefined) {
      statgrid.push({title: "Ability", content: "@"+utoi(item.ability_score.url)});
    }
    if (statgrid.length > 0) {
      page.content.push({id: "StatGrid", content: statgrid});
    }
    page.content.push({id: "MultiText", content: item.desc});

    await fs.writeFile("./dst/data/"+utoi(item.url), obj_to_str(page));
  }

  let abilities = await fs.readFile('./src/5e-SRD-Ability-Scores.json', { encoding: 'utf8' });
  abilities = JSON.parse(abilities);
  for (let i = 0; i < abilities.length; i++) {
    let item = abilities[i];
    let index = {
      id: utoi(item.url),
      name: item.full_name,
      category: "ability",
    }
    dir.push(index);
    let page = {
      id: utoi(item.url),
      name: item.full_name,
      content: [],
    };
    page.content.push({id: "Title", content: item.full_name});
    page.content.push({id: "MultiText", content: item.desc});
    page.content.push({id: "LinkList", content: item.skills.map((i) => {
      return {id: "@"+utoi(i.url), content: ""};
    })});

    await fs.writeFile("./dst/data/"+utoi(item.url), obj_to_str(page));
  }
  let features = await fs.readFile('./src/5e-SRD-Features.json', { encoding: 'utf8' });
  features = JSON.parse(features);
  for (let i = 0; i < features.length; i++) {
    let item = features[i];
    let index = {
      id: utoi(item.url),
      name: item.name,
      category: "fearure",
    }
    dir.push(index);
    let page = {
      id: utoi(item.url),
      name: item.name,
      content: [],
    };
    page.content.push({id: "Title", content: item.name});

    let statgrid = [];
    statgrid.push({title: "Level", content: ""+item.level});
    if (statgrid.length > 0) {
      page.content.push({id: "StatGrid", content: statgrid});
    }
    page.content.push({id: "MultiText", content: item.desc});
    let arr = [{id: "@"+utoi(item.class.url), content: ""}];
    if (item.subclass) {
      arr.push({id: "@"+utoi(item.subclass.url), content: ""});
    }
    page.content.push({id: "LinkList", content: arr});

    await fs.writeFile("./dst/data/"+utoi(item.url), obj_to_str(page));
  }
  let classes = await fs.readFile('./src/5e-SRD-Classes.json', { encoding: 'utf8' });
  classes = JSON.parse(classes);
  for (let i = 0; i < classes.length; i++) {
    let item = classes[i];
    let index = {
      id: utoi(item.url),
      name: item.name,
      category: "class",
    }
    dir.push(index);
    let page = {
      id: utoi(item.url),
      name: item.name,
      content: [],
    };
    page.content.push({id: "Title", content: item.name});

    let statgrid = [];
    statgrid.push({title: "Hit die", content: "d"+item.hit_die+" ("+Math.ceil(item.hit_die/2+0.5)+")"});
    statgrid.push({title: "HP at Level 1", content: "Constitution + "+item.hit_die});
    if (item.spellcasting) {
      statgrid.push({title: "Spellcasting", content: "@"+utoi(item.spellcasting.spellcasting_ability.url)});
    } else {
      statgrid.push({title: "Spellcasting", content: "None"});
    }
    page.content.push({id: "StatGrid", content: statgrid});

    let statrows = [];
    for (let i in item.proficiency_choices) {
      let choice = item.proficiency_choices[i];
      if (!choice.from.options[0].item) {
        statrows.push({title: choice.desc, content: []});
      } else {
        let s = "Choose " + choice.choose + ":";
        let arr = choice.from.options.map((i) => {
          return "@"+proficiency_lookup.find((j) => j.index == i.item.index).next;
        });
        statrows.push({title: s, content: arr});
      }
    }
    statrows.push({title: "Proficiencies", content: item.proficiencies.filter((i) => {
      return !i.url.includes("saving-throw")
    }).map((i) => {
      return "@"+proficiency_lookup.find((j) => j.index == i.index).next;
    })});
    statrows.push({title: "Saving Throws", content: item.saving_throws.map((i)=>"@"+utoi(i.url))});
    page.content.push({id: "StatList", content: statrows});

    if (item.spellcasting) {
      page.content.push({id: "Subtitle", content: "Spellcasting"});
      let arr = item.spellcasting.info.map((i) => {
        return "***" + i.name + ".***" + i.desc.join("\n");
      });
      page.content.push({id: "MultiText", content: arr});
    }

    page.content.push({id: "Subtitle", content: "Starting Equipment"});
    if (item.starting_equipment.length > 0) {
      page.content.push({id: "LinkList", content: item.starting_equipment.map((i) => {
        return {
          id: "@"+utoi(i.equipment.url),
          content: i.quantity > 1 ? i.quantity.toString() + "times" : "once"
        };
      })})
    }
    page.content.push({
      id: "MultiText",
      content: item.starting_equipment_options.map((i) => i.desc)
    });

    page.content.push({id: "Subtitle", content: "Subclasses"});
    page.content.push({id: "LinkList", content: 
      item.subclasses.map((i) => {
        return {
          id: "@"+utoi(i.url),
          content: "",
        };
      })
    });

    let level_data = await get_sync(item.class_levels);
    level_data.sort((a, b) => { return a.level - b.level; });
    let cycle = {id: "Cycle", max: 20, title: "Stats on Level", content: []}
    for (let i = 1; i <= 20; i++) {
      let d = level_data[i-1];
      let level_content = [];
      let level_cards = [];
      if (d.spellcasting) {
        let t = [["Slot Level"], ["Spell Slots"]];
        for (let j = 1; j < 10; j++) {
          t[0].push(""+j);
          t[1].push(""+d.spellcasting["spell_slots_level_"+j]);
        }
        level_content.push({id: "Table", content: t});
      }
      if (d.prof_bonus) level_cards.push({title: "Proficiency Bonus", content: "+"+d.prof_bonus});
      if (d.spellcasting && d.spellcasting.spells_known) level_cards.push({title: "Spells Known", content: ""+d.spellcasting.spells_known});
      if (d.spellcasting && d.spellcasting.cantrips_known) level_cards.push({title: "Cantrips Known", content: ""+d.spellcasting.cantrips_known});

      let c = d.class_specific;
      for (let j in c) {
        if (i == "creating_spell_slots") {
          continue;
        }
        if (typeof c[j] == "object") {
          for (let k in c[j]) {
            level_cards.push({title:
              j.split("_")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
                + ": " + k.split("_")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
              content: ""+c[j][k],
            });
          }
        } else {
          level_cards.push({title: j.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "), content: c[j].toString()});
        }
      }
      level_content.push({id: "StatGrid", content: level_cards});

      if (c.creating_spell_slots && c.creating_spell_slots.length > 0) {
        level_content.push({id: "Title", content: "Flexible Casting"});
        let data = [["Slot Level"], ["Point Cost"]];
        for (let j in c.creating_spell_slots) {
          data[0].push(c.creating_spell_slots[j].spell_slot_level);
          data[1].push(c.creating_spell_slots[j].sorcery_point_cost);
        }
        level_content.push({id: "Table", content: data});
      }
      cycle.content.push(level_content);
    }
    page.content.push(cycle);

    let levels = [];
    for (let i = 1; i <= 20; i++) {
      levels.push({title: i+".", content:
        (await get_sync(item.index +"-"+i)).features.map((i) => "@"+utoi(i.url))});
    }
    page.content.push({
      id: "StatList", content: levels 
    });


    await fs.writeFile("./dst/data/"+utoi(item.url), obj_to_str(page));
  }

  let subclasses = await fs.readFile('./src/5e-SRD-Subclasses.json', { encoding: 'utf8' });
  subclasses = JSON.parse(subclasses);
  for (let i = 0; i < subclasses.length; i++) {
    let item = subclasses[i];
    let index = {
      id: utoi(item.url),
      name: item.name,
      category: "skill",
    }
    dir.push(index);
    let page = {
      id: utoi(item.url),
      name: item.name,
      content: [],
    };
    page.content.push({id: "Title", content: item.name});
    page.content.push({id: "MultiText", content: item.desc});
    
    let level_data = await get_sync(item.subclass_levels);
    level_data.sort((a, b) => { return a.level - b.level; });

    page.content.push({id: "Subtitle", content: "Features"});
    let levels = [];
    for (let i in level_data) {
      levels.push({
        title: level_data[i].level+".",
        content: level_data[i].features.map((f) => {
          return "@"+utoi(f.url)
        }),
      });
    }
    page.content.push({
      id: "StatList", content: levels 
    });

    if (item.spells) {
      page.content.push({id: "LinkList", content: item.spells.map((i) => {
        return {
          id: utoi(i.spell.url),
          content: "level " + i.prerequisites.map((j) => {
            return j.name.slice(-2);
          }).join(" "),
        }
      })});
    }

    await fs.writeFile("./dst/data/"+utoi(item.url), obj_to_str(page));
  }

  let races = await fs.readFile('./src/5e-SRD-Races.json', { encoding: 'utf8' });
  races = JSON.parse(races);
  for (let i = 0; i < races.length; i++) {
    let item = races[i];
    let index = {
      id: utoi(item.url),
      name: item.name,
      category: "race",
    }
    dir.push(index);
    let page = {
      id: utoi(item.url),
      name: item.name,
      content: [],
    };
    page.content.push({id: "Title", content: item.name});
    let statgrid = [];
    statgrid.push({title: "Speed", content: item.speed+"ft"});
    statgrid.push({title: "Size", content: item.size});
    page.content.push({id: "StatGrid", content: statgrid});
    page.content.push({id: "MultiText", content: ["***Age.***"+item.age, "***Alignment.***"+item.alignment, "***Languages.***"+item.language_desc, "***Size.***"+item.size_description]});

    let statrows = [];
    for (let i in item.starting_proficiency_choices) {
      let choice = item.starting_proficiency_choices[i];
      if (!choice.from.options[0].item) {
        statrows.push({title: choice.desc, content: []});
      } else {
        let s = "Choose " + choice.choose + ":";
        let arr = choice.from.options.map((i) => {
          return "@"+proficiency_lookup.find((j) => j.index == i.item.index).next;
        });
        statrows.push({title: s, content: arr});
      }
    }
    if (item.starting_proficiencies) {
      statrows.push({title: "Proficiencies", content: item.starting_proficiencies.filter((i) => {
        return !i.url.includes("saving-throw")
      }).map((i) => {
        return "@"+proficiency_lookup.find((j) => j.index == i.index).next;
      })});
    }
    statrows.push({title: "Ability bonuses", content: item.ability_bonuses.map((i) => {
      return "+"+i.bonus+" "+i.ability_score.name;
    })});
    statrows.push({title: "Languages", content: item.languages.map((i) => i.name)});
    page.content.push({id: "StatList", content: statrows});

    page.content.push({id: "Subtitle", content: "Traits"});
    page.content.push({id: "LinkList", content: item.traits.map((i) => {
      return {
        id: "@"+utoi(i.url),
        content: "",
      };
    })});
    page.content.push({id: "Subtitle", content: "Subraces"});
    page.content.push({id: "LinkList", content: item.subraces.map((i) => {
      return {
        id: "@"+utoi(i.url),
        content: "",
      };
    })});

    await fs.writeFile("./dst/data/"+utoi(item.url), obj_to_str(page));
  }
  let subraces = await fs.readFile('./src/5e-SRD-Subraces.json', { encoding: 'utf8' });
  subraces = JSON.parse(subraces);
  for (let i = 0; i < subraces.length; i++) {
    let item = subraces[i];
    let index = {
      id: utoi(item.url),
      name: item.name,
      category: "subrace",
    }
    dir.push(index);
    let page = {
      id: utoi(item.url),
      name: item.name,
      content: [],
    };
    page.content.push({id: "Title", content: item.name});
    let statgrid = [];
    statgrid.push({title: "Race", content: "@"+utoi(item.race.url)});
    page.content.push({id: "StatGrid", content: statgrid});
    page.content.push({id: "MultiText", content: [item.desc]});

    let statrows = [];
    if (item.starting_proficiencies) {
      statrows.push({title: "Proficiencies", content: item.starting_proficiencies.filter((i) => {
        return !i.url.includes("saving-throw")
      }).map((i) => {
        return "@"+proficiency_lookup.find((j) => j.index == i.index).next;
      })});
    }
    statrows.push({title: "Ability bonuses", content: item.ability_bonuses.map((i) => {
      return "+"+i.bonus+" "+i.ability_score.name;
    })});
    if (item.languages) {
      statrows.push({title: "Languages", content: item.languages.map((i) => i.name)});
    }
    page.content.push({id: "StatList", content: statrows});

    if (item.traits) {
      page.content.push({id: "Subtitle", content: "Traits"});
      page.content.push({id: "LinkList", content: item.traits.map((i) => {
        return {
          id: "@"+utoi(i.url),
          content: "",
        };
      })});
    }
    await fs.writeFile("./dst/data/"+utoi(item.url), obj_to_str(page));
  }

  let equipment_categories = await fs.readFile('./src/5e-SRD-Equipment-Categories.json', { encoding: 'utf8' });
  equipment_categories = JSON.parse(equipment_categories);
  for (let i = 0; i < equipment_categories.length; i++) {
    let item = equipment_categories[i];
    let index = {
      id: utoi(item.url),
      name: item.name,
      category: "equipment category",
    }
    dir.push(index);
    let page = {
      id: utoi(item.url),
      name: item.name,
      content: [],
    };
    page.content.push({id: "Title", content: item.name});
    page.content.push({id: "LinkList", content: item.equipment.map((i) => {
      return {
        id: "@"+utoi(i.url),
        content: "",
      };
    })})

    await fs.writeFile("./dst/data/"+utoi(item.url), obj_to_str(page));
  }


  console.log(dir.length);

  await fs.writeFile("./dst/dir", obj_to_str(dir));

})();
