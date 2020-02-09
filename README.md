luabundler
==========

CLI tool for bundling several Lua files into a single file.

If you're looking for an API, see [luabundle](https://github.com/Benjamin-Dobell/luabundle)

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

## bundle

The `bundle` command takes an input Lua file, and recursively collects all the `require()`d modules and bundles them into a single output bundle.

```bash
luabundler bundle input.lua -p "/path/to/lua/?.lua" -o bundle.lua
```

If you don't specify an output file (`-o`), the resultant bundle will be printed to your terminal.

### Search Paths (`-p`)

In order to know where to look for required files, you must provide one or more [search path patterns](https://www.lua.org/pil/8.1.html).

In addition to allowing you to add directories to search within, the pattern format allows you to configure supported file extensions as well.

For example, it's fairly common practice for Lua scripts written for Tabletop Simulator to use the `.ttslua` extension:

```bash
luabundler bundle input.lua -p "/path/to/lua/?.lua" -p "/path/to/mod/?.ttslua"  -o bundle.lua
```

### Additional Options

Additional bundle options are described with:

```bash
luabundler bundle --help
```

## unbundle

The `unbundle` command takes an input bundle, and splits it up into its original modules.

```bash
luabundler unbundle bundle.lua -o original_input.lua -m modules/
```

You may omit the `-m` option in order to simply output the root module and ignore all its `require()`'d dependencies i.e. if you already have them on disk.

### Additional Options

Additional unbundle options are described with:

```bash
luabundler unbundle --help
```
