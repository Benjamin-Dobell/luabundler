import {
	existsSync,
	readFileSync,
} from 'fs'

import {
	resolve as resolvePath,
} from 'path'

import {
	ModuleMap,
	NonLiteralRequire,
	processModule,
} from './module'

import {
	BUNDLED_MODULE,
	BUNDLED_REQUIRE,
	ROOT_MODULE,
} from '../runtime'

function bundleModule(name: string, content: string) {
	return `${BUNDLED_MODULE}("${name}", function(_ENV)\n${content}\nend)\n`
}

export function bundle(inputFilePath: string, paths: string[]): string {
	if (!existsSync(inputFilePath)) {
		throw new Error(inputFilePath + ' could not be found')
	}

	const bundledModules: ModuleMap = {}
	const nonLiteralsRequires: NonLiteralRequire[] = []

	processModule(ROOT_MODULE, inputFilePath, paths, bundledModules, nonLiteralsRequires)

	for (const nonLiteralRequire of nonLiteralsRequires) {
		const fileContents = readFileSync(nonLiteralRequire.filePath, 'utf8')
		const start = (nonLiteralRequire.expression as any).range[0]
		const prefix = fileContents.slice(0, start)
		const lineNumber = prefix.match(/\n/g)!.length + 1
		const lineCharacterIndex = prefix.lastIndexOf('\n') + 1
		console.warn(`WARNING: Non-literal found in ${inputFilePath} at ${lineNumber}:${start - lineCharacterIndex + 1}`)
	}

	let bundleContent = readFileSync(resolvePath(__dirname, '../runtime/header.lua')).toString()

	for (const [name, bundledModule] of Object.entries(bundledModules)) {
		bundleContent += bundleModule(name, bundledModule.content!)
	}

	bundleContent += 'return ' + BUNDLED_REQUIRE + '("' + ROOT_MODULE + '")'

	return bundleContent
}
