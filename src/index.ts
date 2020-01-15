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

import {bundle} from './bundle'

class BundleCommand extends Command {
	static description = 'Bundles several Lua files into a single file'

	static flags = {
		version: flags.version({char: 'v'}),
		help: flags.help({char: 'h'}),
		path: flags.string({char: 'p', description: 'Add a require path pattern', multiple: true, required: true}),
		output: flags.string({char: 'o', description: 'Bundle output path'}),
	}

	static args = [{name: 'file', required: true}]

	async run() {
		const {args, flags} = this.parse(BundleCommand)

		const content = bundle(args.file, flags.path)

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

export = BundleCommand
