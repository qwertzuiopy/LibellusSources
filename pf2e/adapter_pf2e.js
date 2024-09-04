
/* pf2e.js
 *
 * Copyright 2024 Michael Hammer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */


import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { ResultPage, SearchResult } from "resource://de/hummdudel/Libellus/js/results.js";
import { Card, BigDiv, ImageAsync, ModuleStatListRow } from "resource://de/hummdudel/Libellus/js/modules.js";
import { API } from "./api_pf2e.js";


export const ident = "pf2e";

export const pf2eModuleDescription = GObject.registerClass({
  GTypeName: 'pf2eModuleDescription',
}, class extends Gtk.ListBox {
  constructor(data) {
    super({ css_classes: ["boxed-list"] });
    for (let i in data) {
      if (data[i].type == "text") {
        this.append(new Gtk.ListBoxRow({
          activatable: false, selectable: false,
          halign: Gtk.Align.FILL,
          child: new Gtk.Label({
            label: data[i].text,
            wrap: true,
            margin_top: 15, margin_start: 10, margin_end: 10, margin_bottom: 15,
            hexpand: true,
            selectable: true,
            use_markup: true,
          }),
        }));
      }
    }
  }
});

const b_to_s = (bool) => {
  return bool ? "yes" : "no";
}


export const pf2eSearchResultPageSpell = GObject.registerClass({
  GTypeName: 'pf2eSearchResultPageSpell',
}, class extends ResultPage {
  constructor(data, navigation_view) {
    super(data, navigation_view);
    let cards = [];

    this.wrapper.append(new ImageAsync(this.data.img.replace("icons", "images")));

    // TODO damage, defense, heightening, publication, requirements, rules
    const is_cost_long = this.data.system.cost.value.length > 10;
    cards.push(new Card("Level", this.data.system.level.value + ""));
    cards.push(new Card("Rarity", this.data.system.traits.rarity));
    if (this.data.system.counteraction !== undefined) cards.push(new Card("Counteraction", b_to_s(this.data.system.counteraction)));
    if (this.data.system.cost && this.data.system.cost.value != "" && !is_cost_long) cards.push(new Card("Cost", this.data.system.cost.value));
    if (this.data.system.area) cards.push(new Card("Area", this.data.system.area.value + "ft. " + this.data.system.area.type));
    if (this.data.system.range && this.data.system.range.value != "") cards.push(new Card("Range", this.data.system.range.value));
    if (this.data.system.time.value == "reaction") {
      cards.push(new Card("Time", this.data.system.time.value));
    } else {
      cards.push(new Card("Time", this.data.system.time.value + " actions"));
    }

    this.wrapper.append(new BigDiv(cards));

    let empty = true;
    this.statrows = new Gtk.ListBox({ css_classes: ["boxed-list"] });
    if (this.data.system.duration.sustained) {
      this.statrows.append(new ModuleStatListRow("Duration", [this.data.system.duration.value]));
      empty = false;
    }
    if (is_cost_long) {
      this.statrows.append(new ModuleStatListRow("Cost", [this.data.system.cost.value]));
      empty = false;
    }
    if (this.data.system.traits.traditions.length > 0) {
      this.statrows.append(new ModuleStatListRow("Traditions", this.data.system.traits.traditions));
      empty = false;
    }
    if (this.data.system.target && this.data.system.target.value != "") {
      this.statrows.append(new ModuleStatListRow("Target", [this.data.system.target.value]));
      empty = false;
    }
    if (this.data.system.traits.value.length > 0) {
      this.statrows.append(new ModuleStatListRow("Kind", this.data.system.traits.value));
      empty = false;
    }
    if (!empty) {
      this.wrapper.append(this.statrows);
    }

    this.wrapper.append(new pf2eModuleDescription(this.data.system.description.value));
  }
});

export const get_search_results = (results) => {
  results = results.concat(get_sync("Compendium.pf2e.spells").map((a) => new SearchResult(a)));
  return results;
}

export const resolve_link = (data, navigation_view) => {
  var page_data = get_sync(data.url);
  var page = null;
  page = new pf2eSearchResultPageSpell(page_data, navigation_view);
  return page;
}

export const get_sync = (url) => {
  let parts = url.split(".");
  let category = parts[2];
  if (parts.length == 5) {
    let item = parts[4].replace(" ", "-").toLowerCase();
    return API[category][item];
  } else if (parts.length == 3) {
    return Object.values(API[category]);
  }

}

const Soup = imports.gi.Soup;
const session = Soup.Session.new();

export const get_any_sync = (url) => {
  let msg = Soup.Message.new('GET', 'https://demo.foundryvtt.com/' + url);
  return session.send_and_read(msg, Gio.Cancellable.new()).get_data();
}

export const get_any_async = (url, callback) => {
  let msg = Soup.Message.new('GET', 'https://demo.foundryvtt.com/' + url);
  session.send_and_read_async(msg, 1, Gio.Cancellable.new(), (a, b, c) => { callback(session.send_and_read_finish(b).get_data()); });
}


export const filter_options = {
}


export const ping = () => {
  return "meow";
}
