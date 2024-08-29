# LibellusSources

This is a collection of different sources for [https://github.com/qwertzuiopy/Libellus](Libellus), very much work in progress.

## Getting Started

Clone the test source and import 'de.hummdudel.Libellus.test.gresource' using Libellus.
To recompile the .gresource file use 'glib-compile-resources de.hummdudel.Libellus.test.gresource.xml'.
To reload the .gresource file in Libellus remove the source, *restart Libellus* and re-add it. Restarting Libellus is necessary because gjs caches .js files and there is currently no way to unregister GObject subclasses.

## Documentation

Each source consists of a gresource file with the following structure:
```
<?xml version="1.0" encoding="UTF-8"?>
<gresources>
  <gresource prefix="/de/hummdudel/Libellus/database">
    <file>manifest.json</file>
    <file>adapter_with_a_unique_name.js</file>
  </gresource>
</gresources>
```
The prefix is expected to be '/de/hummdudel/Libellus/database'.
'manifest.json' has to have the following structure:
```
{
  "name": ...,
  "adapter_name": "resource://de/hummdudel/Libellus/database/adapter_with_a_unique_name.js"
}
```
'adapter_name' should point to the adapter .js file. The filename has to be unique for this source, *otherwise gjs will cache the file and switching between sources won't work.*

This adapter.js file is expected to export the following things:

```
export const ident = "test"; // A unique identifier for this source

// Receives an array of SearchResults.
// Should append all SearchResults of this source to the array and return it.
// Each SearchResult accepts an object that has to at least
// contain a name (shown as the title) and an url (shown as the subtitle).
export const get_search_results = (_) => {
  return [
    new SearchResult( { name: "hallo", url: "test" } )
  ];
};

// Should return a subclass of 'ResultPage' given
// the data of the selected SearchResult and the navigation view.
// ResultPage expects data.name to be a string shown as the title of the page
// and data.url to be a string used to identify this page for bookmarking.
export const resolve_link = (data, navigation_view) => {
  return new ResultPage(get_sync(data.url), navigation_view);
}

// Should return page data for a given url. The data has to have at least a name and an url.
export const get_sync = (url) => {
  return { name: "hello" };
}

// Should return data / an image for the given url (used by 'Image')
export const get_any_sync = (url) => {
  return null;
};
// Should return data / an image for the given url to the callback (used by 'ImageAsync')
export const get_any_async = (url, callback) => {
  callback(null);
};

// Filter definitions
export const filter_options = {
  Filter1: {
    title: "yay", // The title shown in the UI.
    choices: [ // If no choices are present the second UI page is ommited.
      // A multiple-choice filter, 'selected' will be set to the selected option.
      // If this choice is optional, an "any" option should be added to 'content'.
      { title: "test", content: [ "any", "1", "2", "3" ], selected: "any" },
      // A range filter, 'value' and 'enabled' will be set accordingly.
      { title: "test", min: 1, max: 3, value: 0, enabled: false },
      // ...
    ],

    // 'url' is the url of the current SearchResult,
    // 'o' is a reference to the current filter, in this case filter_options["Filter1"]
    // Should return 'true' if the SearchResult should be displayed, otherwise 'false'
    func: (url, o) => {
      return false;
    },
  },
// ...
}

// Should return any string.
export const ping = () => {
  return "pspsps";
}

```
### Imports

'ResultPage' and 'SearchResult' can be imported from results.js:
```
import { ResultPage, SearchResult } from "resource://de/hummdudel/Libellus/js/results.js";
```
There are also various Modules available in modules.js, such as ModuleText, BigDiv, ImageAsync or Card:
```
import { BigDiv, Card, ModuleText, ImageAsync, ... } from "resource://de/hummdudel/Libellus/js/modules.js";
```
To import more custom .js files simply list them in the gresource.xml file and import them:
.gresource.xml:
```
<?xml version="1.0" encoding="UTF-8"?>
<gresources>
  <gresource prefix="/de/hummdudel/Libellus/database">
    <file>manifest.json</file>
    <file>adapter_for_this_source.js</file>
    <file>custom_file.js</file>
    ...
  </gresource>
</gresources>
```

.js:
```
import { ... } from './file.js';
```




