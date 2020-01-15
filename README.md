luabundler
==========

Bundles several Lua files into a single file.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/luabundler.svg)](https://npmjs.org/package/luabundler)
[![Downloads/week](https://img.shields.io/npm/dw/luabundler.svg)](https://npmjs.org/package/luabundler)
[![License](https://img.shields.io/npm/l/luabundler.svg)](https://github.com/Benjamin-Dobell/luabundler/blob/master/package.json)

* [Installation](#installation)
* [Usage](#usage)

# Installation
```bash
npm install -g luabundler
```

# Usage
luabundler takes an input Lua file, and recursively collects all the `require()`d modules and bundles them into a single output bundle.

```bash
luabundler input.lua -p "/path/to/lua/?.lua" -o bundle.lua
```

If you don't specify an output file (`-o`), the resultant bundle will be printed to your terminal.

## Search Paths

In order, to know where to look for required files, you must provide one or more [search path patterns](https://www.lua.org/pil/8.1.html).

In addition to allowing you to add directories to search within, the pattern format allows you to configure supported file extensions as well.

For example, it's fairly common practice for Lua scripts written for Tabletop Simulator to use the `.ttslua` extension:


```bash
luabundler input_file.lua -p "/path/to/lua/?.lua" -p "/path/to/mod/?.ttslua"  -o output_bundle.lua
```
