import {
	existsSync,
	mkdirSync,
	writeFileSync,
} from 'fs'

import {
	dirname,
	resolve as resolvePath,
	sep as pathSeparator,
} from 'path'

import {
	Command,
	flags,
} from '@oclif/command'

import {
	Module,
	unbundle,
	UnbundleOptions,
	unbundleString,
} from 'luabundle'

import {
	readStdin,
} from '../util'

export default class UnbundleCommand extends Command {
	static description = 'Unbundles a Lua bundle into individual files'

	static flags: flags.Input<any> = {
		help: flags.help({char: 'h'}),
		modules: flags.string({char: 'm', description: 'Output directory path where modules should be written.'}),
		extension: flags.string({char: 'e', description: 'File extension of output modules. Only relevant when --modules (-m) is specified.', default: 'lua'}),
		output: flags.string({char: 'o', description: 'Output path of the root (entry point) module.'}),
		version: flags.version({char: 'v'}),
	}

	static args = [
		{
			name: 'file',
			required: false,
			description: 'Lua bundle file path. May be omitted to read from stdin instead.',
		},
	]

	async run() {
		const {args, flags} = this.parse(UnbundleCommand)
		const {extension, modules, output} = flags

		const options: UnbundleOptions = {
			rootOnly: !modules,
		}

		let unbundled

		if (!args.file || args.file === '-') {
			unbundled = unbundleString(await readStdin(), options)
		} else {
			unbundled = unbundle(args.file, options)
		}

		if (modules) {
			const modulesDir = resolvePath(modules)

			if (!existsSync(modulesDir)) {
				mkdirSync(modulesDir, {recursive: true})
			}

			for (const module of Object.values<Module>(unbundled.modules)) {
				if (module.name !== unbundled.metadata.rootModuleName) {
					const modulePath = resolvePath(modulesDir, module.name).replace(/\./g, pathSeparator) + (extension ? '.' + extension : '')
					const moduleDir = dirname(modulePath)

					if (!existsSync(moduleDir)) {
						mkdirSync(moduleDir, {recursive: true})
					}

					writeFileSync(modulePath, module.content)
				}
			}
		}

		const rootModule = unbundled.modules[unbundled.metadata.rootModuleName]

		if (output) {
			const outputPath = resolvePath(output)
			const outputDir = dirname(outputPath)

			if (!existsSync(outputDir)) {
				mkdirSync(outputDir, {recursive: true})
			}

			writeFileSync(outputPath, rootModule.content)
		} else {
			console.log(rootModule.content)
		}
	}
}
