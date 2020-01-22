import {
	existsSync,
	mkdirSync,
	writeFileSync,
} from 'fs'

import {
	resolve as resolvePath,
	dirname,
} from 'path'

import {
	Command,
	flags,
} from '@oclif/command'

import {
	bundle,
	BundleOptions,
	Module,
} from 'luabundle'

import {Expression} from 'moonsharp-luaparse'

type LuaVersion = Required<BundleOptions>['luaVersion']

const luaVersions: LuaVersion[] = ['5.1', '5.2', '5.3', 'LuaJIT']

export default class BundleCommand extends Command {
	static description = 'Bundles a Lua file and its dependencies into a single file'

	static flags = {
		help: flags.help({char: 'h'}),
		isolate: flags.boolean({char: 'i', description: 'Disables require() fallback at runtime for modules not found in the bundle.', default: false}),
		lua: flags.enum<LuaVersion>({char: 'l', description: 'Lua syntax version', options: luaVersions, default: '5.3'}),
		output: flags.string({char: 'o', description: 'Bundle output path'}),
		path: flags.string({char: 'p', description: 'Add a require path pattern', multiple: true, required: true}),
		version: flags.version({char: 'v'}),
	}

	static args = [{name: 'file', required: true}]

	async run() {
		const {args, flags} = this.parse(BundleCommand)
		const options: BundleOptions = {
			luaVersion: flags.lua,
			isolate: flags.isolate,
			expressionHandler: (module: Module, expression: Expression) => {
				const start = expression.loc!.start
				console.warn(`WARNING: Non-literal require found in '${module.name}' at ${start.line}:${start.column}`)
			},
		}

		if (flags.path.length > 0) {
			options.paths = flags.path
		}

		const content = bundle(args.file, options)

		if (flags.output) {
			const resolvedPath = resolvePath(flags.output)
			const resolvedDir = dirname(resolvedPath)

			if (!existsSync(resolvedDir)) {
				mkdirSync(resolvedDir, {recursive: true})
			}

			writeFileSync(flags.output, content)
		} else {
			console.log(content)
		}
	}
}
