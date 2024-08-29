import GObject from 'gi://GObject';
import { ResultPage, SearchResult } from "resource://de/hummdudel/Libellus/js/results.js";
import { Card, BigDiv } from "resource://de/hummdudel/Libellus/js/modules.js";

// a unique identifier per source
export const ident = "test";

export const testSearchResult = GObject.registerClass({
  GTypeName: 'testSearchResult',
}, class extends ResultPage {
  constructor(data, navigation_view) {
    super(data, navigation_view);
    log(data);
    let cards = [];
    cards.push(new Card("is", data.is));
    this.wrapper.append(new BigDiv(cards));
  }
});

// Should append all search results to the given array and return it.
export const get_search_results = (results) => {
  results = results.concat(([{ name: "hello :3", url: "cat" }, { name: "hi :3", url: "puppy" }]).map((a) => new SearchResult(a)));
  return results;
};

// Should return a Subclass of 'ResultPage' given the data from the selected search result
export const resolve_link = (data, navigation_view) => {
  let page_data = get_sync(data.url);
  let page = new testSearchResult(page_data, navigation_view);
  return page;
};

// Should return the page data for a given url (whatever an url is in this source)
export const get_sync = (url) => {
  switch (url) {
    case "cat":
      return { name: "cat", is: "cute" };
    case "puppy":
      return { name: "puppy", is: "adorable" };
  }
};

// Should return data / an image for the given url (used by 'Image')
export const get_any_sync = (_url) => {
  return null;
};
// Should return data / an image for the given url to the callback (used by 'ImageAsync')
export const get_any_async = (_url, callback) => {
  callback(null);
};

// Filter definitions
export const filter_options = {
  Thingies: {
    title: "thingy",
    choices: [
      { title: "hi hello hi", content: ["cat", "puppy", "none"], selected: "cat" },
      { title: "hi hello hi", min: 0, max: 10, value: 5, enabled: false },
    ],
    // 'url' is the url of the current SearchResult,
    // 'o' is a reference to the current filter, in this case filter_options[name]
    // should return 'true' if the SearchResult should be displayed, otherwise 'false'
    func: (url, o) => {
      return url.includes(o.choices[0].selected.toLowerCase());
    },
  },
};


export const ping = () => {
  return "meow";
};
