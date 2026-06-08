# Sources for Libellus

for the programm itself, see https://github.com/qwertzuiopy/Libellus

## format
all of the following files have to be written in a json-like syntax, but without the `"`s:

```
value : '{' <ident> ':' value ',' ... '}'
      | '[' value ',' ... ']'
      | '"' <text> '"'
      | ('-') <digits> ('.' <digits>)
```
which looks almost like json in practice:
```
{
  key: [ "string1", "string2", "string3"],
  number: 42.0
}
```
to specify newlines in strings you currently have to just include a newline in the file:
```
"a multiline
string!"
```

## file structure
```
.source/:
      .desc
      .dir
      .filter
      .bookmarks
      .data/
            .acid-arrow
            ...
```
each source consists of a few specially named files and a lot of data files.

- ./bookmark: the content must be `[]`. the users bookmarks are stored here.
- ./desc: the content must be `{ name: "Dungeons and Dragons: Player's Handbook" }` with a name of your choosing.
- 
### the filter file
./filter: the content is an array of filter pages, where each filter page consists of the following:
  - title (string), which is shown in the ui
  - value (string), which is checked against the category field of each potential search result
  - dir: this is the directory where all pages specified in this source are listed.
    has to have the following form:
```
[
  {
    id: "acid-arrow",
    name: "Acid Arrow",
    category: "spell",

    level: 2,
    class: ["wizard"],
    school: "evocation",
    ...
  },
...
]
```
the id (string) field must be unique to this page. Other pages may link back to this page using the syntax `@acid-arrow` in place of a label.
the name (string) field specifies the title displayed in the listing.
the category (string) field specifies the subtitle displayed in the listing and is also used for filtering.
all other fields are optional and may be referred to by filters.

  - filters (array), where all additional filters in this category are listet.
    - possible filters are:
```
{
  id: "Dropdown",
  title: "School",
  field: "school",
  options: [
    { value: "abjuration", title: "Abjuration" },
    ...
  ]
```
which checks wether the value (string) field of the selected option matches the value in the field `field` of each search result. An `any` entry is automatically added to the list of options.

```
{
  id: "ArrayDropdown",
  title: "Class",
  field: "class",
  options: [
    { value: "barbarian", title: "Barbarian" },
    ...
  ]
```
which works exactly the same as the Dropdown filter excepct the field specified by `field` is expected to be an array of strings, and it is checked wether the selected option is contained in it for each search result.

```
      {
        id: "Range",
        title: "Spell Level",
        field: "level",
        min: 0,
        max: 9
      }
```
 which checks wether the selected number matches the one specified by `field` for each search result.

 ### the data directory
for each page specified in the dir file there must be a file named after the id in the dir file here. For example, if `acid-arrow` was named in the dir file, there must be a file named `acid-arrow` here.

In these files te actuall contents of the page are written. The syntax is as follows:
```
{
  id: "acid-arrow",
  name: "Acid Arrow",
  category: "spell",
  content: [
    { id: "Title", content: "This is a title!" },
    { id: "Subtitle", content: "This is a subtitle!" },
    { id: "StatGrid", content: [ { title: "Level", content: "1" }, ...] },
    { id: "LinkList", content: [ { id: "@sword", content: "once"}, {id: "@arrow", content: "20 times"}, ...]},
    { id: "MultiText", content: ["text1", "text2", ...]},
    { id: "Table", content: [["one", "two"], ["three", "four"], ...]},
    { id: "StatList", content: [ { title: "Languages", content: ["Common", "Elven", ... ] }, ... ] },
    { id: "TitledText", content: [ { title:"titled", content: text!" } ] },
    { id: "Image", url: "https://blab.blib.blub/image.png" }
    { id: "Cycler", title: "Stats on Level", max: 20, content: [
      [
        { id: "Title", content: "displayed on level 1" }
      ], [
        { id: "Title", content: "displayed on level 2" }
      ]
    ]
  ]
}
```
content is basically a list of modules, which can be rearanged and added as needed. Almost any time there is a field which containes a string shown to the user, you can put `@id` in it to display a link to another page.
